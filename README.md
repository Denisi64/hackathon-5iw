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
- **Backoffice (Directus)** : http://localhost:8055/admin — `admin@comutitres.fr` / `admin123` — voir [docs/directus.md](docs/directus.md)
- Pgweb (SQL) : http://localhost:8081
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

Separement :

```bash
make dev-front
make dev-back
```

Variables d'environnement requises dans `apps/backend/.env` :

```
DATABASE_URL=postgresql://comutitres:comutitres_dev@localhost:5432/comutitres
JWT_SECRET=...
JWT_REFRESH_SECRET=...
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET=comutitres
ADMIN_EMAIL=admin@comutitres.fr
ADMIN_PASSWORD=admin123
ADMIN_COOKIE_SECRET=...
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
docker volume rm hackathon-5iw_pg_data hackathon-5iw_directus_uploads
make docker-up
make db-migrate
make db-seed
```

Comptes de test (mot de passe : `password123`) :

| Email | Profil | Scenario |
|---|---|---|
| `jean.dupont@test.com` | employee | Navigo Annuel actif + sub expiree |
| `marie.martin@test.com` | student | Imagine R Etudiant actif, fraude medium |
| `lucas.bernard@test.com` | junior_school | Imagine R Junior, enfant avec compte |
| `emma.petit@test.com` | school | Imagine R Scolaire, en attente de documents |
| `robert.moreau@test.com` | senior | Navigo Senior actif + sub suspendue |
| `fatima.benali@test.com` | tst | TST Gratuite (QF <= 400), dossier valide |
| `pierre.legrand@test.com` | amethyste | Amethyste, en attente de paiement |
| `sophie.dubois@test.com` | employee | Achat pour enfant sans compte (payeur != porteur) |
| `karim.mansouri@test.com` | tst | TST 50%, fraude HIGH, documents rejetes |
| `alice.renard@test.com` | employee | Souscription en cours (draft) |

Statuts couverts : `draft`, `pending_documents`, `pending_payment`, `active`, `suspended`, `cancelled`, `expired`

Niveaux de fraude : `low` (score 0), `medium` (31), `high` (69)

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

## Application mobile

L'app mobile (Expo) tourne sur un téléphone physique et doit joindre le backend.

### Mac / Linux natif

Utiliser l'IP locale de la machine (même WiFi que le téléphone) :

```ts
// apps/mobile/constants/api.ts
export const API_BASE_URL = 'http://192.168.1.XX:3000/api'
```

### WSL2

Le téléphone ne peut pas joindre WSL2 via l'IP locale Windows. Il faut exposer le backend avec un tunnel cloudflared.

Lancer le tunnel (dans le container ou en local) :

```bash
cloudflared tunnel --url http://localhost:3000
```

Copier l'URL générée (ex: `https://xxx.trycloudflare.com`) et la mettre dans :

```ts
// apps/mobile/constants/api.ts
export const API_BASE_URL = 'https://xxx.trycloudflare.com/api'
```

> L'URL change à chaque relance du tunnel — ne pas commiter cette valeur.

## Commandes utiles

```bash
make help
make build
make test
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

## Structure

```text
apps/
  frontend/       React + Vite + Tailwind
  backend/        NestJS + Drizzle + PostgreSQL
docker-compose.yml  PostgreSQL, MinIO, pgweb, Directus
Makefile            Commandes raccourcies
```
