import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { Document, Paragraph, Packer } from 'docx';
import axios from 'axios';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: 'Error parsing form data' });
    }

    const file = files.file as formidable.File;
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      const content = await extractTextFromDocx(file.filepath);
      const translatedContent = await translateText(content);
      const newFilePath = await createTranslatedDocument(translatedContent);

      // Store the file path for later retrieval
      res.status(200).json({ message: 'Translation completed', filePath: newFilePath });
    } catch (error) {
      console.error('Error processing file:', error);
      res.status(500).json({ message: 'Error processing file' });
    }
  });
}

async function extractTextFromDocx(filePath: string): Promise<string> {
  // TODO: Implement actual text extraction from DOCX
  return "Extracted text from DOCX file";
}

async function translateText(text: string): Promise<string> {
  const api_endpoint = process.env.DIFY_API_ENDPOINT;
  const api_key = process.env.DIFY_API_KEY;

  if (!api_endpoint || !api_key) {
    throw new Error('Dify API configuration is missing');
  }

  const data = {
    inputs: {"input_text": text},
    query: "Translate the following Chinese text to Japanese, proofread it, and extract specialized terms:",
    response_mode: "blocking",
    user: "translator"
  };

  try {
    const response = await axios.post(`${api_endpoint}/chat-messages`, data, {
      headers: {
        'Authorization': `Bearer ${api_key}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.answer;
  } catch (error) {
    console.error('Error calling Dify API:', error);
    throw new Error('Translation failed');
  }
}

async function createTranslatedDocument(content: string): Promise<string> {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph(content),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const fileName = `translated_${Date.now()}.docx`;
  const filePath = path.join(process.cwd(), 'tmp', fileName);
  
  // Ensure the tmp directory exists
  if (!fs.existsSync(path.join(process.cwd(), 'tmp'))) {
    fs.mkdirSync(path.join(process.cwd(), 'tmp'));
  }
  
  fs.writeFileSync(filePath, buffer);
  
  return filePath;
}