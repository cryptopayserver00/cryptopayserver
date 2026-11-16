/**
 * Standalone schedule worker (Node built-ins only — safe for Docker standalone image).
 *
 * Usage: yarn worker
 *
 * Env:
 *   CRON_SECRET (required, >= 16 chars)
 *   SCHEDULE_BASE_URL (default http://127.0.0.1:8888/api/schedule/)
 *   PORT (fallback when SCHEDULE_BASE_URL unset)
 *   ENABLE_SCHEDULE_WORKER=false to exit immediately
 */
import fs from 'fs'
import path from 'path'
import http from 'http'
import https from 'https'
import { URL } from 'url'

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return
  const text = fs.readFileSync(filePath, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = value
  }
}

loadEnvFile(path.resolve(process.cwd(), '.env'))
loadEnvFile(path.resolve(process.cwd(), '.env.production'))

const enabled = process.env.ENABLE_SCHEDULE_WORKER !== 'false'
const cronSecret = process.env.CRON_SECRET || ''
const port = process.env.PORT || '8888'
const baseUrl = (
  process.env.SCHEDULE_BASE_URL || `http://127.0.0.1:${port}/api/schedule/`
).replace(/\/?$/, '/')

if (!enabled) {
  console.info('[schedule-worker] disabled via ENABLE_SCHEDULE_WORKER=false')
  process.exit(0)
}

if (!cronSecret || cronSecret.length < 16) {
  console.error('[schedule-worker] CRON_SECRET must be set (>= 16 chars)')
  process.exit(1)
}

function requestGet(urlString) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString)
    const lib = url.protocol === 'https:' ? https : http
    const req = lib.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method: 'GET',
        headers: {
          'x-cron-secret': cronSecret,
          Accept: 'application/json',
        },
        timeout: 55000,
      },
      (res) => {
        let body = ''
        res.on('data', (chunk) => {
          body += chunk
        })
        res.on('end', () => {
          resolve({ status: res.statusCode || 0, body })
        })
      }
    )
    req.on('timeout', () => {
      req.destroy(new Error('timeout'))
    })
    req.on('error', reject)
    req.end()
  })
}

async function trigger(jobPath) {
  const url = baseUrl + jobPath
  try {
    const res = await requestGet(url)
    if (res.status >= 400) {
      console.error(`[schedule-worker] ${jobPath} -> HTTP ${res.status} ${res.body.slice(0, 200)}`)
    } else {
      console.info(`[schedule-worker] ${jobPath} ok`)
    }
  } catch (e) {
    console.error(`[schedule-worker] ${jobPath} failed:`, e.message || e)
  }
}

function every(ms, fn) {
  // run soon after start, then on interval
  setTimeout(() => {
    void fn()
    setInterval(() => void fn(), ms)
  }, 2000)
}

console.info(`[schedule-worker] targeting ${baseUrl}`)

every(10_000, () => trigger('schedule_blockscan'))
every(60_000, () => trigger('schedule_invoice_expired'))
every(60_000, () => trigger('schedule_pull_payment_expired'))
every(60_000, () => trigger('schedule_payment_request_expired'))
