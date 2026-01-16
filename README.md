# SiteOps

**A modern, programmable website, proxy, and multisite manager for Node.js.**

SiteOps (formerly `headless-core`) is designed to be a developer-friendly alternative to complex Nginx or Apache configurations. It provides a headless, programmable core that handles virtual hosting, static file serving, and proxy management entirely in Node.js/TypeScript.

## 🚀 Features

-   **Multi-Tenant Virtual Hosting:** Dynamically routes traffic based on hostname (e.g., `localhost`, `example.com`) to isolated site directories.
-   **Configuration-Driven:** Each site is managed via its own `config.json`, allowing for per-site settings without restarting the core.
-   **Programmable Middleware:** Core logic is written in TypeScript, making it easy to extend with custom authentication, logging, or routing rules.
-   **Clean Static Serving:** Custom middleware for serving static assets with clean URLs and language prefix support.
-   **Modern Stack:** Built with TypeScript, ESM, and Vitest.

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Nasifshuvo/siteops.git

# Navigate to directory
cd siteops

# Install dependencies
npm install
```

## 🛠️ Usage

### Development Mode
Runs the server with hot-reloading using `nodemon` and `tsx`.

```bash
npm run dev
```
The server defaults to port `3000`. You can access configured sites via:
- `http://localhost:3000` (Loads content from `sites/localhost/`)

### Production Build
transpile TypeScript to JavaScript and run the production server.

```bash
npm run build
npm start
```

## 📂 Project Structure

```text
siteops/
├── sites/                  # Directory for all hosted sites
│   ├── localhost/          # Default localhost site
│   │   ├── config.json     # Per-site configuration
│   │   └── public/         # Public static assets
│   └── example.com/        # (Example) Another tenant
├── src/
│   ├── middleware/         # Core logic (vhost, static files)
│   ├── types/              # TypeScript definitions
│   ├── app.ts              # Express application setup
│   └── server.ts           # Entry point
└── package.json
```

## 🚦 Roadmap

- [x] Basic Virtual Hosting (VHost)
- [x] Static File Serving
- [ ] Reverse Proxy Management
- [ ] SSL/TLS Cert Management (Let's Encrypt integration)
- [ ] Web-based Admin UI
- [ ] Plugin System

## 📄 License

This project is licensed under the MIT License.
