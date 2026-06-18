import postgres from 'postgres'

const databaseUrl = process.env.DATABASE_URL ?? 'postgresql://comutitres:comutitres_dev@localhost:5432/comutitres'
const sql = postgres(databaseUrl, { max: 1 })

const enumDefinitions = [
  ['document_type', ['cni', 'certificat_scolarite', 'attestation_caf', 'carte_invalidite', 'livret_famille', 'inconnu']],
  ['fraud_level', ['low', 'medium', 'high']],
  ['notification_type', [
    'subscription_renewal',
    'subscription_active',
    'document_warning',
    'documents_required',
    'subscription_suspended',
    'payment_required',
    'fraud_alert',
    'subscription_draft',
    'tst_expiry',
  ]],
  ['offer_renewal', ['annual', 'monthly', 'weekly', 'quarterly', 'usage']],
] as const

const enumColumns = [
  ['documents', 'type', 'document_type'],
  ['notifications', 'type', 'notification_type'],
  ['offers', 'renewal', 'offer_renewal'],
  ['subscriptions', 'fraud_level', 'fraud_level'],
] as const

function quoteLiteral(value: string) {
  return `'${value.replaceAll("'", "''")}'`
}

async function enumExists(name: string) {
  const rows = await sql<{ exists: boolean }[]>`
    select exists (
      select 1
      from pg_type t
      join pg_namespace n on n.oid = t.typnamespace
      where n.nspname = 'public' and t.typname = ${name}
    )
  `

  return rows[0]?.exists ?? false
}

async function columnType(tableName: string, columnName: string) {
  const rows = await sql<{ udt_name: string }[]>`
    select udt_name
    from information_schema.columns
    where table_schema = 'public'
      and table_name = ${tableName}
      and column_name = ${columnName}
  `

  return rows[0]?.udt_name
}

async function prepareDatabase() {
  for (const [name, values] of enumDefinitions) {
    if (await enumExists(name)) continue

    await sql.unsafe(`CREATE TYPE "public"."${name}" AS ENUM(${values.map(quoteLiteral).join(', ')})`)
  }

  for (const [tableName, columnName, enumName] of enumColumns) {
    const currentType = await columnType(tableName, columnName)
    if (!currentType || currentType === enumName) continue

    await sql.unsafe(
      `ALTER TABLE "public"."${tableName}" ALTER COLUMN "${columnName}" SET DATA TYPE "public"."${enumName}" USING "${columnName}"::text::"public"."${enumName}"`,
    )
  }
}

prepareDatabase()
  .then(async () => {
    await sql.end()
    console.log('Database schema prepared')
  })
  .catch(async (error: unknown) => {
    await sql.end()
    console.error(error)
    process.exit(1)
  })
