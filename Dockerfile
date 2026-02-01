FROM alpine:latest

RUN apk add --no-cache \
    nginx-extras \
    imagemagick \
    file \
    openssl

# Setup directories
RUN mkdir -p /var/www/images /run/nginx /tmp/nginx_upload && \
    chmod 755 /var/www/images /tmp/nginx_upload && \
    chown -R nginx:nginx /var/www/images /tmp/nginx_upload

# Copy nginx config
COPY img-host-full.conf /etc/nginx/http.d/default.conf

# Copy scripts
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80 443

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
