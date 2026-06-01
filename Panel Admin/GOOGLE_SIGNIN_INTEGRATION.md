# Google Sign-In Integration for login.tsx

## Overview

Your login page now supports Google OAuth authentication with email whitelist restriction. This document explains how to integrate Google Sign-In.

## Implementation Options

### Option 1: Using @react-oauth/google (Recommended)

This is the simplest integration with the latest Google Sign-In Library.

#### Step 1: Install Dependencies

```bash
npm install @react-oauth/google
```

#### Step 2: Wrap Your App with GoogleOAuthProvider

In your main app component (e.g., `main-spa.tsx` or your root router):

```typescript
import { GoogleOAuthProvider } from '@react-oauth/google';

<GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com">
  {/* Your app routes here */}
</GoogleOAuthProvider>
```

#### Step 3: Update login.tsx

Replace the `handleGoogleSignIn` function with:

```typescript
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { phpAuth } from "@/lib/php-auth";

const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
  setGoogleLoading(true);
  try {
    if (!credentialResponse.credential) {
      throw new Error("No credential received from Google");
    }

    // Send the ID token to your backend
    const session = await phpAuth.signInWithGoogleToken(credentialResponse.credential);
    
    toast.success("Google Sign-In successful!");
    navigate({ to: "/admin" });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Google Sign-In failed";
    
    // Check if it's an email authorization error
    if (errorMsg.includes("not authorized")) {
      toast.error("Your email is not authorized to access the admin panel");
    } else if (errorMsg.includes("invalid")) {
      toast.error("Invalid Google token. Please try again");
    } else {
      toast.error(errorMsg);
    }
    
    setGoogleLoading(false);
  }
};

const handleGoogleLoginError = () => {
  toast.error("Google Sign-In failed");
  setGoogleLoading(false);
};
```

#### Step 4: Replace the Social Button

In your login form, replace the current Google button with:

```typescript
<GoogleLogin
  onSuccess={handleGoogleLoginSuccess}
  onError={handleGoogleLoginError}
  text="signin_with"
  theme="outline"
  size="large"
/>
```

Or use your custom button styling:

```typescript
<GoogleLogin
  onSuccess={handleGoogleLoginSuccess}
  onError={handleGoogleLoginError}
  render={(renderProps) => (
    <SocialCircleButton
      label="Sign in with Google"
      disabled={renderProps.disabled || loading || googleLoading}
      onClick={renderProps.onClick}
    >
      <GoogleIcon className="h-4 w-4 text-slate-600 transition-colors" />
    </SocialCircleButton>
  )}
/>
```

### Option 2: Using Backend OAuth Flow

This approach redirects to Google's login page and handles everything server-side.

The current `handleGoogleSignIn` function already implements this:

```typescript
const handleGoogleSignIn = async () => {
  setGoogleLoading(true);
  try {
    await phpAuth.startGoogleSignIn();
    // User will be redirected to Google login
  } catch (err: unknown) {
    toast.error(translateAuthError(err));
    setGoogleLoading(false);
  }
};
```

This works with your existing code. Just ensure Google OAuth credentials are configured.

### Option 3: Manual Token Handling

If you already have a Google ID token from another source:

```typescript
const handleGoogleSignInWithToken = async (idToken: string) => {
  setGoogleLoading(true);
  try {
    const session = await phpAuth.signInWithGoogleToken(idToken);
    toast.success("Google Sign-In successful!");
    navigate({ to: "/admin" });
  } catch (err: unknown) {
    toast.error(err instanceof Error ? err.message : "Authentication failed");
    setGoogleLoading(false);
  }
};
```

## Complete Updated handleGoogleSignIn Example

Here's a complete implementation for Option 1:

```typescript
const handleGoogleSignIn = async () => {
  setGoogleLoading(true);
  try {
    // If using @react-oauth/google with GoogleLogin component
    // The component handles the click and calls onSuccess/onError
    
    // If using manual flow:
    await phpAuth.startGoogleSignIn();
    
    // Note: startGoogleSignIn redirects to Google, so code after it won't execute
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Google Sign-In failed";
    toast.error(errorMsg);
    setGoogleLoading(false);
  }
};

const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
  setGoogleLoading(true);
  try {
    if (!credentialResponse.credential) {
      throw new Error("No credential from Google");
    }

    await phpAuth.signInWithGoogleToken(credentialResponse.credential);
    toast.success("Connexion Google réussie !");
    navigate({ to: "/admin" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Authentication failed";
    if (msg.includes("not authorized")) {
      toast.error("Votre email n'est pas autorisé");
    } else {
      toast.error(msg);
    }
    setGoogleLoading(false);
  }
};
```

## Handling OAuth Errors

The backend now returns specific error messages:

| Error | Cause | Solution |
|-------|-------|----------|
| "Email not authorized for admin access" | Email not in whitelist | Ask admin to add your email |
| "Invalid or expired Google token" | Token expired or malformed | Sign in again |
| "Google OAuth not configured on the server" | Missing credentials | Configure Google OAuth setup |

## Testing

### Local Testing

1. Add `http://localhost:5173` to Google OAuth redirect URIs
2. Get your local Google Client ID
3. Start your dev server: `npm run dev`
4. Test with an authorized email account

### Production Testing

1. Verify credentials are set in environment variables
2. Test with all authorized email accounts
3. Verify unauthorized emails are rejected
4. Check error messages are user-friendly

## Environment Setup

Make sure these environment variables are set on your server:

```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/php/google-callback.php
```

## Debugging

### Enable Debugging

Add console logs to track the flow:

```typescript
const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
  console.log("Google credential received:", credentialResponse);
  try {
    console.log("Sending to backend...");
    const session = await phpAuth.signInWithGoogleToken(credentialResponse.credential);
    console.log("Backend response:", session);
    // ... rest of code
  } catch (err) {
    console.error("Error:", err);
    // ... error handling
  }
};
```

### Check Backend Logs

Look for errors in your server's PHP error logs:

```bash
tail -f /var/log/php-errors.log
```

## Additional Resources

- [Google Sign-In Documentation](https://developers.google.com/identity)
- [@react-oauth/google GitHub](https://github.com/react-oauth/react-oauth.js)
- [Google OAuth Scopes](https://developers.google.com/identity/protocols/oauth2/scopes)

## Next Steps

1. Choose an implementation option (Option 1 recommended)
2. Configure Google OAuth credentials
3. Update login.tsx with the code snippets above
4. Test locally and in production
5. Monitor error logs for any issues
