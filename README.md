# 42_ft_transcendence

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone git@github.com:eg-delacruz/generic-express-mongo-backend.git
cd generic-express-mongo-backend
```

2. Start the services:
```bash
docker compose up --build -d
```

The backend will be available at `http://localhost:3000` (or the port specified in your configuration).

To do a quick test, you can access the health check endpoint in your browser or via curl:
```bash
curl http://localhost:3000/api/
```

## Frontend aliases (Vite + TypeScript)

Use aliases in **both** places so imports work at runtime and in TypeScript tooling.

### 1) Configure TypeScript (`frontend/tsconfig.app.json`)

Add `baseUrl` and `paths` inside `compilerOptions`:

```json
{
	"compilerOptions": {
		"baseUrl": ".",
		"paths": {
			"@/*": ["./src/*"],
			"@components/*": ["./src/components/*"],
			"@hooks/*": ["./src/hooks/*"],
			"@routes/*": ["./src/routes/*"],
			"@styles/*": ["./src/styles/*"],
			"@assets/*": ["./src/assets/*"],
			"@types/*": ["./src/types/*"],
			"@config/*": ["./src/config/*"],
			"@state/*": ["./src/state/*"]
		}
	}
}
```

### 2) Configure Vite (`frontend/vite.config.ts`)

Add a matching alias in `resolve.alias`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
			'@components': path.resolve(__dirname, 'src/components'),
			'@hooks': path.resolve(__dirname, 'src/hooks'),
			'@routes': path.resolve(__dirname, 'src/routes'),
			'@styles': path.resolve(__dirname, 'src/styles'),
			'@assets': path.resolve(__dirname, 'src/assets'),
			'@types': path.resolve(__dirname, 'src/types'),
			'@config': path.resolve(__dirname, 'src/config'),
			'@state': path.resolve(__dirname, 'src/state'),
		},
	},
});
```

### 3) Use the alias in imports

Instead of relative paths:

```ts
import heroImg from './assets/hero.png';
```

Use:

```ts
import heroImg from '@/assets/hero.png';
```

You can do the same for components, styles, hooks, and utilities, for example:

```ts
import Button from '@/components/Button';
import '@/App.css';
import Sidebar from '@components/Sidebar';
import useAuth from '@hooks/useAuth';
import { store } from '@state/store';
```

### Notes

- If aliases are only in TypeScript, Vite dev/build can fail to resolve imports.
- If aliases are only in Vite, TypeScript and IntelliSense will show import errors.
- After editing config files, restart the frontend dev server.

## Commands for development
- To view logs:
```bash
docker compose logs -f [service_name]
```
- To enter the backend container:
```bash
docker compose exec backend sh
```
- Restart a service:
```bash
docker compose restart [service_name]
```
- Stop the services:
```bash
docker compose down
```
- To rebuild the services:
```bash
docker compose up --build -d
```
- Erase containers, volumes and images:
```bash
docker compose down -v --rmi all
```
- Erase containers and volumes:
```bash
docker compose down -v
```