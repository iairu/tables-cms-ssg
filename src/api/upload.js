import fs from 'fs';
import path from 'path';
import { getUploadDir } from '../utils/pathResolver';

export const config = {
  bodyParser: {
    json: {
      limit: '2mb'
    },
    urlencoded: {
      limit: '2mb',
      extended: true
    }
  }
};

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const uploadDir = getUploadDir();

  try {
    const { fileData, fileName } = req.body;

    if (!fileData || !fileName) {
      return res.status(400).send('Missing file data or file name.');
    }

    const timestamp = Date.now();
    const newFileName = `${timestamp}_${fileName}`;

    const base64Data = fileData.replace(/^data:image\/[\w\+\-\.]+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    const filePath = path.join(uploadDir, newFileName);

    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        console.error('Error saving file:', err);
        return res.status(500).send('Error saving file.');
      }
      res.json({ url: `/uploads/${newFileName}` });
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).send('Error processing upload.');
  }
}