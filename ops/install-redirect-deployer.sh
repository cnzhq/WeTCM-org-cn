#!/usr/bin/env bash
set -Eeuo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Run this installer with sudo." >&2
  exit 1
fi

if [[ $# -gt 1 ]]; then
  echo "Usage: sudo bash $0 [deployment-user]" >&2
  exit 1
fi

recorded_user_file=/tmp/managed-redirects/ssh-user
if [[ $# -eq 1 ]]; then
  deploy_user=$1
elif [[ -s "$recorded_user_file" && ! -L "$recorded_user_file" ]]; then
  IFS= read -r deploy_user < "$recorded_user_file"
else
  deploy_user=${SUDO_USER:-}
fi

if [[ -z "$deploy_user" || "$deploy_user" == root ]]; then
  echo "Unable to determine a non-root GitHub Actions SSH user." >&2
  echo "Run: sudo bash $0 <SERVER_USER>" >&2
  exit 1
fi
if [[ ! "$deploy_user" =~ ^[a-z_][a-z0-9_-]*\$?$ ]]; then
  echo "Invalid deployment username: $deploy_user" >&2
  exit 1
fi
if ! id -u "$deploy_user" >/dev/null 2>&1; then
  echo "Unknown deployment user: $deploy_user" >&2
  exit 1
fi

source_file=/tmp/managed-redirects/deploy-managed-redirects
target_file=/usr/local/sbin/deploy-managed-redirects
sudoers_file=/etc/sudoers.d/99-managed-redirects-deployer
legacy_sudoers_file=/etc/sudoers.d/managed-redirects-deployer
sudoers_temp=$(mktemp)
sudoers_backup=$(mktemp)
had_sudoers=0
trap 'rm -f "$sudoers_temp" "$sudoers_backup"' EXIT

if [[ ! -f "$source_file" || -L "$source_file" ]]; then
  echo "Missing or unsafe deployer: $source_file" >&2
  exit 1
fi

install -o root -g root -m 0755 "$source_file" "$target_file"
printf '%s ALL=(root) NOPASSWD: %s\n' "$deploy_user" "$target_file" > "$sudoers_temp"
chmod 0440 "$sudoers_temp"
visudo -cf "$sudoers_temp"

if [[ -f "$sudoers_file" ]]; then
  cp "$sudoers_file" "$sudoers_backup"
  had_sudoers=1
fi
install -o root -g root -m 0440 "$sudoers_temp" "$sudoers_file"
if ! visudo -c; then
  if [[ $had_sudoers -eq 1 ]]; then
    install -o root -g root -m 0440 "$sudoers_backup" "$sudoers_file"
  else
    rm -f "$sudoers_file"
  fi
  echo "The full sudoers configuration did not validate; restored the previous state." >&2
  exit 1
fi

if ! sudo -u "$deploy_user" sudo -n -l "$target_file" >/dev/null; then
  if [[ $had_sudoers -eq 1 ]]; then
    install -o root -g root -m 0440 "$sudoers_backup" "$sudoers_file"
  else
    rm -f "$sudoers_file"
  fi
  echo "The NOPASSWD policy did not match user $deploy_user; restored the previous state." >&2
  exit 1
fi

rm -f "$legacy_sudoers_file"

echo "Installed the redirect deployer for GitHub Actions user: $deploy_user"
echo "Allowed passwordless command: sudo -n $target_file"
