## What's New

This release publishes the repo with both deployment paths documented clearly:

- a self-hosted nginx/OpenResty image host
- an optional Cloudflare Worker upload endpoint backed by R2

### Highlights

- **nginx/OpenResty image hosting** with upload protection and static delivery
- **Cloudflare Worker upload flow** in `worker/` for Git-connected Cloudflare deploys
- **R2-backed object storage** support for Worker-based uploads
- **Sanitized public examples** in Worker docs and Wrangler config
- **Updated top-level docs** so the repo layout and deployment choices are explicit

### Cloudflare Worker Notes

The Worker setup is designed for repository-based deployment:

- root directory: `worker`
- install command: `npm install`
- deploy command: `npm run deploy`
- entrypoint: `worker/src/index.js`

Before enabling deployment in Cloudflare, set:

- the Worker name to match `wrangler.jsonc`
- the route and zone for your real domain
- the `BASIC_PASS` secret
- the R2 bucket binding
- the public image base URL

### Documentation

- `README.md` covers both nginx-hosted and Worker-based deployment paths
- `worker/README.md` covers Cloudflare Worker and R2 setup
- `INSTALL.md` remains the nginx integration guide
- `ACME.md` remains the SSL setup guide

### Known Gaps

- no built-in image management UI
- no automated sync for secrets or dashboard-side Cloudflare bindings
- nginx and Worker deployments are documented separately rather than unified behind one provisioning flow
