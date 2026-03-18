# ========================= #
#	42 - ft_trascendence	#
# ========================= #

.PHONY: up down restart logs status clean help

up:
	docker-compose up -d
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
	docker-volume ls

clean: down
	docker volume rm $$(docker volume ls -qf dangling=true) || true
	docker image prune -a -f

help:
	@echo "42 - ft_trascendence"
	@echo "  make up       - Levanta los contenedores en segundo plano"
	@echo "  make down     - Detiene y elimina los contenedores"
	@echo "  make restart  - Reinicia los contenedores"
	@echo "  make logs     - Muestra los logs de los contenedores (puedes usar make logs CONTAINER=nombre)"
	@echo "\033[1;32mComandos disponibles:\033[0m"
	@echo "  \033[1;34mmake up\033[0m       - Levanta los contenedores en segundo plano"
	@echo "  \033[1;31mmake down\033[0m     - Detiene y elimina los contenedores"
	@echo "  \033[1;35mmake restart\033[0m  - Reinicia los contenedores"
	@echo "  \033[1;36mmake logs\033[0m     - Muestra los logs de los contenedores (puedes usar make logs CONTAINER=nombre)"
	@echo "  \033[1;33mmake status\033[0m   - Muestra el estado de los contenedores"
	@echo "  \033[1;37mmake clean\033[0m    - Limpia volúmenes e imágenes no usados"
	@echo "  \033[1;32mmake help\033[0m     - Muestra esta ayuda"
	@echo "  make prune    - Limpia todo Docker (contenedores, imágenes, volúmenes, redes no usados)"
	@echo "  make clean    - Limpia volúmenes e imágenes no usados"
	@echo "  make help     - Muestra esta ayuda"
