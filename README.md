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