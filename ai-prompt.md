# AI Prompt: Implement "Sign in with BlazeNeuro" OAuth 2.0 Authentication

I need to implement "Sign in with BlazeNeuro" OAuth 2.0 authentication in my Next.js application.

## My OAuth Application Credentials

**Application Details:**
- Name: Data Flow
- Client ID: `bn_9ede824872be0ca76131cc37626e5717`
- Client Secret: `7abd910be52c8d55d68fc3ef8ee8e80f901963488b307c3187708a153b51be18`
- Callback URL: `http://localhost:3000/api/auth/callback/blazeneuro`

## BlazeNeuro OAuth Endpoints

- Authorization: `https://auth.blazeneuro.com/oauth/v1/authorize`
- Token Exchange: `https://auth.blazeneuro.com/oauth/v1/token`
- User Info: `https://auth.blazeneuro.com/oauth/v1/userinfo`
- Discovery: `https://auth.blazeneuro.com/.well-known/openid-configuration`

## OAuth 2.0 Flow Requirements

1. **Authorization Request:**
   - Redirect user to authorization endpoint with `client_id`, `redirect_uri`, `response_type=code`, `state`, and `scope=openid profile email`

2. **Token Exchange:**
   - POST to token endpoint with JSON body containing:
     - `grant_type: "authorization_code"`
     - `code`: authorization code from callback
     - `redirect_uri`: must match registered callback
     - `client_id` and `client_secret`

3. **User Info Retrieval:**
   - GET userinfo endpoint with `Authorization: Bearer {access_token}` header
   - Returns: `sub` (user ID), `email`, `email_verified`, `name`, `picture`

## Tech Stack

- Next.js (App Router)
- NextAuth.js v4

## Requirements

1. Install NextAuth.js v4
2. Create environment variables file with credentials
3. Configure NextAuth with BlazeNeuro OAuth provider
4. Create Pages API route at `pages/api/auth/[...nextauth].ts`
5. Add SessionProvider wrapper in app layout
6. Create sign-in page showing:
   - "Sign in with BlazeNeuro" button
   - After successful auth, display: user name, email, and user ID
   - Sign out button
7. Session must persist across page refreshes

## Important Implementation Details

- Token endpoint expects **JSON** content type, not form data
- Userinfo endpoint must be explicitly called with custom request handler
- Use JWT and session callbacks to persist user data (id, name, email)
- Callback URL must be `http://localhost:3000/api/auth/callback/blazeneuro` (with `/blazeneuro` suffix)

## Backend OAuth Server Setup

If the OAuth backend needs client registration, add this client to `/oauth/app/oauth/v1/clients/route.ts`:

```typescript
clients.set('bn_9ede824872be0ca76131cc37626e5717', {
  id: 'bn_9ede824872be0ca76131cc37626e5717',
  secret: '7abd910be52c8d55d68fc3ef8ee8e80f901963488b307c3187708a153b51be18',
  name: 'Data Flow',
  redirectUris: ['http://localhost:3000/api/auth/callback/blazeneuro'],
  allowedOrigins: ['http://localhost:3000'],
  createdAt: new Date().toISOString()
})
```

## Expected Result

After implementation:
- User clicks "Sign in with BlazeNeuro"
- Redirects to BlazeNeuro auth page
- User signs in (Google/GitHub/Email)
- Redirects back to app
- Shows: "Welcome, {name}!" with email and user ID displayed
- Session persists on page refresh
- Sign out button clears session

Please provide complete implementation with all necessary files and configurations.
