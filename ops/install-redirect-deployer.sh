#!/usr/bin/env bash
set -Eeuo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Run this installer with sudo." >&2
  exit 1
fi

deploy_user=${SUDO_USER:-}
if [[ -z "$deploy_user" || "$deploy_user" == root ]]; then
  echo "Unable to determine the non-root SSH user. Run: sudo bash $0" >&2
  exit 1
fi
if ! id "$deploy_user" >/dev/null 2>&1; then
  echo "Unknown deployment user: $deploy_user" >&2
  exit 1
fi

source_file=/tmp/managed-redirects/deploy-managed-redirects
target_file=/usr/local/sbin/deploy-managed-redirects
sudoers_file=/etc/sudoers.d/managed-redirects-deployer
sudoers_temp=$(mktemp)
trap 'rm -f "$sudoers_temp"' EXIT

if [[ ! -f "$source_file" || -L "$source_file" ]]; then
  echo "Missing or unsafe deployer: $source_file" >&2
  exit 1
fi

install -o root -g root -m 0755 "$source_file" "$target_file"
printf '%s ALL=(root) NOPASSWD: %s\n' "$deploy_user" "$target_file" > "$sudoers_temp"
chmod 0440 "$sudoers_temp"
visudo -cf "$sudoers_temp"
install -o root -g root -m 0440 "$sudoers_temp" "$sudoers_file"

echo "Installed the redirect deployer for GitHub Actions user: $deploy_user"
echo "Allowed passwordless command: sudo -n $target_file"
