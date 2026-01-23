import fs from 'fs';
import path from 'path';
import { getUploadDir } from '../utils/pathResolver';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const uploadDir = getUploadDir();

  try {
    // Read all files in upload directory
    const files = fs.readdirSync(uploadDir);
    
    let deletedCount = 0;
    let errors = [];

    // Delete each file (except placeholder and hidden files)
    files.forEach(file => {
      if (!file.startsWith('.') && file !== 'placeholder') {
        try {
          const filePath = path.join(uploadDir, file);
          fs.unlinkSync(filePath);
          deletedCount++;
        } catch (err) {
          errors.push({ file, error: err.message });
        }
      }
    });

    if (errors.length > 0) {
      res.status(207).json({
        message: `Purged ${deletedCount} files with ${errors.length} errors`,
        deletedCount,
        errors
      });
    } else {
      res.status(200).json({
        message: `Successfully purged ${deletedCount} files`,
        deletedCount
      });
    }
  } catch (err) {
    console.error('Error purging uploads:', err);
    res.status(500).json({
      message: 'Failed to purge uploads',
      error: err.message
    });
  }
}