# Nginx Features Migration to Headless Core

This document lists all features from the nginx configuration that need to be handled by the Headless Core Node.js application.

## Features from nginx-config.txt

### 1. Language Prefix Routing ✅
**Nginx:**
```nginx
location ~* ^/(en|be-fr|at|de|fr|ch-de|ch-fr|fi|no|se|it|be-nl)/([^\.]+)$ {
    rewrite ^/(en|be-fr|at|de|fr|ch-de|ch-fr|fi|no|se|it|be-nl)/([^\.]+)$ /$2.html last;
}
```

**Behavior:**
- `/en/checkout` → serves `/checkout.html` with `language = en`
- `/de/upsell-2b` → serves `/upsell-2b.html` with `language = de`
- `/be-fr/quiz` → serves `/quiz.html` with `language = be-fr`

**Node Implementation:** `staticMiddleware` - Strip language prefix, set `req.language`, serve file

---

### 2. Extended Language Codes ✅
**Supported codes:** `en`, `be-fr`, `at`, `de`, `fr`, `ch-de`, `ch-fr`, `fi`, `no`, `se`, `it`, `be-nl`

**Node Implementation:** Updated regex to support both 2-letter and compound codes (e.g., `be-fr`, `ch-de`)

---

### 3. Root Redirect to Default Language ✅
**Nginx:**
```nginx
location = / {
    return 302 /en/;
}
```

**Behavior:** Visiting `/` redirects to `/{defaultLanguage}/`

**Node Implementation:** `staticMiddleware` - Check if path is `/` and redirect to `/{defaultLanguage}/`

---

### 4. Clean URLs (.html extension) ✅
**Nginx:**
```nginx
location ~* ^/([^\.]+)$ {
    rewrite ^/([^\.]+)$ /$1.html last;
}
```

**Behavior:**
- `/checkout` → serves `/checkout.html`
- `/faq` → serves `/faq.html`

**Node Implementation:** `staticMiddleware` - Try appending `.html` if file not found

---

### 5. POST Method Handling ✅
**Nginx:**
```nginx
error_page 405 = @handle_post_as_get;
location @handle_post_as_get {
    internal;
    try_files $uri $uri.html =404;
}
```

**Behavior:** POST requests to static files are handled as GET (for form submissions to static pages)

**Node Implementation:** `staticMiddleware` - Handle all HTTP methods uniformly for static files

---

### 6. try_files Logic ✅
**Nginx:**
```nginx
try_files $uri $uri.html $uri/ =404;
```

**Behavior:** Try in order:
1. Exact file (`/checkout.html`)
2. With .html extension (`/checkout` → `/checkout.html`)
3. As directory with index (`/about/` → `/about/index.html`)
4. Return 404

**Node Implementation:** `staticMiddleware` - Implemented same logic

---

### 7. Security: Block .ht* Files ✅
**Nginx:**
```nginx
location ~ /\.ht {
    deny all;
}
```

**Behavior:** Block access to `.htaccess`, `.htpasswd`, etc.

**Node Implementation:** `staticMiddleware` - Return 403 for paths containing `/.ht`

---

### 8. Static Assets Serving ✅
**Directories:** `/assets/`, `/css/`, `/js/`, `/font/`, `/i18n/`

**Node Implementation:** Served directly from `public/` directory

---

## Site Configuration Required

For language routing to work, the site's `config.json` must include all supported languages in `campaigns`:

```json
{
    "siteName": "Slimivex",
    "defaultLanguage": "en",
    "campaigns": {
        "en": { "campaignId": "1", "gatewayId": "1" },
        "de": { "campaignId": "2", "gatewayId": "1" },
        "fr": { "campaignId": "3", "gatewayId": "1" },
        "be-fr": { "campaignId": "4", "gatewayId": "1" },
        "be-nl": { "campaignId": "5", "gatewayId": "1" },
        "at": { "campaignId": "6", "gatewayId": "1" },
        "ch-de": { "campaignId": "7", "gatewayId": "1" },
        "ch-fr": { "campaignId": "8", "gatewayId": "1" },
        "fi": { "campaignId": "9", "gatewayId": "1" },
        "no": { "campaignId": "10", "gatewayId": "1" },
        "se": { "campaignId": "11", "gatewayId": "1" },
        "it": { "campaignId": "12", "gatewayId": "1" }
    }
}
```

---

## Migration Status

| Feature | Nginx | Node.js | Status |
|---------|-------|---------|--------|
| Language prefix routing | ✅ | ✅ | Implemented |
| Extended language codes | ✅ | ✅ | Implemented |
| Root redirect | ✅ | ✅ | Implemented |
| Clean URLs | ✅ | ✅ | Implemented |
| POST handling | ✅ | ✅ | Implemented |
| try_files logic | ✅ | ✅ | Implemented |
| .ht* blocking | ✅ | ✅ | Implemented |
| Static assets | ✅ | ✅ | Implemented |
| PHP support | ✅ | ❌ | Not needed |
