import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { vhostMiddleware } from './middleware/vhost.js';
import './types/config.js';
import { staticMiddleware } from './middleware/static.js';
import siteRoutes from './routes/site.js';
import sslRoutes from './routes/ssl.js';

// Initialize the application
const app = express();

// Global Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for now to allow template scripts/styles
    crossOriginEmbedderPolicy: false
})); 
app.use(cors());   // Handling CORS
app.use(express.json()); // Parse JSON bodies

// Site Management API (before vhost middleware - doesn't need site context)
app.use('/site', siteRoutes);

// SSL Management API
app.use('/site/ssl', sslRoutes);

// Virtual Host Middleware (for site-specific requests)
app.use(vhostMiddleware);
app.use(staticMiddleware);

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ 
        status: 'ok', 
        site: req.siteConfig?.siteName || 'Unknown',
        message: 'Headless Core is running',
        timestamp: new Date().toISOString()
    });
});



export default app;
