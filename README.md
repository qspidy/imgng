# nginx-image-host

[![nginx](https://img.shields.io/badge/nginx-OpenResty%2FLua-green)](https://openresty.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-Ready-blue)](https://www.docker.com/)
[![Security](https://img.shields.io/badge/security-hotlink--protection-green)]()
[![Rate Limiting](https://img.shields.io/badge/rate--limit-10%2Fmin-orange)]()

A self-hosted image hosting solution built on nginx with OpenResty/Lua extensions. Lightweight, secure, and production-ready alternative to cloud image hosting services.

## ✨ Features

- 🖼️ Auto file type detection (MIME-based validation)
- ⚡ Image optimization using ImageMagick
- 🔒 Hotlink protection via referer checking
- 🛡️ Rate limiting (10 requests/min per IP)
- 🔐 Basic authentication for upload endpoint
- 🔑 HTTPS ready with SSL/TLS support
- ⚙️ Configurable paths and environment variables
- 🐳 Docker support with Alpine Linux

## 🚀 Quick Start

### Option 1: Add to Existing Nginx

You already have nginx running with SSL configured. Copy-paste the snippets from [INSTALL.md](INSTALL.md) into your nginx configuration.

```bash
# Install dependencies
apt-get install nginx-extras imagemagick

# Create directories
mkdir -p /var/www/images /tmp/nginx_upload
chown -R www-data:www-data /var/www/images /tmp/nginx_upload
chmod 755 /var/www/images /tmp/nginx_upload

# Setup authentication
echo "upload:$(openssl passwd -apr1 upload)" | tee /etc/nginx/.htpasswd

# Then add snippets from INSTALL.md to your config
```

### Option 2: Fresh OS Installation

New server? Install everything from scratch.

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

## 🐳 Docker Deployment

### Quick Start with Docker

```bash
# Using Docker Compose (Recommended)
IMAGE_PATH=/i/ UPLOAD_PATH=/api/upload STORAGE_PATH=/data/img docker-compose up -d

# Using Docker directly
docker build -t nginx-image-host .
docker run -d -p 80:80 -p 443:443 --name nginx-image-host nginx-image-host
```

### Environment Variables

| Env Var | Default | Description |
|---------|---------|-------------|
| `DOMAIN` | localhost | Server domain name |
| `IMAGE_PATH` | /images/ | URL path for serving images |
| `UPLOAD_PATH` | /upload | URL path for upload endpoint |
| `STORAGE_PATH` | /var/www/images | Local directory for storing images |
| `UPLOAD_USER` | upload | Username for upload authentication |
| `UPLOAD_PASS` | upload | Password for upload authentication |

> **Note**: For production, always use strong passwords and enable HTTPS/TLS.

## ⚙️ Configuration

### Config Placeholders

Edit `img-host-full.conf` and replace these placeholders:

| Placeholder | Default | Description |
|-------------|---------|-------------|
| `__IMAGE_PATH__` | `/images/` | URL path for serving images |
| `__UPLOAD_PATH__` | `/upload` | URL path for upload endpoint |
| `__STORAGE_PATH__` | `/var/www/images/` | Local storage directory |

## 📖 API Reference

### `POST /upload`

Upload an image file to the server.

**Authentication:** Basic Auth (username: `upload`, password: configured)

**Request:**
- `file`: Image file (multipart/form-data)

**Response:**
- `200 OK`: Image uploaded successfully
- `401 Unauthorized`: Invalid or missing authentication
- `413 Request Entity Too Large`: File exceeds size limit
- `415 Unsupported Media Type`: Invalid file type

**Example:**
```bash
curl -u upload:upload -F "file=@image.jpg" https://example.com/upload
```

### `GET /images/*`

Serve uploaded images.

**Response:**
- `200 OK`: Image returned
- `404 Not Found`: Image not found

**Protection:**
- Hotlink protection checks referer header
- Rate limited to 10 requests/min per IP

## 🔒 Security

This application includes comprehensive security measures for safe production deployment.

**Implemented Security Measures:**
- ✅ Rate limiting (10 requests/min per IP)
- ✅ Hotlink protection (referer checking)
- ✅ Basic authentication for uploads
- ✅ Secure file permissions (600)
- ✅ File type validation via MIME detection
- ✅ Path sanitization (prevents directory traversal)

**For Production Deployment:**
1. Use strong passwords for upload authentication
2. Enable HTTPS/TLS (see [ACME.md](ACME.md))
3. Consider IP whitelist for `/upload` endpoint
4. Add fail2ban for abusive IPs
5. Review nginx logs regularly

## 💾 Backup/Restore

### Local Backup

```bash
# Backup
tar -czf backup.tar.gz /var/www/images

# Restore
tar -xzf backup.tar.gz -C /
```

### Remote Backup (backup server pulls)

```bash
# Backup
ssh img-server "tar -czf - /var/www/images" > /var/backups/images-$(date +%Y%m%d).tar.gz

# Restore
cat /var/backups/images-20250131.tar.gz | ssh img-server "tar -xzf - -C /"
```

### Automated Backup (cron)

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

## 🗺️ Roadmap

- [ ] Image statistics (view count, bandwidth tracking) - displayed via static page

## 📚 Documentation

- [INSTALL.md](INSTALL.md) - Installation guide for existing nginx
- [ACME.md](ACME.md) - SSL certificate setup with acme.sh
- [CHANGELOG.md](CHANGELOG.md) - Version history and changes
- [RELEASE_NOTES.md](RELEASE_NOTES.md) - Release information

## 🛠️ Development

### Test Configuration

```bash
# Test nginx configuration
nginx -t

# Reload nginx without downtime
nginx -s reload
```

### View Logs

```bash
# View nginx error log
tail -f /var/log/nginx/error.log

# View access log
tail -f /var/log/nginx/access.log
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenResty](https://openresty.org/) - Enhanced nginx with Lua
- [ImageMagick](https://imagemagick.org/) - Image processing
- [nginx](https://nginx.org/) - Web server
- [acme.sh](https://github.com/acmesh-official/acme.sh) - SSL certificate automation

## 📞 Support

- 📖 Check the [documentation](#-documentation) for detailed guides
- 🐛 [Open an issue](https://github.com/qspidy/imgng/issues) for bug reports
- 💬 Start a [discussion](https://github.com/qspidy/imgng/discussions) for questions
