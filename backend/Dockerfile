FROM node:20-alpine

# Set environment variable to skip prompts
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0

# Install only minimal runtime tooling for local development
RUN corepack enable \
    && corepack use pnpm@10.30.3

WORKDIR /app

# Note: running as root in local development avoids permissions issues
# with bind-mounted volumes on Windows/WSL.
# For production images, prefer:
# RUN chown -R node:node /app
# USER node

EXPOSE 3000

# Signal handling via docker-compose init: true
# See docker-compose.yml for details

# Default command (can be overridden in docker-compose)
CMD ["sh"]