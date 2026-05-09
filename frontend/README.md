# Documentacion del Frontend

Este documento recopila flujos de trabajo y notas de implementacion del frontend. Usalo para definir como se deben construir las features, como se organiza la UI y como se configuran las herramientas del frontend.

## Tabla de Contenidos
- [Estado actual](#estado-actual)
- [Pendientes](#pendientes)
- [Aliases en el frontend (Vite + TypeScript)](#aliases-en-el-frontend-vite--typescript)
  - [1. Configurar TypeScript](#1-configurar-typescript)
  - [2. Configurar Vite](#2-configurar-vite)
  - [3. Usar los aliases en imports](#3-usar-los-aliases-en-imports)
  - [Notas](#notas)

---

## Estado actual

Este documento describe el estado actual de la implementacion del frontend definida en las tareas del proyecto vinculado al repositirio en github:

`https://github.com/users/eg-delacruz/projects/2/views/1`

**PROGRESO ACTUAL: FASE 01**

### Hecho

- app.tsx simple completado
- rutas de React implementadas
- rutas protegidas aplicadas
- hooks de autenticacion definidos en useAuth
- authProvider como contexto global de autenticacion
- prototipos de home, login, register y user pages
- entrypoints verificados: auth, login, logout, register y delete
- validacion de fortaleza de password

## Pendientes

- definir y crear el layout base de la app
- agregar estilos

---

## Aliases en el frontend (Vite + TypeScript)

Usa aliases en **ambos** lugares para que funcionen en runtime y en TypeScript.

### 1. Configurar TypeScript

Actualiza `frontend/tsconfig.app.json` y agrega `baseUrl` y `paths` dentro de `compilerOptions`:

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

### 2. Configurar Vite

Actualiza `frontend/vite.config.ts` y agrega el alias correspondiente en `resolve.alias`:

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

### 3. Usar los aliases en imports

En lugar de rutas relativas:

```ts
import heroImg from './assets/hero.png';
```

Usa:

```ts
import heroImg from '@/assets/hero.png';
```

Tambien puedes aplicar los aliases a componentes, estilos, hooks y utilidades, por ejemplo:

```ts
import Button from '@/components/Button';
import '@/App.css';
import Sidebar from '@components/Sidebar';
import useAuth from '@hooks/useAuth';
import { store } from '@state/store';
```

### Notas
- Si los aliases solo estan en TypeScript, Vite dev/build puede fallar al resolver imports.
- Si los aliases solo estan en Vite, TypeScript e IntelliSense mostraran errores de imports.
- Luego de editar la configuracion, reinicia el servidor de desarrollo del frontend.
