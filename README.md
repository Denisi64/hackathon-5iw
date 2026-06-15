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

## Workflow dev recommande

Lancer toute la stack avec Docker :

```bash
make docker-up
```

URLs utiles :

- Front : http://localhost:5173
- API : http://localhost:3000/api/health
- MinIO console : http://localhost:9001
- PostgreSQL : localhost:5432

Arreter la stack :

```bash
make docker-down
```

## Workflow dev local

Si PostgreSQL et MinIO tournent deja, lancer seulement les apps :

```bash
make dev
```

Commandes separees :

```bash
make dev-front
make dev-back
```

## Base de donnees

La base tourne dans Docker. Appliquer le schema puis charger les donnees de test :

```bash
make db-migrate
make db-seed
```

Si besoin de repartir de zero :

```bash
make docker-down
docker volume rm hackathon-5iw_pg_data
make docker-up
make db-migrate
make db-seed
```

Comptes de test apres le seed :

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

## Variables d'environnement

Les valeurs de dev sont dans `.env.example`.

Docker utilise ce fichier par defaut. Pour une config locale personnalisee :

```bash
cp .env.example .env
```

Ne pas commit `.env`.
