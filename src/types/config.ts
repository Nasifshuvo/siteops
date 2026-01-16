export interface SiteConfig {
    siteName: string;
    defaultLanguage: string;
    crm: {
        provider: 'checkoutChamp' | 'stripe'; // Union type: restricts values to these two
        apiUser?: string;
        apiKey?: string;
        endpoint?: string;
    };
    campaigns: Record<string, {
        campaignId: string;
        gatewayId: string;
        productId?: string;
    }>;
}

// We also need to extend the Express Request object so TS knows about our new custom properties
declare global {
    namespace Express {
        interface Request {
            siteConfig?: SiteConfig;
            sitePath?: string;
            language?: string;
        }
    }
}
