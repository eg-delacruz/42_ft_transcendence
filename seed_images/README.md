# Seed Images

This directory contains example images demonstrating how images are stored and served in the application.

## Usage:

- **Development:** Copy any image from here to the `./uploads/` directory to test the image serving endpoint
- **Documentation:** These files serve as reference for the expected format and structure of uploaded images

## Current Examples:

- `example.png` - A minimal valid PNG image (1x1 pixel gray dot)

## How to use:

1. Copy an image file (or rename/paste your own) to the `./uploads/` directory
2. Access it via the browser: `http://localhost:3000/uploads/your-image.png`

The `/uploads` endpoint is configured in `backend/src/app.ts` and serves static files from `/app/uploads` inside the container.
