#!/usr/bin/env bash
set -Eeuo pipefail

if [[ $EUID -ne 0 ]]; then
  echo "Run this repair with sudo." >&2
  exit 1
fi

domain=cal.wetcm.org.cn
renewal_config=/etc/letsencrypt/renewal/cal.wetcm.org.cn.conf
certificate=/etc/letsencrypt/live/cal.wetcm.org.cn/fullchain.pem
deploy_hook=/etc/letsencrypt/renewal-hooks/deploy/wetcm-reload-nginx
nginx_dump=$(mktemp)
hook_temp=$(mktemp)
verification_error=$(mktemp)
trap 'rm -f "$nginx_dump" "$hook_temp" "$verification_error"' EXIT

for command_name in certbot nginx openssl curl systemctl; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Required command is missing: $command_name" >&2
    exit 1
  fi
done

if [[ ! -f "$renewal_config" || ! -s "$certificate" ]]; then
  echo "The existing Certbot certificate lineage for $domain was not found." >&2
  exit 1
fi

if ! certbot plugins 2>/dev/null | grep -Eq '^[[:space:]]*\*[[:space:]]+nginx$'; then
  echo "The Certbot Nginx plugin is not installed." >&2
  exit 1
fi

if ! nginx -T >"$nginx_dump" 2>&1; then
  cat "$nginx_dump" >&2
  exit 1
fi
if ! grep -Eq 'server_name[[:space:]]+cal\.wetcm\.org\.cn;' "$nginx_dump"; then
  echo "Nginx has no server_name entry for $domain." >&2
  exit 1
fi

printf '%s\n' \
  '#!/usr/bin/env bash' \
  'set -e' \
  'nginx -t' \
  'systemctl reload nginx' > "$hook_temp"
install -d -o root -g root -m 0755 /etc/letsencrypt/renewal-hooks/deploy
install -o root -g root -m 0755 "$hook_temp" "$deploy_hook"

echo "Reconfiguring $domain to use the Certbot Nginx authenticator..."
certbot reconfigure --cert-name "$domain" --nginx --non-interactive

echo "Replacing the expired production certificate..."
certbot renew --cert-name "$domain" --force-renewal --non-interactive

if ! grep -Eq '^authenticator[[:space:]]*=[[:space:]]*nginx[[:space:]]*$' "$renewal_config"; then
  echo "Certbot did not persist the Nginx authenticator in $renewal_config." >&2
  exit 1
fi

nginx -t
systemctl reload nginx

echo "Testing the saved renewal configuration against Let's Encrypt staging..."
certbot renew --cert-name "$domain" --dry-run --non-interactive

if ! openssl x509 -in "$certificate" -noout -checkend 2592000; then
  echo "The renewed certificate is not valid for at least 30 days." >&2
  exit 1
fi

verified=0
for attempt in {1..15}; do
  : > "$verification_error"
  if curl \
    --noproxy '*' \
    --fail \
    --silent \
    --show-error \
    --head \
    --connect-timeout 2 \
    --max-time 4 \
    --output /dev/null \
    --resolve "$domain:443:127.0.0.1" \
    "https://$domain/" \
    2>"$verification_error"; then
    verified=1
    break
  fi
  if [[ $attempt -lt 15 ]]; then
    sleep 1
  fi
done

if [[ $verified -ne 1 ]]; then
  echo "The renewed certificate was saved, but local HTTPS verification failed:" >&2
  cat "$verification_error" >&2
  exit 1
fi

echo "Certificate repair completed successfully:"
openssl x509 -in "$certificate" -noout -subject -issuer -dates -ext subjectAltName
