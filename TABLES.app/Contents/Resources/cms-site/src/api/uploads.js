import fs from 'fs';
import { getUploadDir } from '../utils/pathResolver';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const uploadDir = getUploadDir();

  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).send('Unable to scan directory.');
    }
    
    const fileUrls = files
      .filter(file => !file.startsWith('.') && file !== 'placeholder')
      .map(file => ({
        name: file,
        url: `/uploads/${file}`,
      }));
    res.json(fileUrls);
  });
}