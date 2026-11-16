import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'
import { CorsMiddleware, CorsMethod, HttpMethod } from '..'
import { rateLimit, requireAuth } from '@/lib/auth'

const EXT_CONTENT_TYPE: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
}

/**
 * Serve private document uploads (outside public/). Requires a session.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.GET) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const session = await requireAuth(req, res)
    if (!session) return

    if (!(await rateLimit(req, res, { scope: 'download-file', limit: 60, windowMs: 15 * 60 * 1000 }))) {
      return
    }

    const rawName = Array.isArray(req.query.name) ? req.query.name[0] : req.query.name
    const name = String(rawName || '')
    if (!/^[A-Za-z0-9._-]+$/.test(name)) {
      return res.status(400).json({ message: 'Invalid file name', result: false, data: null })
    }

    const ext = path.extname(name).toLowerCase()
    if (!EXT_CONTENT_TYPE[ext]) {
      return res.status(400).json({ message: 'Unsupported file type', result: false, data: null })
    }

    const baseDir = path.resolve(process.cwd(), 'storage/uploads/document')
    const filePath = path.resolve(baseDir, name)
    if (!filePath.startsWith(baseDir + path.sep)) {
      return res.status(400).json({ message: 'Invalid path', result: false, data: null })
    }

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return res.status(404).json({ message: 'Not found', result: false, data: null })
    }

    res.setHeader('Content-Type', EXT_CONTENT_TYPE[ext]!)
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Content-Disposition', `attachment; filename="${name}"`)
    res.setHeader('Cache-Control', 'private, no-store')

    const stream = fs.createReadStream(filePath)
    stream.on('error', () => {
      if (!res.headersSent) {
        res.status(500).json({ message: 'Internal server error', result: false, data: null })
      } else {
        res.end()
      }
    })
    stream.pipe(res)
  } catch (e) {
    console.error(e)
    if (!res.headersSent) {
      return res.status(500).json({
        message: 'Internal server error',
        result: false,
        data: null,
      })
    }
  }
}
