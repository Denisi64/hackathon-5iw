.PHONY: help install start start-llm stop refresh-deps wait-api wait-ollama ollama-pull dev dev-front dev-back build test test-report coverage lint ci docker-build docker-up docker-up-bake docker-down db-migrate db-seed test-chatbot clean


help:
	@echo "Commandes disponibles:"
	@echo "  make start        Lancer le projet complet"
	@echo "  make start-llm    Lancer le projet avec TinyLlama local"
	@echo "  make stop         Arreter le projet"
	@echo "  make refresh-deps Recréer les node_modules Docker"
	@echo "  make install      Installer les dependances"
	@echo "  make dev          Lancer front + back en local"
	@echo "  make dev-front    Lancer le frontend"
	@echo "  make dev-back     Lancer le backend"
	@echo "  make build        Compiler le projet"
	@echo "  make test         Lancer les tests"
	@echo "  make test-report  Lancer les tests avec rapport JUnit"
	@echo "  make coverage     Generer la couverture de tests"
	@echo "  make lint         Verifier TypeScript"
	@echo "  make ci           Lancer les checks de CI en local"
	@echo "  make docker-build Builder les images Docker"
	@echo "  make docker-up    Lancer tous les services Docker"
	@echo "  make docker-up-bake Lancer Docker avec BuildKit Bake"
	@echo "  make docker-down  Arreter Docker"
	@echo "  make db-migrate   Appliquer le schema BDD"
	@echo "  make db-seed      Ajouter les donnees de test"
	@echo "  make test-chatbot Tester le endpoint IA chat"

	@echo "  make directus-setup Configurer les interfaces Directus (une seule fois)"

	@echo "  make clean        Supprimer dist et coverage"

install:
	pnpm install

start:
	$(MAKE) refresh-deps
	docker compose up -d --build
	$(MAKE) wait-api
	$(MAKE) directus-setup
	@echo ""
	@echo "Projet lance:"
	@echo "  Front:     http://localhost:5173"
	@echo "  API:       http://localhost:3000/api/health"
	@echo "  Directus:  http://localhost:8055/admin"
	@echo "  Pgweb:     http://localhost:8081"
	@echo "  MinIO:     http://localhost:9001"

start-llm:
	$(MAKE) refresh-deps
	docker compose --profile llm up -d --build
	$(MAKE) wait-ollama
	$(MAKE) ollama-pull
	$(MAKE) wait-api
	@echo ""
	@echo "Projet lance avec TinyLlama:"
	@echo "  Front: http://localhost:5173"
	@echo "  Assistant: http://localhost:5173/assistant"
	@echo "  API:   http://localhost:3000/api/health"
	@echo "  Pgweb: http://localhost:8081"
	@echo "  MinIO: http://localhost:9001"
	@echo "  Ollama: http://localhost:11434"

stop:
	docker compose down

refresh-deps:
	docker compose rm -sf backend frontend
	docker volume rm hackathon-5iw_backend_node_modules hackathon-5iw_frontend_node_modules 2>/dev/null || true

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

wait-ollama:
	@echo "Attente d'Ollama..."
	@for i in $$(seq 1 60); do \
		if curl -fsS http://localhost:11434/api/tags >/dev/null; then \
			echo "Ollama pret"; \
			exit 0; \
		fi; \
		sleep 2; \
	done; \
	docker compose --profile llm logs ollama; \
	exit 1

ollama-pull:
	docker compose --profile llm exec -T ollama ollama pull tinyllama

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

test-report:
	pnpm test:report

coverage:
	pnpm coverage

lint:
	pnpm lint

ci:
	pnpm install --frozen-lockfile
	pnpm lint
	pnpm test:report
	pnpm coverage
	pnpm build

docker-build:
	docker compose build

docker-up:
	docker compose up

docker-up-bake:
	COMPOSE_BAKE=true docker compose up --build

docker-down:
	docker compose down -v

db-migrate:
	pnpm --filter @comutitres/backend db:migrate

db-seed:
	pnpm --filter @comutitres/backend db:seed

test-chatbot:
	@echo "Test du chatbot..."
	@curl -fsS -X POST http://localhost:3000/api/auth/register \
		-H "Content-Type: application/json" \
		-d '{"email":"chatbot@test.com","password":"password123","firstName":"Chat","lastName":"Bot","language":"fr"}' >/dev/null 2>/dev/null || true
	@TOKEN=$$(curl -fsS -X POST http://localhost:3000/api/auth/login \
		-H "Content-Type: application/json" \
		-d '{"email":"chatbot@test.com","password":"password123"}' \
		| node -pe "JSON.parse(require('node:fs').readFileSync(0, 'utf8')).access_token"); \
	curl -fsS -N -X POST http://localhost:3000/api/ai/chat \
		-H "Authorization: Bearer $$TOKEN" \
		-H "Content-Type: application/json" \
		-d '{"messages":[{"role":"user","content":"Bonjour, je suis etudiant, quel abonnement choisir ?"}]}'
directus-setup:
	bash scripts/directus-setup.sh

clean:
	rm -rf apps/frontend/dist apps/backend/dist apps/frontend/coverage apps/backend/coverage apps/frontend/reports apps/backend/reports
