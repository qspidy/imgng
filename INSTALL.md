# Install Into An Existing nginx Site

Use this if you already have nginx running and want the self-hosted upload flow.

## 1. Install packages

```bash
sudo apt-get update
sudo apt-get install -y nginx-extras imagemagick
```

## 2. Create directories

```bash
sudo mkdir -p /var/www/images /tmp/nginx_upload
sudo chown -R www-data:www-data /var/www/images /tmp/nginx_upload
sudo chmod 755 /var/www/images /tmp/nginx_upload
```

## 3. Create upload auth

```bash
echo "upload:$(openssl passwd -apr1 upload)" | sudo tee /etc/nginx/.htpasswd
```

## 4. Add the nginx snippet

1. Add this line to your nginx `http` block:

```nginx
limit_req_zone $binary_remote_addr zone=upload_limit:10m rate=10r/m;
```

2. Download or copy [nginx/snippet.conf](nginx/snippet.conf) to your server, for example:

```bash
sudo mkdir -p /etc/nginx/snippets
sudo cp nginx/snippet.conf /etc/nginx/snippets/img-host.conf
```

3. Replace `yourdomain.com` in `/etc/nginx/snippets/img-host.conf` with your real domain.

4. Add this line inside your `server` block:

```nginx
include /etc/nginx/snippets/img-host.conf;
```

## 5. Reload and test

```bash
sudo nginx -t
sudo nginx -s reload
curl -u upload:upload --data-binary @photo.jpg https://yourdomain.com/upload
```

## Notes

- uploads use raw request bytes, not multipart form data
- accepted formats: `jpg`, `jpeg`, `png`, `webp`, `gif`, `avif`
- unsupported types return `415`
