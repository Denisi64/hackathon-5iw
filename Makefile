.PHONY: help install dev dev-front dev-back build test lint docker-build docker-up docker-up-bake docker-down db-migrate db-seed clean

help:
	@echo "Commandes disponibles:"
	@echo "  make install      Installer les dependances"
	@echo "  make dev          Lancer front + back en local"
	@echo "  make dev-front    Lancer le frontend"
	@echo "  make dev-back     Lancer le backend"
	@echo "  make build        Compiler le projet"
	@echo "  make test         Lancer les tests"
	@echo "  make lint         Verifier TypeScript"
	@echo "  make docker-build Builder les images Docker"
	@echo "  make docker-up    Lancer tous les services Docker"
	@echo "  make docker-up-bake Lancer Docker avec BuildKit Bake"
	@echo "  make docker-down  Arreter Docker"
	@echo "  make db-migrate   Appliquer le schema BDD"
	@echo "  make db-seed      Ajouter les donnees de test"
	@echo "  make clean        Supprimer dist et coverage"

install:
	pnpm install

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

docker-build:
	COMPOSE_BAKE=true docker compose build

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
