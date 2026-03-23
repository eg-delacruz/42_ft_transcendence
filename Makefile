# ========================= #
#	42 - ft_trascendence	#
# ========================= #

.PHONY: up down restart logs status clean help mongo backend frontend re

up:
	docker-compose up --build -d
	@echo "Proyecto on-line:"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend: http://localhost:3000"

down:
	docker-compose down

restart: down up

logs:
	@if [ -n "$(CONTAINER)" ]; then \
		echo "\033[1;36mMostrando logs del contenedor: $(CONTAINER)\033[0m"; \
		docker-compose logs $(CONTAINER) -f; \
	else \
		echo "\033[1;33mMostrando logs de todos los contenedores\033[0m"; \
		docker-compose logs -f; \
	fi

status:
	docker-compose ps

clean: down
	docker volume rm $$(docker volume ls -qf dangling=true) || true
	docker image prune -a -f

mongo:
	docker-compose exec mongo sh

mongosh:
	@docker-compose exec mongo sh -c 'mongosh -u "$$MONGO_INITDB_ROOT_USERNAME" -p "$$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase $$MONGO_ROOT_USER "$$MONGO_INITDB_DATABASE"'

backend:
	docker-compose exec backend sh

frontend:
	docker-compose exec frontend sh

re: clean up

help:
	@echo "42 - ft_trascendence"
	@echo "  make up       - Levanta los contenedores en segundo plano"
	@echo "  make down     - Detiene y elimina los contenedores"
	@echo "  make restart  - Reinicia los contenedores"
	@echo "  make logs     - Muestra los logs de los contenedores (puedes usar make logs CONTAINER=nombre)"
	@echo "  make clean    - Limpia volúmenes e imágenes no usados"
	@echo "  make mongo    - Abre una shell dentro del contenedor mongo"
	@echo "  make mongosh  - Abre la consola interactiva de MongoDB (mongosh)"
	@echo "  make backend  - Abre una shell dentro del contenedor backend"
	@echo "  make frontend - Abre una shell dentro del contenedor frontend"
	@echo "  make re       - Ejecuta clean seguido de up"
	@echo "  make help     - Muestra esta ayuda"
