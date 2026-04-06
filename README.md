# Auth Subdomain Setup

This folder contains the authentication service that runs on `auth.blazeneuro.com`.

## Architecture

- **Main App**: `blazeneuro.com` (port 3000) - Your main Next.js application
- **Auth Service**: `auth.blazeneuro.com` (port 3001) - Dedicated better-auth backend

## Setup

1. Install dependencies:
```bash
cd oauth
npm install
```

2. Configure environment variables in `.env.local`:
```
DATABASE_URL=your_database_url
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=https://auth.blazeneuro.com
```

3. Run development server:
```bash
npm run dev
```

## Deployment

### Subdomain Configuration

1. Deploy this folder separately to `auth.blazeneuro.com`
2. Set environment variable `ALLOWED_ORIGIN=https://blazeneuro.com`
3. Ensure your main app points to this auth service via `NEXT_PUBLIC_AUTH_URL=https://auth.blazeneuro.com`

### DNS Setup

Create a CNAME or A record:
- `auth.blazeneuro.com` → Your auth service deployment

## API Endpoints

All better-auth endpoints are available at:
- `https://auth.blazeneuro.com/api/auth/*`
