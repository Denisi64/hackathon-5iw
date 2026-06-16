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

- `employee@test.com`
- `student@test.com`
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

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/offers` | public | List active offers (optional `?profile=` filter) |
| GET | `/api/offers/:id` | public | Get offer by id |
| POST | `/api/subscriptions` | JWT | Create a subscription (status: draft) |
| GET | `/api/subscriptions/:id` | JWT | Get subscription (payer or holder only) |
| PATCH | `/api/subscriptions/:id` | JWT | Update subscription (payer only) |
| POST | `/api/subscriptions/:id/confirm` | JWT | Create Stripe checkout session |
| POST | `/api/subscriptions/:id/compute-fraud-score` | JWT | Compute fraud score — returns 204, score never exposed |
| POST | `/api/documents/upload` | JWT | Upload document to MinIO (multipart/form-data) |
| POST | `/api/documents/verify` | JWT | Run Claude vision OCR on a document |
| POST | `/api/payments/webhook` | Stripe signature | Stripe webhook — activates subscription on payment |
| POST | `/api/ai/chat` | JWT | Stream Claude chatbot response (text/plain chunked) |
| POST | `/api/ai/recommend` | public | Get structured offer recommendation from Claude |
