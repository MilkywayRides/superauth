# bLAZEnEURO OAuth Demo App

This is a demo Next.js application that demonstrates OAuth 2.0 integration with bLAZEnEURO auth service.

## Setup

1. **Register OAuth Client**

First, register this demo app with the OAuth service:

```bash
curl -X POST http://localhost:3000/oauth/v1/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo App",
    "redirect_uris": ["http://localhost:3002/auth/callback"],
    "allowed_origins": ["http://localhost:3002"]
  }'
```

Save the `client_id` and `client_secret` from the response.

2. **Update Environment Variables**

Edit `.env.local` with your credentials:

```env
NEXT_PUBLIC_OAUTH_CLIENT_ID=your_client_id_here
OAUTH_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

3. **Install Dependencies**

```bash
npm install
```

4. **Run the Demo**

```bash
npm run dev
```

Visit http://localhost:3002

## How It Works

1. **Login Flow**:
   - User clicks "Sign in with bLAZEnEURO"
   - Redirected to auth service at `localhost:3000`
   - User authenticates
   - Redirected back with authorization code
   - Code exchanged for access token
   - User info retrieved and displayed

2. **Files**:
   - `app/page.tsx` - Home page with login button
   - `app/auth/callback/route.ts` - OAuth callback handler
   - `app/auth/logout/route.ts` - Logout handler
   - `app/dashboard/page.tsx` - Protected dashboard showing user info

## Features

- ✅ OAuth 2.0 Authorization Code Flow
- ✅ State parameter for CSRF protection
- ✅ Secure token exchange
- ✅ User profile display
- ✅ Logout functionality
- ✅ Error handling

## Production Deployment

For production:

1. Update `.env.local` with production URLs:
   ```env
   NEXT_PUBLIC_AUTH_URL=https://auth.blazeneuro.com
   NEXT_PUBLIC_APP_URL=https://yourapp.com
   ```

2. Register production redirect URI with OAuth service

3. Use secure, httpOnly cookies for token storage

4. Implement proper session management

5. Add token refresh logic
