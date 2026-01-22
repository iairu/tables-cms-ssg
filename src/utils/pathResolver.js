import fs from 'fs';
import path from 'path';

/**
 * Dynamically determines the upload directory based on write permissions.
 * Prioritizes process.cwd() for development and falls back to 
 * process.resourcesPath for packaged production environments.
 */
 
 export function getUploadDir() {
   // Use path.resolve to ensure we have a clean, absolute string
   const primaryPath = path.resolve(__dirname, '../../static/uploads');
   let fallbackPath = '';
   try {
     fallbackPath = path.join(process.resourcesPath, 'static/uploads');
   } catch (e) {
     console.warn('[Path Resolver] Error determining fallbackPath using process.resourcesPath:', e.message);
     fallbackPath = '';
   }
 
   console.log('[Path Resolver] Primary Path:', primaryPath);
 
   // Define helper function clearly
   function checkWritable(p) {
     if (!p) return false;
     try {
       // If the path doesn't exist, we must check if the parent directory 
       // allows us to create the new folder.
       const dirToCheck = fs.existsSync(p) ? p : path.dirname(p);
       fs.accessSync(dirToCheck, fs.constants.W_OK);
       return true;
     } catch (e) {
       console.warn(`[Path Resolver] Path ${p} is not writable:`, e.message);
       return false;
     }
   }
 
   // Determine active path
   const activePath = checkWritable(primaryPath) ? primaryPath : fallbackPath;
 
   console.log('[Path Resolver] Selected Active Path:', activePath);
 
   // Ensure the directory exists
   try {
     if (!fs.existsSync(activePath)) {
       fs.mkdirSync(activePath, { recursive: true });
     }
   } catch (err) {
     console.error('[Path Resolver] Failed to create directory:', err);
   }
 
   return activePath;
 }