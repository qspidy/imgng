#!/bin/sh
set -e

# Setup auth
printf "${UPLOAD_USER:-upload}:$(openssl passwd -apr1 "${UPLOAD_PASS:-upload}")\n" > /etc/nginx/.htpasswd

# Generate self-signed cert if needed
[ -f /etc/ssl/key.pem ] || openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/key.pem -out /etc/ssl/cert.pem -subj "/CN=${DOMAIN:-localhost}"

# Create storage directory
mkdir -p "${STORAGE_PATH:-/var/www/images}"

# Replace placeholders in nginx config
sed -i "s|example\.com|${DOMAIN:-localhost}|g" /etc/nginx/http.d/default.conf
sed -i "s|__DOMAIN__|${DOMAIN:-localhost}|g" /etc/nginx/http.d/default.conf
sed -i "s|__IMAGE_PATH__|${IMAGE_PATH:-/images/}|g" /etc/nginx/http.d/default.conf
sed -i "s|__UPLOAD_PATH__|${UPLOAD_PATH:-/upload}|g" /etc/nginx/http.d/default.conf
sed -i "s|__STORAGE_PATH__|${STORAGE_PATH:-/var/www/images/}|g" /etc/nginx/http.d/default.conf

exec "$@"
