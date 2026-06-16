.PHONY: help install start stop wait-api dev dev-front dev-back build test lint ci docker-build docker-up docker-up-bake docker-down db-migrate db-seed clean

help:
	@echo "Commandes disponibles:"
	@echo "  make start        Lancer le projet complet"
	@echo "  make stop         Arreter le projet"
	@echo "  make install      Installer les dependances"
	@echo "  make dev          Lancer front + back en local"
	@echo "  make dev-front    Lancer le frontend"
	@echo "  make dev-back     Lancer le backend"
	@echo "  make build        Compiler le projet"
	@echo "  make test         Lancer les tests"
	@echo "  make lint         Verifier TypeScript"
	@echo "  make ci           Lancer les checks de CI en local"
	@echo "  make docker-build Builder les images Docker"
	@echo "  make docker-up    Lancer tous les services Docker"
	@echo "  make docker-up-bake Lancer Docker avec BuildKit Bake"
	@echo "  make docker-down  Arreter Docker"
	@echo "  make db-migrate   Appliquer le schema BDD"
	@echo "  make db-seed      Ajouter les donnees de test"
	@echo "  make clean        Supprimer dist et coverage"

install:
	pnpm install

start:
	docker compose up -d --build
	$(MAKE) wait-api
	docker compose exec -T backend pnpm db:migrate
	docker compose exec -T backend pnpm db:seed
	@echo ""
	@echo "Projet lance:"
	@echo "  Front: http://localhost:5173"
	@echo "  API:   http://localhost:3000/api/health"
	@echo "  MinIO: http://localhost:9001"

stop:
	docker compose down

wait-api:
	@echo "Attente de l'API..."
	@for i in $$(seq 1 40); do \
		if curl -fsS http://localhost:3000/api/health >/dev/null; then \
			echo "API prete"; \
			exit 0; \
		fi; \
		sleep 3; \
	done; \
	docker compose logs backend; \
	exit 1

dev:
	pnpm dev

dev-front:
	pnpm dev:front

dev-back:
	pnpm dev:back

build:
	pnpm build

test:
	pnpm test

lint:
	pnpm lint

ci:
	pnpm install --frozen-lockfile
	pnpm lint
	pnpm test
	pnpm build

docker-build:
	docker compose build

docker-up:
	docker compose up

docker-up-bake:
	COMPOSE_BAKE=true docker compose up --build

docker-down:
	docker compose down

db-migrate:
	pnpm --filter @comutitres/backend db:migrate

db-seed:
	pnpm --filter @comutitres/backend db:seed

clean:
	rm -rf apps/frontend/dist apps/backend/dist apps/frontend/coverage apps/backend/coverage
