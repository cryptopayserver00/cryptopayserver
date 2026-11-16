import { decryptAndUpgrade, encryptSecret } from './secrets'

export type LightningCredentialFields = {
  macaroon?: string | null
  certthumbprint?: string | null
  rune?: string | null
  access_token?: string | null
  refresh_token?: string | null
}

export type UnwrappedLightningCredentials = {
  macaroon: string
  certthumbprint: string
  rune: string
  accessToken: string
  refreshToken: string
  /** Ciphertexts that should be written back for lazy migration */
  upgrades: Partial<LightningCredentialFields>
}

function unwrapField(
  value: string | null | undefined,
  key: keyof LightningCredentialFields,
  upgrades: Partial<LightningCredentialFields>
): string {
  if (!value) return ''
  const { plaintext, upgraded } = decryptAndUpgrade(value)
  if (upgraded) upgrades[key] = upgraded
  return plaintext
}

/** Encrypt lightning credential fields for at-rest storage. */
export function encryptLightningCredentials(
  input: LightningCredentialFields
): LightningCredentialFields {
  return {
    macaroon: input.macaroon ? encryptSecret(String(input.macaroon)) : input.macaroon,
    certthumbprint: input.certthumbprint
      ? encryptSecret(String(input.certthumbprint))
      : input.certthumbprint,
    rune: input.rune ? encryptSecret(String(input.rune)) : input.rune,
    access_token: input.access_token
      ? encryptSecret(String(input.access_token))
      : input.access_token,
    refresh_token: input.refresh_token
      ? encryptSecret(String(input.refresh_token))
      : input.refresh_token,
  }
}

/** Decrypt lightning credentials; collect lazy-upgrade ciphertexts. */
export function unwrapLightningCredentials(
  row: LightningCredentialFields
): UnwrappedLightningCredentials {
  const upgrades: Partial<LightningCredentialFields> = {}
  return {
    macaroon: unwrapField(row.macaroon, 'macaroon', upgrades),
    certthumbprint: unwrapField(row.certthumbprint, 'certthumbprint', upgrades),
    rune: unwrapField(row.rune, 'rune', upgrades),
    accessToken: unwrapField(row.access_token, 'access_token', upgrades),
    refreshToken: unwrapField(row.refresh_token, 'refresh_token', upgrades),
    upgrades,
  }
}
