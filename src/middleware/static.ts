import { type Request, type Response, type NextFunction } from 'express';
import path from 'path';
import fs from 'fs';

export const staticMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // 1. Safety Check
    if (!req.siteConfig || !req.sitePath) {
        return next();
    }

    const publicRoot = path.join(req.sitePath, 'public');
    
    // 3. Parse the URL
    // Regex for potential language code
    const langRegex = /^\/([a-z]{2}(-[a-z]{2})?)(\/|$)/i;
    const match = req.path.match(langRegex);

    let language = req.siteConfig.defaultLanguage;
    let filePath = req.path;

    if (match && match[1]) {
        const detectedLang = match[1];
        
        // CRITICAL FIX: Only treat as language if it exists in our config!
        const isValidLang = req.siteConfig.campaigns && req.siteConfig.campaigns[detectedLang];

        if (isValidLang || detectedLang === req.siteConfig.defaultLanguage) {
            language = detectedLang;
            filePath = req.path.replace(langRegex, '/') || '/';
        }
    }

    req.language = language;

    // 4. Resolve key paths
    if (filePath === '/') {
        filePath = '/index.html';
    }

    const absolutePath = path.join(publicRoot, filePath);

    // 5. Logic: Try to find the file
    let foundPath: string | null = null;

    if (fs.existsSync(absolutePath) && fs.lstatSync(absolutePath).isFile()) {
        foundPath = absolutePath;
    } else if (fs.existsSync(absolutePath + '.html')) {
        foundPath = absolutePath + '.html';
    } else if (fs.existsSync(path.join(absolutePath, 'index.html'))) {
        foundPath = path.join(absolutePath, 'index.html');
    }

    if (foundPath) {
        return res.sendFile(foundPath);
    }

    next();
};
