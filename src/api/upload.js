import fs from 'fs';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'static', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

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

  try {
    const { fileData, fileName } = req.body;

    if (!fileData || !fileName) {
      return res.status(400).send('Missing file data or file name.');
    }

    // Strip the data URI prefix (e.g., "data:image/png;base64,")
    const base64Data = fileData.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    const filePath = path.join(uploadDir, fileName);

    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        console.error('Error saving file:', err);
        return res.status(500).send('Error saving file.');
      }
      res.json({ url: `/uploads/${fileName}` });
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).send('Error processing upload.');
  }
}