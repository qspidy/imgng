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

It accepts raw image bytes over `POST`, validates HTTP Basic auth, detects the image type from magic bytes, stores the file in Cloudflare R2, and returns the final public image URL.

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
3. Choose a public bucket domain:
   - use a custom domain such as `https://img.example.com`, or
   - use the bucket's Cloudflare-managed public `r2.dev` domain
4. Set `PUBLIC_BASE_URL` to that bucket domain so the Worker returns public delivery URLs instead of Worker URLs.

## Local Config

Edit [`wrangler.jsonc`](./wrangler.jsonc):

- Change `vars.API_PATH_PREFIX` if you want the upload endpoint on another path such as `api/upload`. Use an empty value to serve uploads from `/`.
- Change `r2_buckets[0].bucket_name` to your real bucket name.
- Set `vars.PUBLIC_BASE_URL` to your public bucket domain:
  - custom domain example: `https://img.example.com`
  - Cloudflare-managed domain example: `https://pub-xxxxxxxxxxxxxxxx.r2.dev`
- Change `vars.BASIC_USER` if you do not want `user`.

The object key prefix is configurable through the optional Worker variable `PUBLIC_PATH_PREFIX`. If you do not set it, the Worker defaults to `images`, so uploaded objects are stored as `images/<file>` and returned URLs use `/images/<file>`.

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
9. Review the generated configuration and make sure the upload path, bucket name, and `PUBLIC_BASE_URL` in [`wrangler.jsonc`](./wrangler.jsonc) match your real setup.

Cloudflare requires the Worker name in the dashboard to match the `name` field in [`wrangler.jsonc`](./wrangler.jsonc). Custom routes are optional and can be added after the first successful deploy.

## Test

```bash
curl -s -u user:password --data-binary @photo.jpg https://your-worker.your-subdomain.workers.dev/upload
```

The response will be a plain text URL like:

```text
https://img.example.com/images/4e9d6f19c7c84f4b8f0d9d4d6a0a7f2c.jpg
```

By default `PUBLIC_PATH_PREFIX` behaves as `images`, so the Worker stores objects under the `images/` key prefix and returns URLs ending in `/images/<file>`. If you change `PUBLIC_PATH_PREFIX`, both the R2 object key and the returned public URL change with it.

`PUBLIC_BASE_URL` should point to a public bucket domain, not the Worker domain. Both of these are valid:

- `https://img.example.com`
- `https://pub-xxxxxxxxxxxxxxxx.r2.dev`

If you use both `PUBLIC_BASE_URL` and `PUBLIC_PATH_PREFIX`, do not repeat the same path segment in both. For example:

- `PUBLIC_BASE_URL=https://img.example.com` and `PUBLIC_PATH_PREFIX=images` gives `https://img.example.com/images/<file>`
- `PUBLIC_BASE_URL=https://img.example.com/images` and `PUBLIC_PATH_PREFIX=` also gives `https://img.example.com/images/<file>`
- `PUBLIC_BASE_URL=https://img.example.com/images` and `PUBLIC_PATH_PREFIX=images` would incorrectly produce `/images/images/<file>`

## Optional Delivery Optimization

If you want Cloudflare to optimize on delivery, use a transformed URL when embedding:

```text
https://www.example.com/cdn-cgi/image/format=auto,quality=85,width=1600/https://img.example.com/images/4e9d6f19c7c84f4b8f0d9d4d6a0a7f2c.jpg
```
