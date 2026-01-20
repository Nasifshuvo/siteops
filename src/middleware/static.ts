import { type Request, type Response, type NextFunction } from 'express';
import path from 'path';
import fs from 'fs';

/**
 * Static File Middleware
 * Replaces nginx static file handling with Node.js implementation
 * 
 * Features:
 * - Language prefix routing (en, de, be-fr, ch-de, etc.)
 * - Root redirect to default language
 * - Clean URLs (.html extension handling)
 * - try_files logic ($uri, $uri.html, $uri/index.html)
 * - Security: blocks .ht* files
 * - POST method handling for static files
 */
export const staticMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // 1. Safety Check - skip if no site config
    if (!req.siteConfig || !req.sitePath) {
        return next();
    }

    const publicRoot = path.join(req.sitePath, 'public');

    // 2. Security: Block access to .ht* files (like .htaccess)
    if (req.path.includes('/.ht')) {
        res.status(403).json({ error: 'Forbidden' });
        return;
    }

    // 3. Parse language from URL
    // Supports: en, de, fr, be-fr, ch-de, ch-fr, be-nl, at, fi, no, se, it
    const langRegex = /^\/([a-z]{2}(?:-[a-z]{2})?)(\/|$)/i;
    const match = req.path.match(langRegex);

    let language = req.siteConfig.defaultLanguage;
    let filePath = req.path;

    if (match && match[1]) {
        const detectedLang = match[1].toLowerCase();
        
        // Check if this is a valid language in our config
        const isValidLang = req.siteConfig.campaigns && req.siteConfig.campaigns[detectedLang];
        const isDefaultLang = detectedLang === req.siteConfig.defaultLanguage;

        if (isValidLang || isDefaultLang) {
            language = detectedLang;
            // Remove language prefix from path
            filePath = req.path.substring(match[0].length - (match[2] === '/' ? 1 : 0)) || '/';
            if (!filePath.startsWith('/')) {
                filePath = '/' + filePath;
            }
        }
    }

    req.language = language;

    // 4. Root redirect: / → /{defaultLanguage}/
    if (req.path === '/') {
        const redirectUrl = `/${req.siteConfig.defaultLanguage}/`;
        res.redirect(302, redirectUrl);
        return;
    }

    // 5. Handle language root: /en/ → /en/index.html
    if (filePath === '/') {
        filePath = '/index.html';
    }

    // 6. try_files logic: $uri, $uri.html, $uri/index.html
    const absolutePath = path.join(publicRoot, filePath);
    let foundPath: string | null = null;

    // Try exact path
    if (fs.existsSync(absolutePath) && fs.lstatSync(absolutePath).isFile()) {
        foundPath = absolutePath;
    }
    // Try with .html extension (clean URLs)
    else if (!filePath.endsWith('.html') && fs.existsSync(absolutePath + '.html')) {
        foundPath = absolutePath + '.html';
    }
    // Try as directory with index.html
    else if (fs.existsSync(path.join(absolutePath, 'index.html'))) {
        foundPath = path.join(absolutePath, 'index.html');
    }

    // 7. Serve file if found
    if (foundPath) {
        // Set content type based on extension
        const ext = path.extname(foundPath).toLowerCase();
        const mimeTypes: Record<string, string> = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf',
            '.eot': 'application/vnd.ms-fontobject',
            '.otf': 'font/otf',
            '.pdf': 'application/pdf',
            '.zip': 'application/zip'
        };

        if (mimeTypes[ext]) {
            res.type(mimeTypes[ext]);
        }

        return res.sendFile(foundPath);
    }

    // 8. Not found - pass to next middleware
    next();
};
