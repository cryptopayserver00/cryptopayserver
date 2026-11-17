#!/usr/bin/env node
/**
 * Audit api_key_settings for legacy plaintext rows (not hk:v1:).
 *
 * Usage:
 *   node --env-file=.env scripts/audit-api-keys.mjs
 *
 * Exit 1 when any plaintext keys remain (useful for CI / pre-prod checks).
 */
import { PrismaClient } from '@prisma/client'

const HASH_PREFIX = 'hk:v1:'
const prisma = new PrismaClient()

async function main() {
  const rows = await prisma.api_key_settings.findMany({
    where: { status: 1 },
    select: { id: true, store_id: true, user_id: true, label: true, api_key: true },
  })

  const plaintext = rows.filter((r) => r.api_key && !r.api_key.startsWith(HASH_PREFIX))
  const hashed = rows.length - plaintext.length

  console.log(
    JSON.stringify(
      {
        total: rows.length,
        hashed,
        plaintext: plaintext.length,
        plaintextIds: plaintext.map((r) => ({
          id: r.id,
          store_id: r.store_id,
          user_id: r.user_id,
          label: r.label,
        })),
      },
      null,
      2
    )
  )

  if (plaintext.length > 0) {
    console.error(
      `[audit-api-keys] ${plaintext.length} plaintext API key(s) remain — rotate keys or run yarn secrets:reencrypt in a non-production env with ALLOW_LEGACY_PLAINTEXT_API_KEYS briefly enabled after sealing via reencrypt`
    )
    process.exitCode = 1
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
