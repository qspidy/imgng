# imgng

[![nginx](https://img.shields.io/badge/nginx-OpenResty%2FLua-green)](https://openresty.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-Ready-blue)](https://www.docker.com/)

CLI-first image host for hackers, with nginx/OpenResty and optional Cloudflare R2 uploads.

A simple `curl` upload command in, a public image URL out.

No app, no GUI, no custom client. Just `curl`.

Two modes:

- self-hosted nginx/OpenResty with files stored on local disk
- optional Cloudflare Worker + R2 upload path

For most self-hosted users, start with Docker Compose.

## Choose A Mode

Use nginx if you want:

- one server
- local disk storage
- the simplest setup

Use Worker + R2 if you want:

- Cloudflare edge uploads
- object storage
- public URLs from your own domain

## Compare Modes

| Feature | Self-hosted nginx | Worker + R2 |
|---------|-------------------|-------------|
| Storage | Local disk | Cloudflare R2 |
| Upload endpoint | Your server | Cloudflare Worker |
| Delivery domain | Your nginx domain | Custom R2 domain recommended |
| Server to maintain | Yes | No image storage server |
| Blocks other sites from embedding images | Yes, via nginx `Referer` checks | No with direct bucket custom-domain delivery; use a Worker delivery layer if you need this |
| Best for | Full control and simple self-hosting | Edge uploads and object storage |

## Quick Start

### Docker

```bash
docker-compose up -d
curl -k -u upload:upload --data-binary @photo.jpg https://localhost:8443/upload
```

The response is a plain text URL.

If you want your own certs, place them at:

- `./certs/<DOMAIN>.pem`
- `./certs/<DOMAIN>.key`

Replace `<DOMAIN>` with the `DOMAIN` value used by the container. Otherwise the container generates a self-signed cert for local testing.

### Existing nginx

Install dependencies:

```bash
sudo apt-get update
sudo apt-get install -y nginx-extras imagemagick
```

Create directories and auth:

```bash
sudo mkdir -p /var/www/images /tmp/nginx_upload
sudo chown -R www-data:www-data /var/www/images /tmp/nginx_upload
sudo chmod 755 /var/www/images /tmp/nginx_upload
echo "upload:$(openssl passwd -apr1 upload)" | sudo tee /etc/nginx/.htpasswd
```

Then follow [INSTALL.md](INSTALL.md) and test:

```bash
curl -u upload:upload --data-binary @photo.jpg https://yourdomain.com/upload
```

### Worker + R2

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/qspidy/imgng/tree/master/worker)

Use the button above for one-click deploy, or deploy manually:

```bash
cd worker
npm install
npx wrangler secret put BASIC_PASS
npx wrangler deploy
curl -u user:password --data-binary @photo.jpg https://your-worker.your-subdomain.workers.dev/upload
```

Full setup is in [worker/README.md](worker/README.md).

## Upload API

```bash
curl -u upload:upload --data-binary @photo.jpg https://example.com/upload
```

Behavior:

- raw request body, not multipart form data
- HTTP Basic auth
- returns the final URL as plain text
- accepts `jpg`, `jpeg`, `png`, `webp`, `gif`, and `avif`
- rejects unsupported types with `415`

## Notes

- uploaded image URLs are public once known
- hotlink protection uses the `Referer` header and is not strong authorization
- Docker exposes the app on host ports `8080` and `8443`
- for R2 deployments, prefer a custom domain for stable, branded image URLs
- direct R2 custom-domain delivery does not block other sites from embedding images

## Docs

- [INSTALL.md](INSTALL.md): existing nginx setup
- [nginx/snippet.conf](nginx/snippet.conf): nginx `server` block snippet
- [worker/README.md](worker/README.md): Worker + R2 setup
- [ACME.md](ACME.md): certificate setup
- [CHANGELOG.md](CHANGELOG.md): version history
