import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Note: You might need to implement a different way to retrieve this information
  // as API routes are stateless and don't have access to session data
  const translatedFilePath = req.query.filePath as string;

  if (translatedFilePath && fs.existsSync(translatedFilePath)) {
    res.status(200).json({ status: 'completed', result: 'Translation completed. You can now download the file.' });
  } else {
    res.status(200).json({ status: 'processing' });
  }
}