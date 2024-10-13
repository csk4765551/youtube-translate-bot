import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Note: You might need to implement a different way to retrieve this information
  // as API routes are stateless and don't have access to session data
  const translatedFilePath = req.query.filePath as string;

  if (!translatedFilePath || !fs.existsSync(translatedFilePath)) {
    return res.status(404).json({ message: 'Translated file not found' });
  }

  const fileStream = fs.createReadStream(translatedFilePath);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  res.setHeader('Content-Disposition', 'attachment; filename=translated_script.docx');

  fileStream.pipe(res);

  fileStream.on('close', () => {
    // Delete the temporary file after sending
    fs.unlinkSync(translatedFilePath);
  });
}