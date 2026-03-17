# Uploads Directory

This directory is used during local development to store and serve uploaded images.

## How it works in development:

1. The `docker-compose.override.yml` file mounts this directory as a bind mount: `./uploads:/app/uploads`
2. Any image files you place here will be accessible via `http://localhost:3000/uploads/filename`
3. Images uploaded through your API endpoints are also stored here

## Example:

If you place `my-image.png` in this directory, you can access it at:
```
http://localhost:3000/uploads/my-image.png
```

## Production:

In production (without `docker-compose.override.yml`), the base `docker-compose.yml` uses a Docker named volume (`uploads_data`) instead, which is more portable and doesn't expose host filesystem paths.
