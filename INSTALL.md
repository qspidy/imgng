# Installation Guide for Existing Nginx Site

Add image hosting to your existing nginx configuration.

## What to Add

### 1. Add to http block (outside server block)

```nginx
# Rate limiting for image upload
limit_req_zone $binary_remote_addr zone=upload_limit:10m rate=10r/m;
```

### 2. Add to your existing server block (inside server { })

```nginx
# Image serving location
location /images/ {
    alias /var/www/images/;
    # Update your domain below
    valid_referers none blocked *.yourdomain.com;
    if ($invalid_referer) {
        return 403;
    }
    expires 30d;
    add_header Cache-Control "public";
}

# Upload endpoint
location /upload {
    limit_except POST { deny all; }

    # Rate limiting
    limit_req zone=upload_limit burst=5 nodelay;

    # Authentication
    auth_basic "Upload";
    auth_basic_user_file /etc/nginx/.htpasswd;

    client_max_body_size 20M;
    client_body_in_file_only on;
    client_body_temp_path /tmp/nginx_upload;

    content_by_lua_block {
        ngx.req.read_body()

        local file = ngx.req.get_body_file()
        if not file then
            ngx.status = 400
            ngx.say("no body file")
            return
        end

        local ext = ngx.var.http_x_file_extension or ""
        if ext == "" then
            local handle = io.popen("/usr/bin/file -b --mime-type " .. file .. " 2>/dev/null")
            local mime_type = handle:read("*a")
            handle:close()

            local mime_to_ext = {
                ["image/jpeg"] = "jpg",
                ["image/png"] = "png",
                ["image/webp"] = "webp",
                ["image/gif"] = "gif",
                ["image/avif"] = "avif",
            }
            ext = mime_to_ext[mime_type:gsub("%s+", "")] or "bin"
        else
            ext = ext:gsub("^%.", "")
        end

        local id = ngx.var.request_id
        local target = "/var/www/images/" .. id .. "." .. ext

        local ok, err = os.rename(file, target)
        if not ok then
            ngx.status = 500
            ngx.say("rename failed: ", err)
            return
        end

        local image_extensions = {jpg=true, jpeg=true, png=true, webp=true, gif=true, avif=true}
        if image_extensions[ext:lower()] then
            local optimize_cmd = "/usr/bin/mogrify -quality 85 -strip " .. target
            os.execute(optimize_cmd .. " 2>/dev/null")
            os.execute("/bin/chmod 600 " .. target .. " 2>/dev/null")
        end

        local url = ngx.var.scheme .. "://" .. ngx.var.host .. "/images/" .. id .. "." .. ext
        ngx.header["X-File"] = id .. "." .. ext
        ngx.say(url)
    }
}
```

## Installation Steps

```bash
# 1. Install dependencies
sudo apt-get update
sudo apt-get install -y nginx-extras imagemagick

# 2. Create directories
sudo mkdir -p /var/www/images /tmp/nginx_upload
sudo chown -R www-data:www-data /var/www/images /tmp/nginx_upload
sudo chmod 755 /var/www/images /tmp/nginx_upload

# 3. Create upload user
echo "upload:$(openssl passwd -apr1 upload)" | sudo tee /etc/nginx/.htpasswd

# 4. Add snippets above to your nginx config

# 5. Test and reload
sudo nginx -t
sudo nginx -s reload

# 6. Upload test
curl -u upload:upload --data-binary @photo.jpg https://yourdomain.com/upload
```

## Customization

| Change | To |
|--------|-----|
| Image path | `/images/` → `/your/path/` |
| Upload endpoint | `/upload` → `/your-endpoint` |
| Storage directory | `/var/www/images/` → `/your/dir/` |
| Hotlink domain | `*.yourdomain.com` |
| Max file size | `20M` → `50M` |
| Rate limit | `10r/m` → `20r/m` |
