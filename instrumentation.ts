export async function register() {
  // Node runtime only (skip Edge).
  if (process.env.NEXT_RUNTIME && process.env.NEXT_RUNTIME !== 'nodejs') return

  const { assertProductionEnv } = await import('./src/lib/security/env-check')
  assertProductionEnv()
}
