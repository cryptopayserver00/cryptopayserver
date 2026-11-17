import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData, CorsMiddleware, CorsMethod, HttpMethod } from '..'
import fs from 'fs'
import path from 'path'
import { randomBytes } from 'crypto'
import formidable from 'formidable'
import { FILE_TYPE } from '@/packages/constants'
import { rateLimit, requireAuth } from '@/lib/auth'

export const config = {
  api: {
    bodyParser: false,
  },
}

const ALLOWED_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  // .svg omitted — can carry script payloads when served same-origin
  '.pdf',
  '.txt',
  '.csv',
  '.css', // store custom branding CSS (public uploads/image/{userId})
])

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

function matchesMagic(buf: Buffer, ext: string): boolean {
  if (ext === '.png') return buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47
  if (ext === '.jpg' || ext === '.jpeg') return buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
  if (ext === '.gif') return buf.length >= 4 && buf.slice(0, 4).toString('ascii') === 'GIF8'
  if (ext === '.webp') {
    return (
      buf.length >= 12 &&
      buf.slice(0, 4).toString('ascii') === 'RIFF' &&
      buf.slice(8, 12).toString('ascii') === 'WEBP'
    )
  }
  if (ext === '.pdf') return buf.length >= 5 && buf.slice(0, 5).toString('ascii') === '%PDF-'
  if (ext === '.txt' || ext === '.csv' || ext === '.css') {
    // Reject obvious HTML/script polyglots in text uploads.
    const head = buf.slice(0, 512).toString('utf8').toLowerCase()
    if (
      head.includes('<script') ||
      head.includes('<html') ||
      head.includes('<?php') ||
      head.includes('javascript:')
    ) {
      return false
    }
    return true
  }
  return false
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod)

    if (req.method !== HttpMethod.POST) {
      return res.status(405).json({ message: 'Method not allowed', result: false, data: null })
    }

    const session = await requireAuth(req, res)
    if (!session) return

    if (
      !(await rateLimit(req, res, {
        scope: `upload:${session.userId}`,
        limit: 30,
        windowMs: 15 * 60 * 1000,
      }))
    ) {
      return
    }

    const fileType = req.query.file_type

    let filePath = ''
    /** Images stay public for store branding; documents are private (auth download API). */
    let publicStatic = true

    switch (fileType) {
      case FILE_TYPE.Image:
        filePath = 'image'
        publicStatic = true
        break
      case FILE_TYPE.Document:
        filePath = 'document'
        publicStatic = false
        break
      default:
        // Audio/video/compressed/other disabled until content sniffing is complete.
        return res.status(200).json({ message: 'Invalid file type', result: false, data: null })
    }

    // Scope images/documents under the uploader's userId (ownership checks on use).
    const uploadDir = publicStatic
      ? path.join(process.cwd(), `public/uploads/${filePath}`, String(session.userId))
      : path.join(process.cwd(), `storage/uploads/${filePath}`, String(session.userId))

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const form = formidable({
      uploadDir,
      keepExtensions: false,
      multiples: true,
      maxFileSize: MAX_FILE_SIZE,
      filter: ({ originalFilename }) => {
        const ext = path.extname(originalFilename || '').toLowerCase()
        return ALLOWED_EXTENSIONS.has(ext)
      },
    })

    const [, files] = await form.parse(req)

    const urls: string[] = []

    for (const item of files.file || []) {
      if (!item) {
        return res.status(200).json({ message: 'Cannot find item', result: false, data: null })
      }

      const ext = path.extname(item.originalFilename || '').toLowerCase()
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        try {
          fs.unlinkSync(item.filepath)
        } catch {
          // ignore
        }
        return res.status(200).json({ message: 'File type not allowed', result: false, data: null })
      }

      if (
        fileType === FILE_TYPE.Image &&
        !['.png', '.jpg', '.jpeg', '.gif', '.webp', '.css'].includes(ext)
      ) {
        try {
          fs.unlinkSync(item.filepath)
        } catch {
          // ignore
        }
        return res.status(200).json({ message: 'Image type not allowed', result: false, data: null })
      }
      if (fileType === FILE_TYPE.Document && !['.pdf', '.txt', '.csv'].includes(ext)) {
        try {
          fs.unlinkSync(item.filepath)
        } catch {
          // ignore
        }
        return res.status(200).json({ message: 'Document type not allowed', result: false, data: null })
      }

      const sniffLen = ['.txt', '.csv', '.css'].includes(ext) ? 512 : 16
      const head = Buffer.alloc(sniffLen)
      const fd = fs.openSync(item.filepath, 'r')
      try {
        fs.readSync(fd, head, 0, sniffLen, 0)
      } finally {
        fs.closeSync(fd)
      }
      if (!matchesMagic(head, ext)) {
        try {
          fs.unlinkSync(item.filepath)
        } catch {
          // ignore
        }
        return res.status(200).json({ message: 'File content does not match extension', result: false, data: null })
      }

      const safeName = `${Date.now()}-${randomBytes(8).toString('hex')}${ext}`
      const dest = path.join(uploadDir, safeName)
      fs.renameSync(item.filepath, dest)

      if (publicStatic) {
        urls.push(`/uploads/${filePath}/${session.userId}/${safeName}`)
      } else {
        // Auth + owner-gated download — not under public/
        urls.push(`/api/tool/download_file?name=${encodeURIComponent(safeName)}`)
      }
    }

    if (urls.length === 0) {
      return res.status(200).json({ message: 'No files uploaded', result: false, data: null })
    }

    return res.status(200).json({
      message: '',
      result: true,
      data: {
        urls,
      },
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: 'Internal server error',
      result: false,
      data: null,
    })
  }
}
