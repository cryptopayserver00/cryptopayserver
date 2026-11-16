/**
 * One-shot codemod: replace client-trusted userId parsing with requireAuthUserId,
 * and add store/wallet ownership checks where missing.
 */
import fs from 'fs'
import path from 'path'

const root = path.resolve('src/pages/api')
const skip = new Set([
  'login.ts',
  'logout.ts',
  'create_user.ts',
  'send_reset_email.ts',
  'find_user_by_email.ts',
  // public checkout / cron (middleware-gated separately)
  'create_invoice_from_external.ts',
  'create_payout.ts',
  'find_invoice_by_id.ts',
  'find_invoice_by_source_type.ts',
  'find_payment_request_by_id.ts',
  'find_pull_payment_by_id.ts',
  'find_payout_by_source_type.ts',
  'checkout_chain_address.ts',
  'checkout_chain_address_status.ts',
  'get_free_coin.ts',
])

const userIdBlockQuery = `const userId = Number(req.query.user_id)
    if (!userId) {
      return res.status(200).json({ message: 'Invalid userId', result: false, data: null })
    }`

const userIdBlockBody = `const userId = Number(req.body.user_id)
    if (!userId) {
      return res.status(200).json({ message: 'Invalid userId', result: false, data: null })
    }`

const userIdReplaceQuery = `const userId = await requireAuthUserId(req, res, req.query.user_id)
    if (!userId) return`

const userIdReplaceBody = `const userId = await requireAuthUserId(req, res, req.body.user_id)
    if (!userId) return`

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.name.endsWith('.ts')) out.push(full)
  }
  return out
}

function ensureImport(src) {
  if (src.includes("from '@/lib/auth'") || src.includes('from "@/lib/auth"')) {
    if (!src.includes('requireAuthUserId')) {
      return src.replace(
        /import \{([^}]+)\} from '@\/lib\/auth'/,
        (m, inner) => {
          const names = inner.split(',').map((s) => s.trim()).filter(Boolean)
          if (!names.includes('requireAuthUserId')) names.push('requireAuthUserId')
          if (!names.includes('assertStoreOwnedByUser')) names.push('assertStoreOwnedByUser')
          if (!names.includes('assertWalletOwnedByUser')) names.push('assertWalletOwnedByUser')
          if (!names.includes('forbidden')) names.push('forbidden')
          return `import { ${[...new Set(names)].join(', ')} } from '@/lib/auth'`
        }
      )
    }
    return src
  }

  // Insert after first import from '..' or prisma
  const importLine = `import { requireAuthUserId, assertStoreOwnedByUser, assertWalletOwnedByUser, forbidden } from '@/lib/auth'\n`
  const prismaImport = src.indexOf("from '@/lib/prisma'")
  if (prismaImport !== -1) {
    const lineEnd = src.indexOf('\n', prismaImport)
    return src.slice(0, lineEnd + 1) + importLine + src.slice(lineEnd + 1)
  }
  const firstImportEnd = src.indexOf('\n', src.indexOf('import '))
  return src.slice(0, firstImportEnd + 1) + importLine + src.slice(firstImportEnd + 1)
}

function addStoreGuard(src) {
  if (src.includes('assertStoreOwnedByUser')) return src

  const storePatterns = [
    {
      find: /const storeId = Number\(req\.(query|body)\.store_id\)\n\s*if \(!storeId\) \{\n\s*return res\.status\(200\)\.json\(\{ message: 'Invalid storeId', result: false, data: null \}\)\n\s*\}/,
      insertAfter: `
    if (!(await assertStoreOwnedByUser(storeId, userId))) {
      return forbidden(res)
    }`,
    },
  ]

  let out = src
  for (const p of storePatterns) {
    if (p.find.test(out) && out.includes('userId')) {
      out = out.replace(p.find, (match) => match + p.insertAfter)
    }
  }
  return out
}

function addWalletGuard(src) {
  if (src.includes('assertWalletOwnedByUser(') && src.match(/assertWalletOwnedByUser/g)?.length >= 2) {
    // already has usage beyond import — skip naive double-add by checking call sites
  }

  const walletFind = /const walletId = Number\(req\.(query|body)\.wallet_id\)\n\s*if \(!walletId\) \{\n\s*return res\.status\(200\)\.json\(\{ message: 'Invalid walletId', result: false, data: null \}\)\n\s*\}/
  if (!walletFind.test(src)) return src
  if (src.includes('assertWalletOwnedByUser(walletId')) return src
  if (!src.includes('userId')) return src

  return src.replace(walletFind, (match) => {
    return (
      match +
      `
    if (!(await assertWalletOwnedByUser(walletId, userId))) {
      return forbidden(res)
    }`
    )
  })
}

let changed = 0
for (const file of walk(root)) {
  const base = path.basename(file)
  if (skip.has(base)) continue
  if (file.includes('/schedule/')) continue

  let src = fs.readFileSync(file, 'utf8')
  if (src.includes('requireAuthUserId') && !src.includes('Number(req.query.user_id)') && !src.includes('Number(req.body.user_id)')) {
    // already migrated user id; maybe still need store/wallet guards
    const before = src
    src = addStoreGuard(src)
    src = addWalletGuard(src)
    src = ensureImport(src)
    if (src !== before) {
      fs.writeFileSync(file, src)
      changed++
      console.log('updated guards', file)
    }
    continue
  }

  let next = src
  let touched = false

  if (next.includes(userIdBlockQuery)) {
    next = next.replace(userIdBlockQuery, userIdReplaceQuery)
    touched = true
  }
  if (next.includes(userIdBlockBody)) {
    next = next.replace(userIdBlockBody, userIdReplaceBody)
    touched = true
  }

  // looser whitespace-tolerant fallback
  if (!touched) {
    const looseQuery =
      /const userId = Number\(req\.query\.user_id\)\s*\n\s*if \(!userId\) \{\s*\n\s*return res\.status\(200\)\.json\(\{ message: 'Invalid userId', result: false, data: null \}\)\s*\n\s*\}/
    const looseBody =
      /const userId = Number\(req\.body\.user_id\)\s*\n\s*if \(!userId\) \{\s*\n\s*return res\.status\(200\)\.json\(\{ message: 'Invalid userId', result: false, data: null \}\)\s*\n\s*\}/
    if (looseQuery.test(next)) {
      next = next.replace(looseQuery, userIdReplaceQuery)
      touched = true
    }
    if (looseBody.test(next)) {
      next = next.replace(looseBody, userIdReplaceBody)
      touched = true
    }
  }

  if (touched) {
    next = ensureImport(next)
    next = addStoreGuard(next)
    next = addWalletGuard(next)
    fs.writeFileSync(file, next)
    changed++
    console.log('patched', file)
  }
}

console.log('files changed:', changed)
