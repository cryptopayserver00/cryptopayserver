import type { NextApiRequest, NextApiResponse } from 'next';
import { ResponseData, CorsMiddleware, CorsMethod } from '..';
import fs from 'fs';
import path from 'path';
import formidable from 'formidable';
import { FILE_TYPE } from 'packages/constants';

// Turn off the default body parser because multipart/form is to be handled - data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    await CorsMiddleware(req, res, CorsMethod);

    switch (req.method) {
      case 'POST':
        const fileType = req.query.file_type;

        let filePath = '';

        switch (fileType) {
          case FILE_TYPE.Image:
            filePath = 'image';
            break;
          case FILE_TYPE.Document:
            filePath = 'document';
            break;
          case FILE_TYPE.Audio:
            filePath = 'audio';
            break;
          case FILE_TYPE.Video:
            filePath = 'video';
            break;
          case FILE_TYPE.Compressed:
            filePath = 'compressed';
            break;
          case FILE_TYPE.Dev:
            filePath = 'dev';
            break;
          case FILE_TYPE.Other:
            filePath = 'other';
            break;
          default:
            filePath = 'other';
            break;
        }

        const uploadDir = path.join(process.cwd(), `public/uploads/${filePath}`);

        const form = formidable({
          uploadDir,
          keepExtensions: true,
          multiples: true,
        });

        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const [fields, files] = await form.parse(req);

        const urls: string[] = [];

        files.file?.forEach((item) => {
          if (!item) {
            return res.status(200).json({ message: '', result: false, data: null });
          }

          const fileName = item.newFilename;
          const fileUrl = `/uploads/${filePath}/${fileName}`;
          urls.push(fileUrl);
        });

        return res.status(200).json({
          message: '',
          result: true,
          data: {
            urls,
          },
        });

      default:
        throw 'no support the method of api';
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'no support the api', result: false, data: e });
  }
}
