import { type Request, type Response, type NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import type { SiteConfig } from '../types/config.js';

// Get current directory in ESM mode (since __dirname doesn't exist in ESM)
const sitesRoot = path.join(process.cwd(), 'sites');

export const vhostMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // 1. Get the hostname (remove port number if present, e.g. localhost:3000 -> localhost)
    const hostname = req.hostname;

    // 2. Resolve the path to the sites folder
    const sitePath = path.join(sitesRoot, hostname);
    const configPath = path.join(sitePath, 'config.json');

    // 3. Check if site exists
    if (!fs.existsSync(sitePath) || !fs.existsSync(configPath)) {
        // If not found, we can either 404 or pass to a default handler
        // For now, let's just log and 404 to be safe
        console.warn(`[VHost] Site not found for host: ${hostname}`);
        res.status(404).json({ error: 'Site not configured on this node' });
        return;
    }

    try {
        // 4. Load the config
        const rawData = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(rawData) as SiteConfig;

        // 5. Attach to Request object
        req.siteConfig = config;
        req.sitePath = sitePath;

        console.log(`[VHost] Routed ${hostname} -> ${sitePath}`);
        next();
    } catch (error) {
        console.error(`[VHost] Config error for ${hostname}`, error);
        res.status(500).json({ error: 'Invalid site configuration' });
    }
};
