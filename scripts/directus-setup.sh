#!/usr/bin/env bash
# Configure les interfaces des champs Directus (dropdowns, readonly, hidden).
# A lancer une seule fois apres make docker-up : make directus-setup

set -uo pipefail

DIRECTUS_URL="${DIRECTUS_URL:-http://localhost:8055}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@comutitres.fr}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"

# ── Attente Directus ──────────────────────────────────────────────────────────
echo "Attente de Directus..."
READY=0
for i in $(seq 1 40); do
  if curl -sS "${DIRECTUS_URL}/server/health" 2>/dev/null | grep -q '"status":"ok"'; then
    READY=1; break
  fi
  echo "  ... ${i}/40"; sleep 3
done
[ "$READY" -eq 1 ] || { echo "Timeout" >&2; exit 1; }
sleep 5  # laisser Directus finir l'introspection du schema

# ── Authentification ──────────────────────────────────────────────────────────
TOKEN=$(curl -sS -X POST "${DIRECTUS_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}" \
  2>/dev/null | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4 || true)

[ -z "$TOKEN" ] && { echo "Echec auth Directus" >&2; exit 1; }
echo "Authentifie."

# ── Helpers ───────────────────────────────────────────────────────────────────
PATCH_ERRORS=0

patch_field() {
  local collection="$1" field="$2" meta="$3"
  local code
  code=$(curl -sS -o /tmp/dp_out.json -w "%{http_code}" -X PATCH \
    "${DIRECTUS_URL}/fields/${collection}/${field}" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"meta\":${meta}}" 2>/dev/null || echo "000")
  if [ "$code" = "200" ]; then
    echo "  [ok] ${collection}.${field}"
  else
    echo "  [err ${code}] ${collection}.${field} — $(grep -o '"message":"[^"]*"' /tmp/dp_out.json 2>/dev/null | head -1)" >&2
    PATCH_ERRORS=1
  fi
}

select_field() {
  local collection="$1" field="$2" choices="$3" extra="${4:-}"
  patch_field "$collection" "$field" \
    "{\"interface\":\"select-dropdown\",\"options\":{\"choices\":${choices}},\"display\":\"labels\"${extra}}"
}

# ── users ─────────────────────────────────────────────────────────────────────
echo; echo "=== users ==="

select_field "users" "profile" '[
  {"text":"Salarie",    "value":"employee"},
  {"text":"Etudiant",   "value":"student"},
  {"text":"Primaire",   "value":"junior_school"},
  {"text":"Scolaire",   "value":"school"},
  {"text":"Senior",     "value":"senior"},
  {"text":"TST",        "value":"tst"},
  {"text":"Amethyste",  "value":"amethyste"}
]'

select_field "users" "role" '[
  {"text":"Utilisateur","value":"user"},
  {"text":"Porteur",    "value":"porteur"}
]'

patch_field "users" "password_hash" '{"hidden":true,"required":false}'

patch_field "users" "gdpr_consent"    '{"readonly":true}'
patch_field "users" "gdpr_consent_at" '{"readonly":true}'
patch_field "users" "created_at"      '{"readonly":true}'
patch_field "users" "updated_at"      '{"readonly":true}'

# ── subscriptions ─────────────────────────────────────────────────────────────
echo; echo "=== subscriptions ==="

select_field "subscriptions" "status" '[
  {"text":"Brouillon",         "value":"draft"},
  {"text":"Attente documents", "value":"pending_documents"},
  {"text":"Attente paiement",  "value":"pending_payment"},
  {"text":"Actif",             "value":"active"},
  {"text":"Suspendu",          "value":"suspended"},
  {"text":"Annule",            "value":"cancelled"},
  {"text":"Expire",            "value":"expired"}
]'

select_field "subscriptions" "fraud_level" '[
  {"text":"Faible","value":"low"},
  {"text":"Moyen", "value":"medium"},
  {"text":"Eleve", "value":"high"}
]' ',"readonly":true'

