# FMPI.Ui SSL/TLS Certificate Configuration

## Overview

FMPI.Ui uses different SSL certificates depending on the environment, matching FMPI.Api's certificate strategy.

## Certificate Files

| Environment | Certificate Files | Usage |
|-------------|------------------|-------|
| Development | `dotnet-devcert.crt` & `dotnet-devcert.key` | Local development with Angular dev server (`ng serve`) |
| Production/Docker | `fmpicert.crt` & `fmpicert.key` | Docker containers with Nginx |

## Local Development

### Using Angular Dev Server (ng serve)

The Angular dev server is configured in `angular.json` to use development certificates:

```json
"serve": {
  "options": {
    "sslCert": "dotnet-devcert.crt",
    "sslKey": "dotnet-devcert.key"
  }
}
```

**Run local development server:**
```bash
ng serve
# or
ng serve --configuration=development
```

The dev server will run on `https://localhost:4200` using `dotnet-devcert.crt` and `dotnet-devcert.key`.

### Using Docker (Development)

For Docker-based development with development certificates:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

This configuration:
- Sets `ASPNETCORE_ENVIRONMENT=Development`
- Mounts `dotnet-devcert.crt` and `dotnet-devcert.key` as volumes, replacing the production certificates in the container
- Runs on `https://localhost:4200`

## Production/Docker

### Building the Docker Image

The Dockerfile automatically copies production certificates during build:

```bash
docker build -t fmpi-ui .
```

### Running with Docker Compose (Production)

```bash
docker-compose up --build
```

This configuration:
- Sets `ASPNETCORE_ENVIRONMENT=Production`
- Uses `fmpicert.crt` and `fmpicert.key` (copied during image build)
- Runs on `https://localhost:4200`

### Running Standalone Docker Container

```bash
docker run -d \
  --name fmpi-ui \
  -p 4200:4200 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  fmpi-ui
```

## Nginx Configuration

The Nginx server (`nginx.conf`) is configured to:
- Listen on port 4200 with SSL
- Use certificates from `/usr/share/nginx/html/fmpicert.crt` and `/usr/share/nginx/html/fmpicert.key`
- In production Docker, these are the `fmpicert.*` files copied during build
- In development Docker, these are overridden by volume mounts to `dotnet-devcert.*` files

## Certificate File Requirements

### Development Certificates
- **Format**: PEM format (`.crt` and `.key` files)
- **Files needed**: 
  - `dotnet-devcert.crt` - SSL certificate
  - `dotnet-devcert.key` - SSL private key

### Production Certificates
- **Format**: PEM format (`.crt` and `.key` files)
- **Files needed**:
  - `fmpicert.crt` - SSL certificate
  - `fmpicert.key` - SSL private key

**Note**: Both certificate files must be present in the FMPI.Ui project root directory for Docker builds.

## Comparison with FMPI.Api

| Aspect | FMPI.Api | FMPI.Ui |
|--------|----------|---------|
| **Development Cert** | `dotnet-devcert.pfx` (password-protected) | `dotnet-devcert.crt` + `dotnet-devcert.key` (PEM format) |
| **Production Cert** | `fmpicert.pfx` (password-protected) | `fmpicert.crt` + `fmpicert.key` (PEM format) |
| **Configuration** | `appsettings.Development.json` / `appsettings.Production.json` | `angular.json` (dev) / `nginx.conf` (prod) |
| **Server** | Kestrel | Nginx |
| **Port** | 8443 (dev) / 9443 (prod) | 4200 (both) |

Both projects use the same certificate files but in different formats suitable for their respective web servers (Kestrel uses PFX, Nginx uses PEM).
