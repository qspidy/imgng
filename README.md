# nginx-image-host

Self-hosted image hosting with nginx + OpenResty/Lua.

## Features

- Auto file type detection | Image optimization (ImageMagick)
- Hotlink protection | Rate limiting (10/min)
- Secure permissions (600) | HTTPS | Configurable paths

---

## Choose Your Setup

### Option 1: Add to Existing Nginx

You already have nginx running with SSL configured. See [INSTALL.md](INSTALL.md) for copy-paste snippets.

```bash
# Quick start
apt-get install nginx-extras imagemagick
mkdir -p /var/www/images /tmp/nginx_upload
chown -R www-data:www-data /var/www/images /tmp/nginx_upload
chmod 755 /var/www/images /tmp/nginx_upload
echo "upload:$(openssl passwd -apr1 upload)" | tee /etc/nginx/.htpasswd
# Then add snippets from INSTALL.md to your config
```

### Option 2: Fresh OS Installation

New server, install everything from scratch.

```bash
# 1. Install dependencies
apt-get update && apt-get install -y nginx-extras imagemagick

# 2. Use full config (includes SSL, HTTP redirect)
cp img-host-full.conf /etc/nginx/sites-available/img-host
ln -s /etc/nginx/sites-available/img-host /etc/nginx/sites-enabled/

# 3. Edit config: replace example.com, __IMAGE_PATH__, __UPLOAD_PATH__, __STORAGE_PATH__, SSL cert paths

# 4. Setup directories
mkdir -p /var/www/images /tmp/nginx_upload
chown -R www-data:www-data /var/www/images /tmp/nginx_upload
chmod 755 /var/www/images /tmp/nginx_upload
echo "upload:$(openssl passwd -apr1 upload)" | tee /etc/nginx/.htpasswd

# 5. Get SSL cert (see ACME.md for details)
acme.sh --issue -d example.com --standalone
acme.sh --install-cert -d example.com --ecc \
  --fullchain-file /etc/ssl/example.com.pem \
  --key-file /etc/ssl/example.com.key

# 6. Enable and start
rm /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
```

---

## Configuration

| Placeholder | Default |
|-------------|---------|
| `__IMAGE_PATH__` | `/images/` |
| `__UPLOAD_PATH__` | `/upload` |
| `__STORAGE_PATH__` | `/var/www/images/` |

## SSL Certificate

See [ACME.md](ACME.md) for details (standalone, webroot, or DNS mode).

## Docker

```bash
IMAGE_PATH=/i/ UPLOAD_PATH=/api/upload STORAGE_PATH=/data/img docker-compose up -d
```

| Env Var | Default |
|---------|---------|
| `DOMAIN` | localhost |
| `IMAGE_PATH` | /images/ |
| `UPLOAD_PATH` | /upload |
| `STORAGE_PATH` | /var/www/images |
| `UPLOAD_USER` | upload |
| `UPLOAD_PASS` | upload |

## Backup/Restore

**Local:**
```bash
tar -czf backup.tar.gz /var/www/images
tar -xzf backup.tar.gz -C /
```

**Remote (backup server pulls):**
```bash
# Backup
ssh img-server "tar -czf - /var/www/images" > /var/backups/images-$(date +%Y%m%d).tar.gz

# Restore
cat /var/backups/images-20250131.tar.gz | ssh img-server "tar -xzf - -C /"
```

**Automated cron on backup server (daily, keep 7 days):**
```bash
# /usr/local/bin/pull-images.sh
BACKUP_DIR="/var/backups"
ssh img-server "tar -czf - /var/www/images" > "$BACKUP_DIR/images-$(date +%Y%m%d).tar.gz"
find "$BACKUP_DIR" -name "images-*.tar.gz" -mtime +7 -delete
```

```bash
# /etc/cron.d/img-backup
0 2 * * * root /usr/local/bin/pull-images.sh
```

MIT License