patch_field "subscriptions" "fraud_score"            '{"readonly":true}'
patch_field "subscriptions" "fraud_signals"          '{"readonly":true,"interface":"input-code","options":{"language":"json"}}'
patch_field "subscriptions" "stripe_subscription_id" '{"hidden":true}'
patch_field "subscriptions" "stripe_customer_id"     '{"hidden":true}'
patch_field "subscriptions" "created_at"             '{"readonly":true}'
patch_field "subscriptions" "updated_at"             '{"readonly":true}'

# ── documents ─────────────────────────────────────────────────────────────────
echo; echo "=== documents ==="

select_field "documents" "type" '[
  {"text":"CNI",                    "value":"cni"},
  {"text":"Certificat de scolarite","value":"certificat_scolarite"},
  {"text":"Attestation CAF",        "value":"attestation_caf"},
  {"text":"Carte invalidite",       "value":"carte_invalidite"},
  {"text":"Livret de famille",      "value":"livret_famille"},
  {"text":"Inconnu",                "value":"inconnu"}
]'

select_field "documents" "status" '[
  {"text":"Depose",  "value":"uploaded"},
  {"text":"En cours","value":"validating"},
  {"text":"Valide",  "value":"valid"},
  {"text":"Rejete",  "value":"rejected"}
]'

patch_field "documents" "minio_key"         '{"hidden":true}'
patch_field "documents" "ai_extracted_data" '{"readonly":true,"interface":"input-code","options":{"language":"json"}}'
patch_field "documents" "ai_confidence"     '{"readonly":true}'
patch_field "documents" "validated_at"      '{"readonly":true}'
patch_field "documents" "created_at"        '{"readonly":true}'

# ── offers ────────────────────────────────────────────────────────────────────
echo; echo "=== offers ==="

select_field "offers" "renewal" '[
  {"text":"Annuel",       "value":"annual"},
  {"text":"Mensuel",      "value":"monthly"},
  {"text":"Hebdomadaire", "value":"weekly"},
  {"text":"Trimestriel",  "value":"quarterly"},
  {"text":"A l usage",    "value":"usage"}
]'

# ── notifications ─────────────────────────────────────────────────────────────
echo; echo "=== notifications ==="

select_field "notifications" "type" '[
  {"text":"Renouvellement abonnement","value":"subscription_renewal"},
  {"text":"Abonnement actif",         "value":"subscription_active"},
  {"text":"Alerte document",          "value":"document_warning"},
  {"text":"Documents requis",         "value":"documents_required"},
  {"text":"Abonnement suspendu",      "value":"subscription_suspended"},
  {"text":"Paiement requis",          "value":"payment_required"},
  {"text":"Alerte fraude",            "value":"fraud_alert"},
  {"text":"Brouillon abonnement",     "value":"subscription_draft"},
  {"text":"Expiration TST",           "value":"tst_expiry"}
]'

patch_field "notifications" "created_at" '{"readonly":true}'

# ── consents ──────────────────────────────────────────────────────────────────
echo; echo "=== consents ==="

select_field "consents" "type" '[
  {"text":"RGPD",              "value":"rgpd"},
  {"text":"Cookies",           "value":"cookies"},
  {"text":"Upload de document","value":"document_upload"}
]'

patch_field "consents" "accepted_at" '{"readonly":true}'

# ── holders ───────────────────────────────────────────────────────────────────
echo; echo "=== holders ==="
patch_field "holders" "created_at" '{"readonly":true}'

if [ "$PATCH_ERRORS" -ne 0 ]; then
  echo
  echo "Directus partiellement configure: certains champs ont echoue." >&2
  exit 1
fi

echo
echo "Directus configure — http://localhost:8055/admin"
echo
echo "Note: les utilisateurs app sont dans Content > users (pas dans Users)"
echo "Pour creer un utilisateur : make create-user EMAIL=x@x.com PASSWORD=pass FIRST=P LAST=N"
