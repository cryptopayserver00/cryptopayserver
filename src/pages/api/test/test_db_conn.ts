import type { NextApiRequest, NextApiResponse } from 'next'
import { ResponseData } from '..'

/** Disabled diagnostic endpoint — kept only to avoid 404 breakages for old clients. */
export default async function handler(_req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  return res.status(404).json({
    message: 'Not found',
    result: false,
    data: null,
  })
}
