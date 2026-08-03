# Environment Configuration Guide

## Overview

The application now supports multiple environments with automatic proxy configuration. You no longer need to manually change proxy settings when switching between environments.

## Quick Start

### Local Development (Backend on your machine)
```bash
npm run start:local
```
- Proxy: `https://localhost:7001` → Your local backend
- Use when: Running both frontend and backend locally

### Development Server (Shared dev environment)
```bash
npm run start:dev
```
- Proxy: `https://10.0.0.246:8443` → Shared development server
- Use when: Testing with shared development database/API

### Production (Testing production config)
```bash
npm run start:prod
```
- Proxy: Production server
- Use when: Testing production configuration before deployment

## Files Structure

```
FMPI.Ui/
├── proxy.conf.local.json      # Local backend (port 7001)
├── proxy.conf.dev.json        # Dev server (10.0.0.246:8443)
├── proxy.conf.prod.json       # Production server
├── angular.json               # Angular configuration
├── package.json               # NPM scripts
└── src/environments/
    ├── environment.ts         # Local/development environment
    └── environment.prod.ts    # Production environment
```

## Configuration Files

### 1. proxy.conf.local.json
```json
{
  "/api": {
    "target": "https://localhost:7001",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```
**Edit this** to change your local backend port.

### 2. proxy.conf.dev.json
```json
{
  "/api": {
    "target": "https://10.0.0.246:8443",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```
**Edit this** to change the development server URL.

### 3. proxy.conf.prod.json
```json
{
  "/api": {
    "target": "https://your-production-server:8443",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```
**Edit this** to change the production server URL.

## How It Works

### Development Mode
When you run `npm run start:dev`:
1. Angular reads `angular.json`
2. Sees `--configuration=dev`
3. Loads `proxy.conf.dev.json`
4. All `/api/*` requests are forwarded to the dev server

### Production Build
When you run `npm run build-prod`:
1. Angular uses `environment.prod.ts`
2. Proxy configuration is NOT used (built app connects directly)
3. API calls go directly to the URL in the environment file

## Updating Backend URLs

### Scenario 1: Local Backend Port Changed
**Before running frontend:**
1. Edit `proxy.conf.local.json`
2. Change `"target": "https://localhost:NEW_PORT"`
3. Run `npm run start:local`

### Scenario 2: Dev Server Moved to New IP
**One-time update:**
1. Edit `proxy.conf.dev.json`
2. Change `"target": "https://NEW_IP:PORT"`
3. Commit changes to git
4. Team members pull latest code

### Scenario 3: Production Deployment
**During deployment:**
1. Edit `proxy.conf.prod.json` with production server
2. Edit `environment.prod.ts` if needed
3. Build: `npm run build-prod`
4. Deploy the `dist/FMPI.Ui` folder

## NPM Scripts Reference

| Command | Description | Proxy Config |
|---------|-------------|--------------|
| `npm start` | Default (local) | proxy.conf.local.json |
| `npm run start:local` | Local backend | proxy.conf.local.json |
| `npm run start:dev` | Dev server | proxy.conf.dev.json |
| `npm run start:prod` | Production test | proxy.conf.prod.json |
| `npm run build` | Development build | N/A |
| `npm run build-prod` | Production build | N/A |

## Angular CLI Commands

You can also use Angular CLI directly:

```bash
# Local
ng serve --configuration=local

# Development
ng serve --configuration=dev

# Production
ng serve --configuration=production

# Build
ng build --configuration=production
```

## Troubleshooting

### "Cannot find module 'proxy.conf.*.json'"
- **Cause:** File doesn't exist or wrong path
- **Solution:** Check that proxy config files exist in project root

### API requests still going to wrong server
- **Cause:** Wrong npm script or configuration
- **Solution:** 
  1. Stop the server (Ctrl+C)
  2. Run the correct command: `npm run start:dev`
  3. Check terminal for "Proxy config file: proxy.conf.*.json"

### SSL/Certificate errors
- **Solution:** Already configured with `"secure": false` in proxy configs

### Backend port keeps changing
- **Solution:** Set a fixed port in `Properties/launchSettings.json` in the API project

## Best Practices

1. **Don't commit local settings:** If you need custom local settings, create `proxy.conf.local.custom.json` and add it to `.gitignore`

2. **Update team-wide changes:** When dev server changes, update `proxy.conf.dev.json` and commit

3. **Test before deploying:** Always test with `npm run start:prod` before building for production

4. **Document changes:** Update this guide when adding new environments

## Migration from Old Setup

If you were manually editing `proxy.conf.json`:

**Old way:**
```bash
# Edit proxy.conf.json manually every time
npm start
```

**New way:**
```bash
# Just use the right command
npm run start:dev    # For dev server
npm run start:local  # For local backend
```

## Questions?

See `PROXY_CONFIGURATIONS.md` for detailed proxy documentation.
