import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const uploadDir = path.join(process.cwd(), 'static', 'uploads');

  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // If the directory doesn't exist, create it and return an empty array.
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        return res.json([]);
      }
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
