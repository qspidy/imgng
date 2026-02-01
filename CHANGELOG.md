# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- (Future releases will be documented here)

## [1.0.0] - 2025-01-31

### Added
- Initial GitHub release with comprehensive documentation
- Self-hosted image hosting solution using nginx + OpenResty/Lua
- LICENSE file (MIT)
- Auto file type detection using MIME-based validation
- Image optimization using ImageMagick
- Hotlink protection via referer checking
- Rate limiting (10 requests/min per IP)
- Basic authentication for upload endpoint
- Secure file permissions (600) for uploaded images
- Docker and Docker Compose support
- Full nginx configuration with SSL and HTTP redirect
- Self-signed SSL certificate generation for development
- Environment variable configuration for Docker deployment
- Backup and restore documentation with cron examples

### Security
- Rate limiting (10 requests/min per IP)
- Hotlink protection (referer checking)
- Basic authentication for uploads
- Secure file permissions (600)
- File type validation via MIME detection
- Path sanitization to prevent directory traversal

### Documentation
- README.md with badges, quick start, and configuration
- INSTALL.md with installation guide for existing nginx
- ACME.md with SSL certificate setup using acme.sh

### Platform
- Linux support (Debian/Ubuntu based systems)
- Docker support with Alpine Linux base image

[Unreleased]: https://github.com/qspidy/imgng_pub/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/qspidy/imgng_pub/releases/tag/v1.0.0
