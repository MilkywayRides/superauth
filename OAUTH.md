# OAuth 2.0 / OpenID Connect Implementation

This auth service now supports OAuth 2.0 and OpenID Connect protocols for secure third-party authentication - **available for public use just like Google and GitHub OAuth**.

## Getting Started

### 1. Register Your Application

Register your application to get OAuth credentials:

```bash
curl -X POST https://auth.blazeneuro.com/oauth/v1/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your App Name",
    "redirect_uris": [
      "https://yourapp.com/auth/callback",
      "http://localhost:3000/auth/callback"
    ],
    "allowed_origins": [
      "https://yourapp.com",
      "http://localhost:3000"
    ]
  }'
```

**Response:**
```json
{
  "client_id": "client_abc123...",
  "client_secret": "secret_xyz789...",
  "name": "Your App Name",
  "redirect_uris": ["https://yourapp.com/auth/callback"],
  "created_at": "2024-01-01T00:00:00Z"
}
```

⚠️ **Save your `client_secret` securely - it won't be shown again!**

### 2. Implement OAuth Flow

## OAuth Endpoints

### Authorization Endpoint
```
GET https://auth.blazeneuro.com/oauth/v1/authorize
```

**Parameters:**
- `client_id` (required): Your OAuth client ID
- `redirect_uri` (required): Callback URL (must be pre-registered)
- `response_type` (required): Must be "code"
- `state` (required): CSRF protection token
- `scope` (optional): Space-separated scopes (default: "openid profile email")

**Example:**
```
https://auth.blazeneuro.com/oauth/v1/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=https://yourapp.com/callback&response_type=code&state=RANDOM_STATE&scope=openid%20profile%20email
```

### Token Endpoint
```
POST https://auth.blazeneuro.com/oauth/v1/token
```

**Parameters:**
- `grant_type` (required): "authorization_code"
- `code` (required): Authorization code from callback
- `redirect_uri` (required): Same redirect_uri used in authorization
- `client_id` (required): Your OAuth client ID
- `client_secret` (required): Your OAuth client secret

**Response:**
```json
{
  "access_token": "...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "id_token": "...",
  "scope": "openid profile email"
}
```

### UserInfo Endpoint
```
GET https://auth.blazeneuro.com/oauth/v1/userinfo
Authorization: Bearer ACCESS_TOKEN
```

**Response:**
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "email_verified": true,
  "name": "User Name",
  "picture": "https://...",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Discovery Endpoint
```
GET https://auth.blazeneuro.com/.well-known/openid-configuration
```

Returns OpenID Connect discovery document with all endpoint URLs and supported features.

### Client Management

**Get Client Info:**
```bash
curl https://auth.blazeneuro.com/oauth/v1/clients?client_id=YOUR_CLIENT_ID
```

## Security Features

✅ **Dynamic Client Registration**: Register unlimited OAuth clients
✅ **CSRF Protection**: State parameter validation
✅ **Origin Validation**: Per-client origin whitelisting
✅ **Redirect URI Validation**: Pre-registered URIs only
✅ **Client Authentication**: Client ID and secret validation
✅ **Code Expiration**: Authorization codes expire in 5 minutes
✅ **One-time Use**: Authorization codes are single-use
✅ **Token Expiration**: Access tokens expire in 1 hour
✅ **Scope-based Access**: Granular permission control
✅ **Secure Token Generation**: Cryptographically secure random tokens
✅ **JWT Signing**: ID tokens signed with HMAC-SHA256

## Supported Scopes

- `openid` - Returns user ID (sub)
- `profile` - Returns name, picture, updated_at
- `email` - Returns email, email_verified

## Integration Example

### JavaScript/TypeScript

```typescript
// 1. Redirect user to authorization
const state = crypto.randomUUID()
sessionStorage.setItem('oauth_state', state)

const authUrl = new URL('https://auth.blazeneuro.com/oauth/v1/authorize')
authUrl.searchParams.set('client_id', 'YOUR_CLIENT_ID')
authUrl.searchParams.set('redirect_uri', 'https://yourapp.com/callback')
authUrl.searchParams.set('response_type', 'code')
authUrl.searchParams.set('state', state)
authUrl.searchParams.set('scope', 'openid profile email')

window.location.href = authUrl.toString()

// 2. Handle callback
const urlParams = new URLSearchParams(window.location.search)
const code = urlParams.get('code')
const returnedState = urlParams.get('state')

// Verify state
if (returnedState !== sessionStorage.getItem('oauth_state')) {
  throw new Error('Invalid state')
}

// 3. Exchange code for tokens (server-side)
const response = await fetch('https://auth.blazeneuro.com/oauth/v1/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    code,
    redirect_uri: 'https://yourapp.com/callback',
    client_id: 'YOUR_CLIENT_ID',
    client_secret: 'YOUR_CLIENT_SECRET'
  })
})

const tokens = await response.json()

// 4. Get user info
const userResponse = await fetch('https://auth.blazeneuro.com/oauth/v1/userinfo', {
  headers: {
    'Authorization': `Bearer ${tokens.access_token}`
  }
})

const user = await userResponse.json()
console.log(user) // { sub, email, name, picture, ... }
```

### Next.js Example

```typescript
// app/auth/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  
  // Verify state (stored in cookie/session)
  
  // Exchange code for tokens
  const tokenResponse = await fetch('https://auth.blazeneuro.com/oauth/v1/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_URL}/auth/callback`,
      client_id: process.env.OAUTH_CLIENT_ID,
      client_secret: process.env.OAUTH_CLIENT_SECRET
    })
  })
  
  const tokens = await tokenResponse.json()
  
  // Store tokens securely and redirect
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
```

## Production Recommendations

### For bLAZEnEURO (Provider)

1. **Database Storage**: Move client registry and tokens from memory to PostgreSQL/Redis
2. **Rate Limiting**: Add rate limiting to all OAuth endpoints
3. **Audit Logging**: Log all OAuth operations for security monitoring
4. **RS256 Signing**: Upgrade JWT signing from HS256 to RS256
5. **PKCE Support**: Add PKCE for public clients (mobile/SPA)
6. **Refresh Token Rotation**: Implement refresh token rotation
7. **Token Revocation**: Add token revocation endpoint
8. **Admin Dashboard**: Build UI for managing OAuth clients

### For Developers (Consumers)

1. **Secure Storage**: Never expose client_secret in frontend code
2. **State Validation**: Always validate state parameter
3. **HTTPS Only**: Use HTTPS for all redirect URIs in production
4. **Token Storage**: Store tokens securely (httpOnly cookies recommended)
5. **Error Handling**: Implement proper error handling for OAuth flows
6. **Token Refresh**: Implement token refresh before expiration

## Use Cases

- **Single Sign-On (SSO)**: Let users sign in to your app with their bLAZEnEURO account
- **API Access**: Access bLAZEnEURO APIs on behalf of users
- **Third-party Integrations**: Build integrations with bLAZEnEURO platform
- **Mobile Apps**: Secure authentication for mobile applications
- **Microservices**: Authenticate between your microservices

## Support

For issues or questions about OAuth integration:
- Documentation: https://auth.blazeneuro.com/docs
- Email: support@blazeneuro.com
- GitHub: https://github.com/blazeneuro/oauth

## Rate Limits

- Authorization requests: 100/hour per IP
- Token requests: 50/hour per client
- UserInfo requests: 1000/hour per token

(Configure rate limits in production)
