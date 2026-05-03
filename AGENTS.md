# AGENTS.md

This file provides essential guidance for working with `42_ft_transcendence`. All context focuses on ensuring smooth operations and avoiding pitfalls.

---

## Repository Overview
### System Architecture:
- **Backend:** Node.js + Express with TypeScript.
- **Frontend:** React (TypeScript), powered by Vite.
- **Database:** MongoDB with seeded data during development.
- **Containerized:** Docker-based services orchestrated with `docker-compose`.

---

## Development Commands
### Environment setup:
Dependencies are managed within a Dockerized environment. Use `pnpm` only (never `npm`). Refer to `.env.example` for customizing variables before starting.

### Makefile Shortcuts:
Frequently-used commands (equivalent `docker compose` in parentheses):

- Start services: `make up` (or `docker-compose up --build -d`)
- Stop all services: `make down`
- Restart: `make restart`
- View logs: `make logs [CONTAINER=backend/frontend/mongo]`
- Rebuild and restart: `make re`
- Clean dangling images: `make clean`

### Frontend-specific:
1. Local iteration:
   ```bash
   pnpm dev   # 0.0.0 bound/LAN
   vite preview.
