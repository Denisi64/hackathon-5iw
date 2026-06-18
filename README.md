# Comutitres Hackathon

Projet hackathon ESGI x Comutitres.

## Prerequis

- Node.js 20
- pnpm
- Docker

## Installation

```bash
make install
```

## Demarrage rapide

```bash
make start
```

Ouvrir http://localhost:5173.

BDD via Pgweb : http://localhost:8081.

Assistant : http://localhost:5173/assistant.

```bash
make test-chatbot
```

Avec le petit LLM local gratuit :

```bash
make start-llm
```

```bash
make stop
```

## Docker

Lancer le projet :

```bash
make docker-build
make docker-up
```

URLs :

- Front : http://localhost:5173
- API : http://localhost:3000/api/health
- Pgweb : http://localhost:8081
- MinIO console : http://localhost:9001
- PostgreSQL : localhost:5432

Arreter :

```bash
make stop
```

Avec Bake :

```bash
make docker-up-bake
```

## Local

Si PostgreSQL et MinIO tournent deja :

```bash
make dev
```

Separément :

```bash
make dev-front
make dev-back
```

## Base de donnees

Appliquer le schema et charger les donnees de test :

```bash
make db-migrate
make db-seed
```

Reset :

```bash
make docker-down
docker volume rm hackathon-5iw_pg_data
make docker-up
make db-migrate
make db-seed
```

Comptes de test :

- `salarie@test.com`
- `etudiant@test.com`
- `tst@test.com`

Mot de passe : `password123`

## IA locale

Par defaut, l'assistant utilise Ollama avec `tinyllama`, un petit modele local gratuit.

Lancer le projet avec le modele :

```bash
make start-llm
```

Tester l'endpoint chatbot :

```bash
make test-chatbot
```

Si Ollama n'est pas lance ou que le modele n'est pas encore pret, le backend retombe sur le mode demo pour ne pas bloquer le projet.

Configuration :

```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=tinyllama
```

Pour revenir au mode demo sans vrai modele :

```env
AI_PROVIDER=mock
```

```env
AI_PROVIDER=mock
```

## Commandes utiles

```bash
make help
make build
make test
make test-report
make coverage
make lint
make test-chatbot
make clean
```

Equivalents pnpm :

```bash
pnpm dev
pnpm build
pnpm test
pnpm lint
```

```text
apps/
  frontend/       React + Vite
  backend/        NestJS + Drizzle
hackathon-context/ contexte metier
```
