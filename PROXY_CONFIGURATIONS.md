# Angular Proxy Configurations

This directory contains proxy configuration files for different environments. These files tell the Angular dev server where to forward API requests.

## Available Configurations

### 1. **Local Development** (`proxy.conf.local.json`)
- **Target:** `https://localhost:7001`
- **Use Case:** Running backend locally on your machine
- **Command:** `npm start` or `npm run start:local`

### 2. **Development Server** (`proxy.conf.dev.json`)
- **Target:** `https://10.0.0.246:8443`
- **Use Case:** Connecting to shared development server
- **Command:** `npm run start:dev`

### 3. **Production** (`proxy.conf.prod.json`)
- **Target:** `https://your-production-server:8443`
- **Use Case:** Production environment
- **Command:** `npm run start:prod` (for testing) or `npm run build` for deployment

## How to Use

### Option 1: Using NPM Scripts (Recommended)

```bash
# Local development (backend running on your machine)
npm run start:local

# Development server (connecting to 10.0.0.246)
npm run start:dev

# Production (for testing production config)
npm run start:prod
```

### Option 2: Using Angular CLI Directly

```bash
# Local
ng serve --configuration=local

# Development
ng serve --configuration=dev

# Production
ng serve --configuration=production
```

## Updating Backend URL

### For Local Development
Edit `proxy.conf.local.json`:
```json
{
  "/api": {
    "target": "https://localhost:YOUR_PORT",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

### For Development Server
Edit `proxy.conf.dev.json`:
```json
{
  "/api": {
    "target": "https://YOUR_DEV_SERVER:PORT",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

### For Production
Edit `proxy.conf.prod.json`:
```json
{
  "/api": {
    "target": "https://YOUR_PROD_SERVER:PORT",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

## How It Works

When you make an HTTP call in Angular like:
```typescript
this.http.get('/api/ApplicationConfiguration/GetAll')
```

The Angular dev server:
1. Intercepts the request
2. Forwards it to the target URL defined in the proxy config
3. Returns the response back to your Angular app

This allows you to use relative URLs (`/api/...`) in your code while the proxy handles routing to the correct backend server.

## Troubleshooting

### API Requests Returning HTML Instead of JSON
- **Cause:** Proxy is not configured or pointing to wrong port
- **Solution:** Check that the proxy config target matches your backend port

### SSL/Certificate Errors
- **Solution:** Set `"secure": false` in proxy config (already configured)

### CORS Errors
- **Solution:** The proxy should handle CORS, but ensure backend has CORS enabled

## Finding Your Backend Port

When you run the backend (`dotnet run`), look for:
```
Now listening on: https://localhost:7001
```

Use that port number (7001) in your proxy configuration.

## Build for Production

When building for production, the API URLs are baked into the application:

```bash
# Build for production
npm run build

# The built app will use the API URL from environment.prod.ts
```

For production deployment, you may need to configure the web server (nginx, IIS, etc.) to proxy API requests to your backend API.
