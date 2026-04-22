# Worker + R2

Use this if you want uploads handled by Cloudflare and files stored in R2.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/qspidy/imgng/tree/master/worker)

## Quick Start

```bash
cd worker
npm install
npx wrangler secret put BASIC_PASS
npx wrangler deploy
curl -u user:password --data-binary @photo.jpg https://your-worker.your-subdomain.workers.dev/upload
```

The response is a plain text URL.

## Config

Edit [`wrangler.jsonc`](./wrangler.jsonc):

- `BASIC_USER`: upload username
- `BASIC_PASS`: upload password secret
- `API_PATH_PREFIX`: upload path, usually `upload`
- `PUBLIC_BASE_URL`: public bucket URL
- `PUBLIC_PATH_PREFIX`: object key prefix, usually `images`
- `r2_buckets[0].bucket_name`: your R2 bucket name

## Upload API

```bash
curl -u user:password --data-binary @photo.jpg https://your-worker.your-subdomain.workers.dev/upload
```

Notes:

- raw request body
- HTTP Basic auth
- returns the final URL as plain text
- accepts `jpg`, `png`, `gif`, `webp`, and `avif`
- rejects unsupported types

- set `PUBLIC_BASE_URL` if you want returned URLs to use your public bucket domain
- avoid duplicating the path between `PUBLIC_BASE_URL` and `PUBLIC_PATH_PREFIX`
