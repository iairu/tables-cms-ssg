import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const { filename } = req.body;
  const uploadDir = path.join(process.cwd(), 'static', 'uploads');

  if (!filename) {
    return res.status(400).send('Filename not provided.');
  }

  const filePath = path.join(uploadDir, filename);

  // Security check to prevent path traversal
  if (path.dirname(filePath) !== uploadDir) {
    return res.status(400).send('Invalid path.');
  }

  fs.unlink(filePath, err => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).send('File not found.');
      }
      return res.status(500).send('Error deleting file.');
    }
    res.status(200).send('File deleted.');
  });
}
