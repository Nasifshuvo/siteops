import { Router } from 'express';
import { apiKeyAuth } from '../middleware/auth.js';
import { 
    listSites, 
    getSiteConfig, 
    createSite, 
    updateSite 
} from '../controllers/siteController.js';

const router = Router();

// All site management routes require API key authentication
router.use(apiKeyAuth);

// GET /site/list - List all sites
router.get('/list', listSites);

// GET /site/config/:site_id - Get site configuration
router.get('/config/:site_id', getSiteConfig);

// POST /site/create - Create a new site
router.post('/create', createSite);

// PUT /site/update - Update site configuration
router.put('/update', updateSite);

export default router;
