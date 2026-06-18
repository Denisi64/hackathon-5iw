# Backoffice Directus

URL : http://localhost:8055/admin
Compte : `admin@comutitres.fr` / `admin123`

## Utilisateurs Directus vs utilisateurs app

| | Directus "Users" | Content > "users" |
|---|---|---|
| Table | `directus_users` | `users` (app Comutitres) |
| Role | Admins du backoffice | Utilisateurs de l'application |
| Creation | Formulaire natif Directus | Formulaire Directus (Content > users) |

Les utilisateurs de l'application sont dans **Content > users**, pas dans le menu Users de Directus.

## Creer un utilisateur app depuis Directus

`password_hash` est nullable — il n'est pas requis a la creation. Remplir email, prenom, nom, profil et laisser le mot de passe vide.

A la premiere connexion de l'utilisateur, le backend retourne `401 first_login` et le frontend gere la creation du mot de passe.

## A quoi sert le backoffice

- Consulter et modifier les abonnements (statut, score de fraude)
- Consulter les documents et leur resultat d'analyse IA
- Voir les utilisateurs et leurs profils
- Gerer les offres disponibles

## Champs en lecture seule

| Champ | Raison |
|---|---|
| `fraud_score`, `fraud_level`, `fraud_signals` | Calcules par l'algorithme de detection de fraude |
| `ai_extracted_data`, `ai_confidence` | Resultats de l'analyse IA Anthropic |
| `stripe_subscription_id`, `stripe_customer_id` | IDs Stripe internes |
| `validated_at`, `created_at`, `updated_at` | Horodatages automatiques |

## Initialiser les interfaces

Au premier demarrage (une seule fois) :

```bash
make directus-setup
```

Configure les dropdowns pour tous les champs enum, les vues JSON, et les champs lecture seule.
