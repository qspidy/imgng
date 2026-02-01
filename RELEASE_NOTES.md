## What's New

This is the **initial public release** of nginx-image-host! 🎉

### ✨ Features

- **Self-Hosted Image Hosting**: Complete nginx-based image hosting solution
- **OpenResty/Lua Integration**: Enhanced nginx with Lua scripting for advanced features
- **Auto File Type Detection**: MIME-based validation ensures only images are uploaded
- **Image Optimization**: Automatic optimization using ImageMagick
- **Hotlink Protection**: Prevents unauthorized embedding of your images
- **Rate Limiting**: 10 requests/min per IP to prevent abuse
- **Basic Authentication**: Secure upload endpoint with username/password protection
- **Docker Support**: Ready-to-use Docker and Docker Compose configurations
- **HTTPS Ready**: Full SSL/TLS support with ACME integration

### 🔒 Security

- Rate limiting (10 requests/min per IP)
- Hotlink protection (referer checking)
- Basic authentication for uploads
- Secure file permissions (600)
- File type validation via MIME detection
- Path sanitization (prevents directory traversal)

### 📚 Documentation

- **README.md**: Comprehensive quick start and configuration guide
- **INSTALL.md**: Installation guide for existing nginx setups
- **ACME.md**: SSL certificate setup using acme.sh

### 🎨 Platform Support

- ✅ **Linux** (Debian/Ubuntu based systems)
- ✅ **Docker** (Alpine Linux base image)

> **Note**: This release is designed for Debian/Ubuntu based Linux distributions. Docker support allows deployment on any platform with Docker installed.

### 📦 Installation

#### Option 1: Add to Existing Nginx

```bash
# Install dependencies
apt-get install nginx-extras imagemagick

# Create directories
mkdir -p /var/www/images /tmp/nginx_upload
chown -R www-data:www-data /var/www/images /tmp/nginx_upload
chmod 755 /var/www/images /tmp/nginx_upload

# Setup authentication
echo "upload:$(openssl passwd -apr1 upload)" | tee /etc/nginx/.htpasswd

# Add configuration snippets from INSTALL.md to your nginx config
```

#### Option 2: Fresh OS Installation

```bash
# Install dependencies
apt-get update && apt-get install -y nginx-extras imagemagick

# Use full config (includes SSL, HTTP redirect)
cp img-host-full.conf /etc/nginx/sites-available/img-host
ln -s /etc/nginx/sites-available/img-host /etc/nginx/sites-enabled/

# Edit config: replace example.com, __IMAGE_PATH__, __UPLOAD_PATH__, __STORAGE_PATH__, SSL cert paths

# Setup directories and auth
mkdir -p /var/www/images /tmp/nginx_upload
chown -R www-data:www-data /var/www/images /tmp/nginx_upload
chmod 755 /var/www/images /tmp/nginx_upload
echo "upload:$(openssl passwd -apr1 upload)" | tee /etc/nginx/.htpasswd

# Get SSL cert (see ACME.md for details)
acme.sh --issue -d example.com --standalone
acme.sh --install-cert -d example.com --ecc \
  --fullchain-file /etc/ssl/example.com.pem \
  --key-file /etc/ssl/example.com.key

# Enable and start
rm /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
```

#### Option 3: Docker

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

### 📋 Known Issues

- Rate limiting is per-IP; may affect users behind NAT
- Basic authentication uses htpasswd file (no database integration)
- No built-in image management UI (use direct file access)

### 🙏 Acknowledgments

- [OpenResty](https://openresty.org/) - Enhanced nginx with Lua
- [ImageMagick](https://imagemagick.org/) - Image processing
- [nginx](https://nginx.org/) - Web server
- [acme.sh](https://github.com/acmesh-official/acme.sh) - SSL certificate automation
