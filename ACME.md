# SSL Certificate with acme.sh

## Install

```bash
curl https://get.acme.sh | sh
source ~/.bashrc
```

## Issue Certificate

**Standalone** (no web server running):
```bash
acme.sh --issue -d example.com --standalone
```

**Webroot** (nginx already running):
```bash
acme.sh --issue -d example.com --webroot /var/www/html
```

**DNS** (for wildcard certs):
```bash
# Cloudflare
export CF_Token="your_api_token"
acme.sh --issue -d example.com -d "*.example.com" --dns dns_cf

# See https://github.com/acmesh-official/acme.sh/wiki/dnsapi for more providers
```

## Install Certificate

**For Docker:**
```bash
acme.sh --install-cert -d example.com \
  --ecc \
  --fullchain-file ./certs/cert.pem \
  --key-file ./certs/key.pem \
  --reloadcmd "docker restart img-host"
```

**For manual nginx (system):**
```bash
acme.sh --install-cert -d example.com \
  --ecc \
  --fullchain-file /etc/ssl/example.com.pem \
  --key-file /etc/ssl/example.com.key \
  --reloadcmd "nginx -s reload"
```

Certificates auto-renew every 60 days.

## Troubleshooting

```bash
acme.sh --info -d example.com --ecc      # Check cert info
acme.sh --renew -d example.com --ecc --force  # Force renew
```
