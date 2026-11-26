export const IsValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const IsValidJSON = (json: string): boolean => {
  try {
    const parsed = JSON.parse(json);
    return typeof parsed === 'object' && parsed !== null;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const IsValidHTTPUrl = (url: string): boolean => {
  const urlRegex = /((https?:\/\/)|(\/)|(..\/))(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gm;
  return urlRegex.test(url);
};

export const isValidPassword = (pwd: string): boolean => {
  const hasUpperCase = /[A-Z]/.test(pwd);
  const hasLowerCase = /[a-z]/.test(pwd);
  const hasNumbers = /\d/.test(pwd);
  const hasSymbols = /[!@#$%^&*()_+[\]{}|;:,.<>?]/.test(pwd);
  const isLongEnough = pwd.length >= 8;

  return hasUpperCase && hasLowerCase && hasNumbers && hasSymbols && isLongEnough;
};

/** Strip whitespace and optional 0x prefix from a private-key paste. */
export const normalizePrivateKeyInput = (raw: string): string => {
  return String(raw || '')
    .trim()
    .replace(/^0x/i, '')
}

/**
 * Secp256k1 private keys used by BTC / LTC / BCH / ETH-family / TRON:
 * exactly 32 bytes as 64 hex characters, non-zero.
 */
export const isValidSecp256k1PrivateKeyHex = (raw: string): boolean => {
  const key = normalizePrivateKeyInput(raw)
  if (!/^[0-9a-fA-F]{64}$/.test(key)) return false
  if (/^0+$/.test(key)) return false
  return true
}

/**
 * Returns an error message when the private key is invalid for the chain,
 * or null when it looks usable. Derivation can still fail for edge cases.
 */
export const validateImportPrivateKey = (
  chainId: number,
  raw: string
): string | null => {
  const key = normalizePrivateKeyInput(raw)
  if (!key) {
    return 'Private key cannot be empty'
  }

  // Bitcoin / Litecoin / Bitcoin Cash / Ethereum-family / Tron expect 32-byte hex.
  const secp256k1Chains = new Set([1, 2, 4, 5, 6, 8, 9, 10, 11, 12, 13, 15])
  if (secp256k1Chains.has(chainId)) {
    if (!isValidSecp256k1PrivateKeyHex(key)) {
      return 'Invalid private key. Use a 64-character hex key (32 bytes), optionally prefixed with 0x.'
    }
    return null
  }

  // Solana secret key is typically 64 bytes (128 hex chars) or a longer encoded blob.
  if (chainId === 7) {
    if (/^[0-9a-fA-F]+$/i.test(key)) {
      if (key.length !== 128) {
        return 'Invalid Solana private key. Expected 128 hex characters (64-byte secret key).'
      }
      return null
    }
    if (key.length < 32) {
      return 'Invalid Solana private key.'
    }
    return null
  }

  // TON and other chains: require non-trivial length; derivation validates the rest.
  if (key.length < 16) {
    return 'Invalid private key.'
  }

  return null
}
