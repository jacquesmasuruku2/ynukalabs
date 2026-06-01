# Google OAuth Configuration Guide for Ynuka Labs Admin Panel

## Overview

Your admin panel now has Google OAuth authentication with email whitelist restriction. Only authorized emails can access the admin panel.

### Authorized Emails
- jacquesmasuruku2@gmail.com
- balumeboaz@gmail.com
- martinmusagara@gmail.com
- mwatsimulamoolivier@gmail.com

## Setup Instructions

### 1. Create Google OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - `https://yourdomain.com/php/google-callback.php`
   - `http://localhost:5173` (for local development)
7. Copy your **Client ID** and **Client Secret**

### 2. Configure Environment Variables

Add these to your server environment (`.env` file or server config):

```bash
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=https://yourdomain.com/php/google-callback.php
```

Or edit directly in `/php/google-oauth.php` (not recommended for production):

```php
define('GOOGLE_CLIENT_ID', 'your_client_id_here.apps.googleusercontent.com');
define('GOOGLE_CLIENT_SECRET', 'your_client_secret_here');
define('GOOGLE_REDIRECT_URI', 'https://yourdomain.com/php/google-callback.php');
```

### 3. Add Email Whitelist (Already Done)

The email whitelist is in `/php/api.php` at line 80:

```php
$allowed_admin_emails = [
    'jacquesmasuruku2@gmail.com',
    'balumeboaz@gmail.com',
    'martinmusagara@gmail.com',
    'mwatsimulamoolivier@gmail.com',
];
```

To add or modify authorized emails, edit this array and redeploy.

### 4. Frontend Integration

#### Option A: Using Google Sign-In Library (Recommended)

1. Add Google Sign-In script to your HTML or include in `index.html`:

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

2. Update your `login.tsx` to use Google Sign-In:

```typescript
import { handleCredentialResponse } from '@react-oauth/google';

const handleGoogleSignIn = async () => {
  setGoogleLoading(true);
  try {
    // Google Sign-In will handle authentication and return an ID token
    // This is typically done via the Google Sign-In button component
    // You'll receive the ID token in the credential response
    
    // Send the ID token to your backend
    const response = await fetchWithFallback('?action=google_oauth_verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token: googleIdToken })
    });
    
    const data = await response.json();
    await phpAuth.applyTokenFromOAuth(data.token);
    navigate({ to: '/admin' });
    toast.success('Google Sign-In successful!');
  } catch (err) {
    toast.error('Google Sign-In failed: ' + err.message);
    setGoogleLoading(false);
  }
};
```

#### Option B: Using Backend OAuth Flow

If you prefer to use the backend OAuth flow:

1. Click the Google button → calls `phpAuth.startGoogleSignIn()`
2. Frontend is redirected to Google login
3. User authorizes
4. Redirected back to `/php/google-callback.php`
5. Backend validates email and redirects to `/login#token=<jwt>`
6. Frontend receives token in hash and processes it

## API Endpoints

### GET `?action=google_auth_url`
Returns the Google OAuth authorization URL for the backend flow.

**Response:**
```json
{
  "url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

### POST `?action=google_oauth_verify`
Verifies a Google ID token and returns a JWT.

**Request:**
```json
{
  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEiLCJ0eXAiOiJKV1QifQ..."
}
```

**Response (success):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "name": "User Name"
  }
}
```

**Response (unauthorized email):**
```json
{
  "error": "Email not authorized for admin access"
}
```

### POST `?action=google_oauth_login`
Simpler variant that accepts pre-validated email and name. Use this only if you have another service validating the email.

**Request:**
```json
{
  "email": "jacquesmasuruku2@gmail.com",
  "name": "Jacques Masuruku"
}
```

**Response:**
Same as `google_oauth_verify`

## Troubleshooting

### "Email not authorized for admin access"
- Check that the email is in the whitelist in `/php/api.php`
- Ensure the email is lowercase in the whitelist
- The Google account used must have one of the authorized emails as its primary email

### "Google OAuth not configured on the server"
- Google Client ID is missing or incorrect
- Update environment variables with correct credentials

### "Invalid or expired Google token"
- The ID token has expired (valid for ~1 hour)
- User needs to sign in again

### CORS Issues
- Ensure `Access-Control-Allow-Origin` headers are set correctly
- Add your domain to Google OAuth redirect URIs

## Security Considerations

1. **Always use HTTPS in production** - OAuth tokens must be transmitted securely
2. **Rotate credentials** - Change Google Client Secret periodically
3. **Whitelist management** - Review authorized emails regularly
4. **Token expiration** - JWT tokens expire after 7 days
5. **Email verification** - Always verify email ownership before adding to whitelist

## Files Modified/Created

- `/php/api.php` - Added email whitelist and OAuth actions
- `/php/google-oauth.php` - New: Google OAuth helper functions
- `/php/google-callback.php` - New: OAuth callback handler
- `Panel Admin/src/lib/php-auth.ts` - Frontend authentication service
- `Panel Admin/src/routes/login.tsx` - Login page component

## Next Steps

1. Configure Google OAuth credentials (see Step 1)
2. Add environment variables (see Step 2)
3. Update frontend with Google Sign-In Library
4. Test locally and in staging
5. Deploy to production

## Support

For issues or questions:
- Check Google OAuth documentation: https://developers.google.com/identity/protocols/oauth2
- Review error logs in `/php/` directory
- Verify all files are uploaded correctly to `/php/`
