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

## Docker

Lancer le projet :

```bash
make docker-build
make docker-up
```

URLs :

- Front : http://localhost:5173
- API : http://localhost:3000/api/health
- MinIO console : http://localhost:9001
- PostgreSQL : localhost:5432

Arreter :

```bash
make docker-down
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

## Commandes utiles

```bash
make help
make build
make test
make lint
make clean
```

Equivalents pnpm :

```bash
pnpm dev
pnpm build
pnpm test
pnpm lint
```

## Structure

```text
apps/
  frontend/       React + Vite
  backend/        NestJS + Drizzle
hackathon-context/ contexte metier
```