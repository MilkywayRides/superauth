# Android OAuth Endpoints

Custom OAuth endpoints for Android app authentication.

## Endpoints

### Google Sign-In

**POST** `/api/auth/google/android`

Verifies Google ID token from Android Credential Manager and creates/signs in user.

**Request:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

**Response:**
```json
{
  "token": "session-token-uuid",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user"
  }
}
```

### GitHub OAuth

#### 1. Callback Endpoint

**GET** `/api/auth/github/android/callback?code=xxx&state=xxx`

Receives OAuth code from GitHub and redirects to Android app deep link.

**Redirects to:** `blazeneuro://github-callback?code=xxx&state=xxx`

#### 2. Token Exchange

**POST** `/api/auth/github/android/token`

Exchanges GitHub OAuth code for session token.

**Request:**
```json
{
  "code": "github-oauth-code",
  "state": "csrf-state-token"
}
```

**Response:**
```json
{
  "token": "session-token-uuid",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user"
  }
}
```

## Environment Variables

Add to your `.env.local`:

```bash
# Google OAuth (for web-based OAuth)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Google Web Client (for Android Credential Manager API)
GOOGLE_WEB_CLIENT_ID=your_google_web_client_id

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## Setup

### Google Cloud Console

1. **Create Android OAuth Client:**
   - Type: Android
   - Package: `com.blazeneuro`
   - SHA-1: Your debug/release keystore SHA-1

2. **Create Web OAuth Client:**
   - Type: Web application
   - Used in Android app code for Credential Manager API

### GitHub OAuth App

1. **Homepage URL:** `https://auth.blazeneuro.com`
2. **Callback URL:** `https://auth.blazeneuro.com/api/auth/github/android/callback`

## How It Works

### Google Sign-In Flow

```
Android App
    ↓ (Credential Manager)
Google Sign-In Sheet
    ↓ (User selects account)
Android App receives ID token
    ↓ POST /api/auth/google/android
Backend verifies token with Google
    ↓
Backend creates/finds user
    ↓
Backend creates session
    ↓
Returns session token to app
```

### GitHub Sign-In Flow

```
Android App
    ↓ (Custom Tab)
GitHub Authorization
    ↓ (User authorizes)
Redirect to /api/auth/github/android/callback
    ↓
Backend redirects to blazeneuro://github-callback?code=xxx
    ↓
Android App receives deep link
    ↓ POST /api/auth/github/android/token
Backend exchanges code for GitHub token
    ↓
Backend fetches user info from GitHub
    ↓
Backend creates/finds user
    ↓
Backend creates session
    ↓
Returns session token to app
```

## Database Schema

Uses better-auth schema with:
- `users` table
- `sessions` table
- `accounts` table (for OAuth provider links)

## Security

- ✅ Google ID tokens verified with `google-auth-library`
- ✅ GitHub OAuth uses client secret (server-side only)
- ✅ CSRF protection with state parameter
- ✅ Session tokens are UUIDs with 30-day expiry
- ✅ Email verification marked as true for OAuth users

## Deployment

After pushing changes:

```bash
git push origin main
```

Vercel will automatically deploy. Make sure to add environment variables in Vercel dashboard.

## Testing

Test endpoints with:

```bash
# Google Sign-In
curl -X POST https://auth.blazeneuro.com/api/auth/google/android \
  -H "Content-Type: application/json" \
  -d '{"idToken":"your-google-id-token"}'

# GitHub Token Exchange
curl -X POST https://auth.blazeneuro.com/api/auth/github/android/token \
  -H "Content-Type: application/json" \
  -d '{"code":"github-code","state":"state-token"}'
```
