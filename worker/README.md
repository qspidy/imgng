# Cloudflare Worker Upload Endpoint

## One-Click Deploy

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/qspidy/imgng/tree/master/worker)

For a public template-style install, prefer the button above. Cloudflare's current Deploy to Cloudflare flow can clone the repo, provision required resources such as an R2 bucket, and configure Workers Builds for the new project.

If you want to wire it up manually instead, follow the setup below.

This Worker preserves the old upload flow:

```bash
imgul() {
  curl -s -u user:password --data-binary @"$1" https://your-worker.your-subdomain.workers.dev/upload
}
```

It accepts raw image bytes over `POST`, validates HTTP Basic auth, detects the image type from magic bytes, stores the file in Cloudflare R2, serves uploaded files back from the same Worker, and returns the public image URL.

The repo now uses plain JavaScript for the deployable Worker entrypoint, so it is suitable for Cloudflare Git-connected builds without a TypeScript step.

## What It Supports

- `jpg`
- `png`
- `gif`
- `webp`
- `avif`

## One-Time Cloudflare Setup

1. Create an R2 bucket, for example `images`, unless Cloudflare provisions one for you during template deployment.
2. Deploy to the default `workers.dev` hostname first so the template works without any per-user route setup.
3. Leave `PUBLIC_BASE_URL` empty if you want returned URLs to use the Worker origin by default.
4. Add a custom domain later if you want public image URLs on your own domain.

## Local Config

Edit [`wrangler.jsonc`](./wrangler.jsonc):

- Change `vars.API_PATH_PREFIX` if you want the upload endpoint on another path such as `api/upload`. Use an empty value to serve uploads from `/`.
- Change `r2_buckets[0].bucket_name` to your real bucket name.
- Leave `vars.PUBLIC_BASE_URL` empty to use the Worker origin, or set it later to a custom public image domain.
- Change `vars.BASIC_USER` if you do not want `user`.

Set the password as a secret:

```bash
cd worker
npm install
npx wrangler secret put BASIC_PASS
```

## Deploy

```bash
cd worker
npm install
npm run deploy
```

## Git-Connected Cloudflare Builds

If you want Cloudflare to deploy from Git automatically:

1. Push this repository to GitHub or GitLab.
2. In Cloudflare, create or open the Worker named `imgul`.
3. Go to `Settings` > `Builds`.
4. Connect the repository.
5. Set the root directory to `worker`.
6. Use the install command `npm install`.
7. Use the deploy command `npm run deploy`.
8. Set the `BASIC_PASS` secret if Cloudflare did not already prompt for it during deployment.
9. Review the generated configuration and make sure the upload path and bucket name in [`wrangler.jsonc`](./wrangler.jsonc) match your real setup. Set `PUBLIC_BASE_URL` later if you want a separate image domain.

Cloudflare requires the Worker name in the dashboard to match the `name` field in [`wrangler.jsonc`](./wrangler.jsonc). Custom routes are optional and can be added after the first successful deploy.

## Test

```bash
curl -s -u user:password --data-binary @photo.jpg https://your-worker.your-subdomain.workers.dev/upload
```

The response will be a plain text URL like:

```text
https://your-worker.your-subdomain.workers.dev/images/4e9d6f19c7c84f4b8f0d9d4d6a0a7f2c.jpg
```

The `images` segment comes from `PUBLIC_PATH_PREFIX` in [`wrangler.jsonc`](./wrangler.jsonc). By default the Worker serves those objects back from the same origin. If you later set `PUBLIC_BASE_URL`, returned URLs will use that custom base instead.

## Optional Delivery Optimization

If you want Cloudflare to optimize on delivery, use a transformed URL when embedding:

```text
https://www.example.com/cdn-cgi/image/format=auto,quality=85,width=1600/https://your-worker.your-subdomain.workers.dev/images/4e9d6f19c7c84f4b8f0d9d4d6a0a7f2c.jpg
```
