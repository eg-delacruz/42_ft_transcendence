# 42_ft_transcendence

Organización general del proyecto ft_transcendence

## Table of Contents
- [🚀 Getting Started](#-getting-started)
- [Documentación de front y back](#documentacion-de-front-y-back)
- [Cosas a Tener en Cuenta](#cosas-a-tener-en-cuenta)
	- [Uso de pnpm en vez de npm](#uso-de-pnpm-en-vez-de-npm)
	- [Consideraciones generales del proyecto](#consideraciones-generales-del-proyecto)
	- [Gestión de la base de datos](#gestión-de-la-base-de-datos)
- [Commands for Development](#commands-for-development)

---

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone git@github.com:eg-delacruz/42_ft_transcendence.git
cd 42_ft_transcendence.git
```

2. Start the services:
```bash
make up
```

The backend will be available at `http://localhost:3000` (or the port specified in your configuration).

The frontend (Vite) will be available at `http://localhost:5173` by default.

To do a quick test, you can access the health check endpoint in your browser or via curl:
```bash
curl http://localhost:3000/api/
```

---
## Tareas del proyecto

Las tareas del proyecto están centralizadas en el proyecto vinculado al repo de github:

`https://github.com/users/eg-delacruz/projects/2/views/1`

---

## Documentación de front y back

El front y el back tienen sus propios README.md, donde se especifican los distintos workflows, implementaciones, estados y notas correspondientes a cada contenedor. Estos deberías ser modificados solamente por los integrantes respectivos que estén trabajando en esas áreas.

Directorios de los README.ms:

Frontend: `frontend/README.md`.

Backend: `backend/BACKEND.md`.

---

## Cosas a Tener en Cuenta

### Uso de pnpm en vez de npm

Para el proyecto se utilizará `pnpm` en lugar de `npm` para la gestión de paquetes. `pnpm` es un gestor más moderno y su manejo de dependencias mediante enlaces simbólicos mejora la velocidad y organización.
La mayoria de los comandos se ven casi iguales (solo cambia la herramienta):

```bash
# NPM
npm install
# PNPM
pnpm install
```

El unico comando que cambia de forma es el de eliminar paquetes:

```bash
# NPM
npm uninstall <package-name>
# PNPM
pnpm remove <package-name>
```

Para instalar nuevas dependencias, hay que hacerlo dentro del contenedor correspondiente (backend o frontend), no en la maquina host:

```bash
# Backend
make backend
pnpm add <package-name>

# Frontend
make frontend
pnpm add <package-name>
```

### Gestión de la base de datos

Durante el desarrollo del proyecto, la base de datos será local, lo cual implica que cada desarrollador tendrá su propia copia de los elementos que vaya creando (usuarios, chats, etc...).
Cuando queramos utilizar una DB central, esta funcionará en la red de 42, para lo cual habrá que modificar el docker-compose.yml

### Consideraciones generales del proyecto

- **Git Workflow:** Las ramas se harán por feature.

- **Controles de Minijuegos:**
  - Los controles estarán limitados a las flechas y dos botones (A y B) asignables.

- **Diseño de Juegos:**
  - Los minijuegos deberán tener mecánicas simples.

- **Base de Datos:**
  - Guardar usuarios, sus sesiones, y sus puntuaciones.
  - Evaluar si la base de datos será local o en la nube.

- **Puntos y Apuestas:**
  - Los puntos ganados en los juegos servirán como moneda en apuestas.
  - Los usuarios no pueden quedarse en números rojos (si llegan a 0, se plantea que los "coma" el black hole).
  - Las apuestas seguirán un sistema tipo Twitch.

- **Estados de Usuarios:**
  - Se requiere una máquina de estados que incluya: Jugando, En espera, Espectador.

- **Personalización:**
  - Propuesta de que los usuarios suban sus propias fotos para personalizar los muñecos con los que juegan.

---

## Commands for Development

Use the following commands during development:

- To view logs:
```bash
make logs CONTAINER=backend
make logs CONTAINER=frontend
make logs CONTAINER=mongo
```

- To enter the backend container:
```bash
make backend
```

- To enter the frontend container:
```bash
make frontend
```

- Restart a service:
```bash
make restart
```

- Stop the services:
```bash
make down
```

- To rebuild the services:
```bash
make re
```

- Clean dangling images and volumes:
```bash
make clean
```

- Show container status:
```bash
make status
```
