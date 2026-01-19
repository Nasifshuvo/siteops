import { type Request, type Response } from 'express';
import path from 'path';
import fs from 'fs';
import type { SiteConfig } from '../types/config.js';

// Sites root: configurable via SITES_PATH env variable
const getSitesRoot = () => process.env.SITES_PATH || path.join(process.cwd(), 'sites');

/**
 * List all configured sites
 * GET /site/list
 */
export const listSites = (req: Request, res: Response) => {
    try {
        const sitesRoot = getSitesRoot();

        if (!fs.existsSync(sitesRoot)) {
            res.json({ sites: [] });
            return;
        }

        const entries = fs.readdirSync(sitesRoot, { withFileTypes: true });
        const sites = entries
            .filter(entry => entry.isDirectory())
            .map(entry => {
                const configPath = path.join(sitesRoot, entry.name, 'config.json');
                let config: SiteConfig | null = null;

                if (fs.existsSync(configPath)) {
                    try {
                        const rawData = fs.readFileSync(configPath, 'utf-8');
                        config = JSON.parse(rawData);
                    } catch {
                        // Invalid config, skip
                    }
                }

                return {
                    id: entry.name,
                    siteName: config?.siteName || entry.name,
                    defaultLanguage: config?.defaultLanguage || 'unknown',
                    hasConfig: config !== null,
                    hasPublicDir: fs.existsSync(path.join(sitesRoot, entry.name, 'public'))
                };
            });

        res.json({ sites });
    } catch (error) {
        console.error('[SiteController] Error listing sites:', error);
        res.status(500).json({ error: 'Failed to list sites' });
    }
};

/**
 * Get site configuration
 * GET /site/config/:site_id
 */
export const getSiteConfig = (req: Request, res: Response) => {
    try {
        const site_id = req.params.site_id as string;
        const sitesRoot = getSitesRoot();
        const sitePath = path.join(sitesRoot, site_id);
        const configPath = path.join(sitePath, 'config.json');

        if (!fs.existsSync(sitePath)) {
            res.status(404).json({ error: 'Site not found' });
            return;
        }

        if (!fs.existsSync(configPath)) {
            res.status(404).json({ error: 'Site configuration not found' });
            return;
        }

        const rawData = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(rawData);

        res.json({ 
            id: site_id, 
            config,
            path: sitePath
        });
    } catch (error) {
        console.error('[SiteController] Error getting site config:', error);
        res.status(500).json({ error: 'Failed to get site configuration' });
    }
};

/**
 * Create a new site
 * POST /site/create
 * Body: { domain: string, config: SiteConfig }
 */
export const createSite = (req: Request, res: Response) => {
    try {
        const { domain, config } = req.body;

        // Validation
        if (!domain || typeof domain !== 'string') {
            res.status(400).json({ error: 'Domain is required' });
            return;
        }

        if (!config || typeof config !== 'object') {
            res.status(400).json({ error: 'Config is required' });
            return;
        }

        // Sanitize domain (basic security)
        const sanitizedDomain = domain.toLowerCase().replace(/[^a-z0-9.-]/g, '');
        if (sanitizedDomain !== domain.toLowerCase()) {
            res.status(400).json({ error: 'Invalid domain format' });
            return;
        }

        const sitesRoot = getSitesRoot();
        const sitePath = path.join(sitesRoot, sanitizedDomain);

        // Check if site already exists
        if (fs.existsSync(sitePath)) {
            res.status(409).json({ error: 'Site already exists' });
            return;
        }

        // Create site directory structure
        fs.mkdirSync(sitePath, { recursive: true });
        fs.mkdirSync(path.join(sitePath, 'public'), { recursive: true });

        // Write config file
        const configPath = path.join(sitePath, 'config.json');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf-8');

        // Create default index.html
        const indexPath = path.join(sitePath, 'public', 'index.html');
        const defaultHtml = `<!DOCTYPE html>
<html lang="${config.defaultLanguage || 'en'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.siteName || sanitizedDomain}</title>
</head>
<body>
    <h1>Welcome to ${config.siteName || sanitizedDomain}</h1>
    <p>Site is configured and ready.</p>
</body>
</html>`;
        fs.writeFileSync(indexPath, defaultHtml, 'utf-8');

        console.log(`[SiteController] Created site: ${sanitizedDomain}`);

        res.status(201).json({ 
            message: 'Site created successfully',
            id: sanitizedDomain,
            path: sitePath
        });
    } catch (error) {
        console.error('[SiteController] Error creating site:', error);
        res.status(500).json({ error: 'Failed to create site' });
    }
};

/**
 * Update site configuration
 * PUT /site/update
 * Body: { domain: string, config: Partial<SiteConfig> }
 */
export const updateSite = (req: Request, res: Response) => {
    try {
        const { domain, config } = req.body;

        // Validation
        if (!domain || typeof domain !== 'string') {
            res.status(400).json({ error: 'Domain is required' });
            return;
        }

        if (!config || typeof config !== 'object') {
            res.status(400).json({ error: 'Config is required' });
            return;
        }

        const sitesRoot = getSitesRoot();
        const sitePath = path.join(sitesRoot, domain);
        const configPath = path.join(sitePath, 'config.json');

        // Check if site exists
        if (!fs.existsSync(sitePath)) {
            res.status(404).json({ error: 'Site not found' });
            return;
        }

        // Read existing config
        let existingConfig: SiteConfig = {} as SiteConfig;
        if (fs.existsSync(configPath)) {
            const rawData = fs.readFileSync(configPath, 'utf-8');
            existingConfig = JSON.parse(rawData);
        }

        // Merge configs (shallow merge, config values override existing)
        const updatedConfig = { ...existingConfig, ...config };

        // Write updated config
        fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 4), 'utf-8');

        console.log(`[SiteController] Updated site: ${domain}`);

        res.json({ 
            message: 'Site updated successfully',
            id: domain,
            config: updatedConfig
        });
    } catch (error) {
        console.error('[SiteController] Error updating site:', error);
        res.status(500).json({ error: 'Failed to update site' });
    }
};
