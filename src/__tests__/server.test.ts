import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../app.js';

describe('System Health Check', () => {
    it('should return 200 OK and status message', async () => {
        const response = await request(app)
            .get('/health')
            .set('Host', 'localhost');
        
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
        expect(response.body.site).toBe('Local Dev Site'); // Shows VHost is working!
        expect(response.body.message).toBe('Headless Core is running');
    });
});
