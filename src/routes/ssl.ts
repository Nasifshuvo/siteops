import { Router } from 'express';
import { apiKeyAuth } from '../middleware/auth.js';
import { 
    getSSLStatus,
    generateSSL,
    renewSSL,
    removeSSL,
    listSSLCertificates
} from '../controllers/sslController.js';

const router = Router();

// All SSL management routes require API key authentication
router.use(apiKeyAuth);

// GET /site/ssl/list - List all SSL certificates
router.get('/list', listSSLCertificates);

// GET /site/ssl/:domain - Get SSL status for a domain
router.get('/:domain', getSSLStatus);

// POST /site/ssl/generate - Generate Let's Encrypt certificate
router.post('/generate', generateSSL);

// POST /site/ssl/renew/:domain - Renew certificate
router.post('/renew/:domain', renewSSL);

// DELETE /site/ssl/:domain - Remove certificate
router.delete('/:domain', removeSSL);

export default router;
