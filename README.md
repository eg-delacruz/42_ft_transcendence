# 42_ft_transcendence

**Visión general del proyecto**

Hemos quedado en que nuestro transcendence es una página de minijuegos online.
Los usuarios se registran y son movidos al lobby, dónde estarán con el resto de usuarios conectados en ese momento.
Los usuarios pueden elegir si participar en los juegos o solo espectar. Los juegos se irán empezando en orden aleatorio y la máquina escogerá aleatoriamente a un par de jugadores para competir entre ellos. Los espectadores tendrán un chat donde hablar y una zona de apuestas para la partida de ese momento.

## Table of Contents
- [🚀 Getting Started](#-getting-started)
- [Gestión centralizada de las tareas](#gestión-centralizada-de-las-tareas)
- [Documentación de front y back](#documentación-de-front-y-back)
- [Cosas a Tener en Cuenta](#cosas-a-tener-en-cuenta)
	- [Uso de pnpm en vez de npm](#uso-de-pnpm-en-vez-de-npm)
	- [Gestión de la base de datos](#gestión-de-la-base-de-datos)
	- [Ramas](#ramas)
	- [Consideraciones generales del proyecto](#consideraciones-generales-del-proyecto)
- [Commands for Development](#commands-for-development)

---

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone git@github.com:eg-delacruz/42_ft_transcendence.git
cd 42_ft_transcendence.git
```

2. Create your environment file from the example:
```bash
cp .env.example .env
```

3. Start the services:
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
## Gestión centralizada de las tareas

Las tareas del proyecto están centralizadas en el proyecto vinculado al repo de github. Cualquier participante puede crear tareas y moverlas entre estados. La idea sería que, cuando alguien quiera empezar a trabajar en alguna tarea, que arrastre la tarea del estado de "Ready" al estado de "In Progress", y de esta manera asegurarse de que solamente una persona está trabajando en ella. Además, si estás trabajando en una tarea, asígnate a ella para que se sepa quién está trabajando en ella.

Las tareas deben ser bastante granulares, evitando ser muy generales o que abarquen demasiado.

Enlace al proyecto:

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
La mayoría de los comandos se ven casi iguales, pero algunos cambian de forma o nombre (por ejemplo, `add` y `remove`).

Tabla rápida de equivalencias:

| Acción | npm | pnpm | Descripción |
| --- | --- | --- | --- |
| Instalar dependencias del proyecto | `npm install` | `pnpm install` | Lee `package.json` y el lockfile para instalar todo. |
| Añadir dependencia | `npm install <package-name>` | `pnpm add <package-name>` | Agrega el paquete a `dependencies`. |
| Añadir dependencia de desarrollo | `npm install -D <package-name>` | `pnpm add -D <package-name>` | Agrega el paquete a `devDependencies`. |
| Eliminar dependencia | `npm uninstall <package-name>` | `pnpm remove <package-name>` | Elimina el paquete del proyecto. |
| Ejecutar script | `npm run <script>` | `pnpm <script>` | Ejecuta un script de `package.json`. |
| Instalar paquete global | `npm install -g <package-name>` | `pnpm add -g <package-name>` | Instala el paquete globalmente. |

Nota corta:
`pnpm add <package-name>` agrega por defecto a `dependencies`. Usa `-D` para `devDependencies` y `-P` si necesitas declararlo como `peerDependencies`.

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

### Ramas

La rama principal es `origin/master`. Al completar ciertos Milestones, si todos estamos de acuerto, podemos hacer merge de `origin/dev` a esta rama. No debería tocarse nunca hasta no estar seguros de los cambios.

La rama `origin/dev` debe ser el punto central del proyecto, donde todos vamos haciendo merge de las nuevas features que vamos añadiendo.

**Creación de nuevas ramas**
Las nuevas ramas serán creadas según features.
La nomenclatura debería ser `feature/NOMBRE_DEL_FEATURE`.
Si el feature está relacionado con back o front, sería óptimo añadirlo al nombre para mayor claridad de la siguiente manera:

`feature/front/NOMBRE_DEL_FEATURE`


### Consideraciones generales del proyecto

- **Controles de Minijuegos:**
  - Los controles estarán limitados a las flechas y dos botones (A y B) asignables.

- **Diseño de Juegos:**
  - Los minijuegos deberán tener mecánicas simples.

- **Base de Datos:**
  - Guardar usuarios, sus sesiones, y sus puntuaciones.

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
