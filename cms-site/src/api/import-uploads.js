import fs from 'fs';
import path from 'path';
import { getUploadDir } from '../utils/pathResolver';

export const config = {
  bodyParser: {
    json: {
      limit: '50mb'
    }
  }
};

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const uploadDir = getUploadDir();

  try {
    // Clear the uploads directory first
    fs.readdirSync(uploadDir).forEach(file => {
      // a simple placeholder file exists in this directory, we should not delete it
      if (file === 'placeholder') return;
      try {
        fs.unlinkSync(path.join(uploadDir, file));
      } catch (err) {
        console.error(`Failed to delete file: ${file}`, err);
      }
    });

    const { uploads } = req.body;

    if (!uploads || typeof uploads !== 'object') {
      return res.status(400).send('Invalid uploads data.');
    }

    const importErrors = [];

    Object.entries(uploads).forEach(([fileName, fileData]) => {
      try {
        if (!fileData || !fileName) {
          throw new Error(`Invalid file data or name for ${fileName}`);
        }

        const base64Data = fileData.replace(/^data:[^;]+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        const filePath = path.join(uploadDir, fileName);

        fs.writeFileSync(filePath, buffer);
      } catch (error) {
        console.error(`Error saving file ${fileName}:`, error);
        importErrors.push(fileName);
      }
    });

    if (importErrors.length > 0) {
      return res.status(500).json({ message: 'Some files failed to import.', failedFiles: importErrors });
    }

    res.status(200).json({ message: 'Uploads imported successfully.' });

  } catch (error) {
    console.error('Import error:', error);
    res.status(500).send('Error processing import.');
  }
}