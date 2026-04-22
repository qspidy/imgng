#!/bin/sh
set -e

DOMAIN_NAME="${DOMAIN:-localhost}"
SSL_DIR="/etc/ssl"
CERTS_DIR="/etc/nginx/certs"
CERT_PATH="${SSL_DIR}/${DOMAIN_NAME}.pem"
KEY_PATH="${SSL_DIR}/${DOMAIN_NAME}.key"

# Setup auth
printf "${UPLOAD_USER:-upload}:$(openssl passwd -apr1 "${UPLOAD_PASS:-upload}")\n" > /etc/nginx/.htpasswd

# Install mounted certs when present, otherwise generate a self-signed pair
if [ -f "${CERTS_DIR}/${DOMAIN_NAME}.pem" ] && [ -f "${CERTS_DIR}/${DOMAIN_NAME}.key" ]; then
  cp "${CERTS_DIR}/${DOMAIN_NAME}.pem" "${CERT_PATH}"
  cp "${CERTS_DIR}/${DOMAIN_NAME}.key" "${KEY_PATH}"
elif [ ! -f "${CERT_PATH}" ] || [ ! -f "${KEY_PATH}" ]; then
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout "${KEY_PATH}" -out "${CERT_PATH}" -subj "/CN=${DOMAIN_NAME}"
fi

# Create storage directory
mkdir -p "${STORAGE_PATH:-/var/www/images}"

# Replace placeholders in nginx config
sed -i "s|example\.com|${DOMAIN_NAME}|g" /etc/nginx/http.d/default.conf
sed -i "s|__DOMAIN__|${DOMAIN_NAME}|g" /etc/nginx/http.d/default.conf
sed -i "s|__IMAGE_PATH__|${IMAGE_PATH:-/images/}|g" /etc/nginx/http.d/default.conf
sed -i "s|__UPLOAD_PATH__|${UPLOAD_PATH:-/upload}|g" /etc/nginx/http.d/default.conf
sed -i "s|__STORAGE_PATH__|${STORAGE_PATH:-/var/www/images/}|g" /etc/nginx/http.d/default.conf

exec "$@"
