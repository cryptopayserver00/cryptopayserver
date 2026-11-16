import { isIP } from 'net'
import { lookup } from 'dns/promises'

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'metadata.google.internal',
  'metadata',
])

function isPrivateOrReservedIp(ip: string): boolean {
  const version = isIP(ip)
  if (version === 4) {
    const parts = ip.split('.').map(Number)
    const [a, b] = parts
    if (a === 10) return true
    if (a === 127) return true
    if (a === 0) return true
    if (a === 169 && b === 254) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    if (a === 100 && b >= 64 && b <= 127) return true // CGNAT
    if (a >= 224) return true // multicast / reserved
    return false
  }
  if (version === 6) {
    const normalized = ip.toLowerCase()
    if (normalized === '::' || normalized === '::1') return true
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true // ULA
    if (normalized.startsWith('fe80')) return true // link-local
    if (normalized.startsWith('ff')) return true // multicast
    // IPv4-mapped
    if (normalized.startsWith('::ffff:')) {
      return isPrivateOrReservedIp(normalized.slice(7))
    }
    return false
  }
  return true
}

/**
 * Validate that a URL is safe for server-side HTTP callbacks (webhooks, LN nodes).
 * Rejects non-http(s), credentials-in-URL, private/link-local hosts, and literal IPs
 * in reserved ranges. Optionally resolves DNS and re-checks (best-effort SSRF guard).
 */
export async function assertSafeHttpUrl(
  raw: string,
  options: { allowHttp?: boolean; resolveDns?: boolean } = {}
): Promise<{ ok: true; url: URL } | { ok: false; message: string }> {
  const allowHttp = options.allowHttp === true
  const resolveDns = options.resolveDns !== false

  let url: URL
  try {
    url = new URL(String(raw || '').trim())
  } catch {
    return { ok: false, message: 'Invalid URL' }
  }

  if (url.protocol !== 'https:' && !(allowHttp && url.protocol === 'http:')) {
    return { ok: false, message: 'URL must use HTTPS' }
  }

  if (url.username || url.password) {
    return { ok: false, message: 'URL must not include credentials' }
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase()
  if (!hostname || BLOCKED_HOSTNAMES.has(hostname)) {
    return { ok: false, message: 'URL host is not allowed' }
  }

  if (hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    return { ok: false, message: 'URL host is not allowed' }
  }

  if (isIP(hostname)) {
    if (isPrivateOrReservedIp(hostname)) {
      return { ok: false, message: 'URL must not target private or reserved addresses' }
    }
  } else if (resolveDns) {
    try {
      const records = await lookup(hostname, { all: true, verbatim: true })
      if (!records.length) {
        return { ok: false, message: 'URL host could not be resolved' }
      }
      for (const record of records) {
        if (isPrivateOrReservedIp(record.address)) {
          return { ok: false, message: 'URL must not resolve to private or reserved addresses' }
        }
      }
    } catch {
      return { ok: false, message: 'URL host could not be resolved' }
    }
  }

  return { ok: true, url }
}

/** Synchronous hostname/protocol checks without DNS (for fast reject). */
export function isBlockedWebhookHostname(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, '').toLowerCase()
  if (!host || BLOCKED_HOSTNAMES.has(host)) return true
  if (host.endsWith('.local') || host.endsWith('.internal')) return true
  if (isIP(host) && isPrivateOrReservedIp(host)) return true
  return false
}

/**
 * Validate an SMTP / TCP host (hostname or IP). Rejects private/reserved targets.
 * Does not require a URL scheme — pass bare hostnames like `smtp.example.com`.
 */
export async function assertSafeHostname(
  raw: string,
  options: { resolveDns?: boolean } = {}
): Promise<{ ok: true; host: string } | { ok: false; message: string }> {
  const resolveDns = options.resolveDns !== false
  let host = String(raw || '').trim().toLowerCase()
  if (!host) return { ok: false, message: 'Invalid host' }

  // Strip accidental scheme / path / port noise.
  host = host.replace(/^https?:\/\//, '').split('/')[0].split(':')[0]
  if (!host || BLOCKED_HOSTNAMES.has(host)) {
    return { ok: false, message: 'Host is not allowed' }
  }
  if (host.endsWith('.local') || host.endsWith('.internal')) {
    return { ok: false, message: 'Host is not allowed' }
  }

  if (isIP(host)) {
    if (isPrivateOrReservedIp(host)) {
      return { ok: false, message: 'Host must not be a private or reserved address' }
    }
    return { ok: true, host }
  }

  if (resolveDns) {
    try {
      const records = await lookup(host, { all: true, verbatim: true })
      if (!records.length) {
        return { ok: false, message: 'Host could not be resolved' }
      }
      for (const record of records) {
        if (isPrivateOrReservedIp(record.address)) {
          return { ok: false, message: 'Host must not resolve to private or reserved addresses' }
        }
      }
    } catch {
      return { ok: false, message: 'Host could not be resolved' }
    }
  }

  return { ok: true, host }
}

/** Common submission / SMTPS ports only — blocks TCP probe via arbitrary ports. */
const ALLOWED_SMTP_PORTS = new Set([25, 465, 587, 2525])

export function isAllowedSmtpPort(port: unknown): port is number {
  const n = Number(port)
  return Number.isInteger(n) && ALLOWED_SMTP_PORTS.has(n)
}
