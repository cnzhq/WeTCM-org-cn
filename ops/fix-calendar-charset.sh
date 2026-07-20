#!/usr/bin/env bash
set -Eeuo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Run this fix with sudo." >&2
  exit 1
fi

domain=cal.wetcm.org.cn
enabled_config=/etc/nginx/sites-enabled/calendar
backup_dir=/etc/nginx/backups
temporary_config=$(mktemp)
verification_headers=$(mktemp)
verification_error=$(mktemp)
backup_file=""
changed=0
trap 'rm -f "$temporary_config" "$verification_headers" "$verification_error"' EXIT

for command_name in nginx systemctl curl readlink awk grep install cp date; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Required command is missing: $command_name" >&2
    exit 1
  fi
done

if [[ ! -e "$enabled_config" ]]; then
  echo "Nginx calendar configuration does not exist: $enabled_config" >&2
  exit 1
fi

config_file=$(readlink -f "$enabled_config")
if [[ ! -f "$config_file" || "$config_file" != /etc/nginx/* ]]; then
  echo "Refusing to edit unexpected configuration path: $config_file" >&2
  exit 1
fi

location_count=$(grep -Ec '^[[:space:]]*location[[:space:]]+/[[:space:]]*\{[[:space:]]*$' "$config_file" || true)
if [[ $location_count -ne 1 ]]; then
  echo "Expected exactly one 'location /' block, found $location_count." >&2
  exit 1
fi

has_utf8_charset=0
if awk '
  /^[[:space:]]*location[[:space:]]+\/[[:space:]]*\{/ { in_root_location = 1; next }
  in_root_location && /^[[:space:]]*charset[[:space:]]+utf-8[[:space:]]*;/ { found = 1 }
  in_root_location && /^[[:space:]]*\}/ { in_root_location = 0 }
  END { exit(found ? 0 : 1) }
' "$config_file"; then
  has_utf8_charset=1
fi

rollback() {
  if [[ $changed -eq 1 && -n "$backup_file" && -f "$backup_file" ]]; then
    echo "Charset verification failed; restoring $backup_file." >&2
    cp -a "$backup_file" "$config_file"
    nginx -t && systemctl reload nginx || true
  fi
}
trap rollback ERR

if [[ $has_utf8_charset -eq 0 ]]; then
  install -d -o root -g root -m 0755 "$backup_dir"
  backup_file="$backup_dir/calendar.charset-$(date -u +%Y%m%dT%H%M%SZ).conf"
  cp -a "$config_file" "$backup_file"

  awk '
    !inserted && /^[[:space:]]*location[[:space:]]+\/[[:space:]]*\{/ {
      print
      print "        charset utf-8;"
      inserted = 1
      next
    }
    { print }
    END { if (!inserted) exit 42 }
  ' "$config_file" > "$temporary_config"

  cp "$temporary_config" "$config_file"
  changed=1
  echo "Added 'charset utf-8;' to $config_file."
else
  echo "The calendar root location already declares UTF-8; no file change is needed."
fi

nginx -t
systemctl reload nginx

verified=0
for attempt in {1..15}; do
  : > "$verification_headers"
  : > "$verification_error"
  if curl \
    --noproxy '*' \
    --fail \
    --silent \
    --show-error \
    --head \
    --connect-timeout 2 \
    --max-time 4 \
    --dump-header "$verification_headers" \
    --output /dev/null \
    --resolve "$domain:443:127.0.0.1" \
    "https://$domain/" \
    2>"$verification_error" && \
    grep -Eiq '^content-type:[[:space:]]*text/html;[[:space:]]*charset=utf-8' "$verification_headers"; then
    verified=1
    break
  fi
  if [[ $attempt -lt 15 ]]; then
    sleep 1
  fi
done

if [[ $verified -ne 1 ]]; then
  echo "The local directory response did not declare UTF-8 after 15 attempts." >&2
  cat "$verification_headers" >&2
  cat "$verification_error" >&2
  false
fi

trap - ERR
echo "Calendar directory charset fix completed successfully:"
cat "$verification_headers"
if [[ -n "$backup_file" ]]; then
  echo "Backup retained at: $backup_file"
fi
