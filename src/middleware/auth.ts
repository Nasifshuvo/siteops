import { type Request, type Response, type NextFunction } from 'express';

/**
 * API Key Authentication Middleware
 * Validates requests against the API_KEY environment variable
 * Accepts key via: Authorization header (Bearer token) or X-API-Key header
 */
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = process.env.API_KEY;

    // If no API key is configured, reject all requests (security first)
    if (!apiKey) {
        console.error('[Auth] API_KEY not configured in environment');
        res.status(500).json({ error: 'Server configuration error' });
        return;
    }

    // Extract key from headers
    const authHeader = req.headers.authorization;
    const xApiKey = req.headers['x-api-key'];

    let providedKey: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
        providedKey = authHeader.slice(7);
    } else if (typeof xApiKey === 'string') {
        providedKey = xApiKey;
    }

    // Validate
    if (!providedKey) {
        res.status(401).json({ error: 'Missing API key' });
        return;
    }

    if (providedKey !== apiKey) {
        res.status(403).json({ error: 'Invalid API key' });
        return;
    }

    next();
};
