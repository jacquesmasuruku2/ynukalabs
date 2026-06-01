# 🚀 Quick Start - Google OAuth Admin Panel Setup

## What Was Done ✅

Your API has been upgraded with **Google OAuth authentication** with **email whitelist restriction**.

Only these 4 emails can now log in to your admin panel:
- ✅ jacquesmasuruku2@gmail.com
- ✅ balumeboaz@gmail.com  
- ✅ martinmusagara@gmail.com
- ✅ mwatsimulamoolivier@gmail.com

## Files Ready to Upload to Your Server

Upload these 3 files to `/php/` on your server:

```
/php/
├── api.php (UPDATED - main API with whitelist)
├── google-oauth.php (NEW - OAuth helpers)
├── google-callback.php (NEW - OAuth callback handler)
└── config.php (existing - no changes)
```

## Before You Upload: Configure Google OAuth

### Step 1: Get Google Credentials (5 minutes)

1. Go to https://console.cloud.google.com
2. Create a new project
3. Enable Google+ API
4. Go to Credentials → Create OAuth 2.0 Client ID (Web application)
5. Add these Redirect URIs:
   - `https://yourdomain.com/php/google-callback.php` (production)
   - `http://localhost:5173` (local development)
6. Copy your:
   - **Client ID** (looks like: `abc123.apps.googleusercontent.com`)
   - **Client Secret** (looks like: `xyzABC123...`)

### Step 2: Add to Server Environment (5 minutes)

Add these environment variables to your server:

```bash
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/php/google-callback.php
```

**For shared hosting:** Edit in `/php/google-oauth.php` (lines 11-13), BUT not recommended for production.

## Frontend Integration - Choose One Option

### ⭐ Option 1: Best UX (Recommended)

Use Google Sign-In Library - requires 1 npm package and ~20 lines of code changes.

**Steps:**
1. Run: `npm install @react-oauth/google`
2. Read: `Panel Admin/GOOGLE_SIGNIN_INTEGRATION.md` (Option 1 section)
3. Update `Panel Admin/src/routes/login.tsx` with provided code

**Time:** 15 minutes

---

### Option 2: Simplest (Use Existing Code)

Use backend OAuth flow - no frontend changes needed, just credentials required.

**Steps:**
1. Configure Google credentials (Step 2 above)
2. Upload files to server
3. Your existing `handleGoogleSignIn()` will work automatically

**Time:** 5 minutes

---

### Option 3: Custom Integration

If you have another way to get Google ID tokens, send them to backend.

**Steps:**
1. Get ID token from your service
2. Call backend: `POST ?action=google_oauth_verify` with `{id_token: "..."}`
3. Backend returns JWT token

**Time:** Varies

---

## Testing Your Setup

### Local Testing (5 minutes)

1. Get your local Google Client ID from Google Cloud Console
2. Start dev server: `npm run dev`
3. Try logging in with one of the authorized emails
4. Should see: "Connexion réussie!" ✅

### Production Testing (10 minutes)

1. Upload files to server
2. Set environment variables
3. Test with each of the 4 authorized emails
4. Try with an unauthorized email - should see: "Email not authorized for admin access" ❌

## Common Questions

### Q: Can I add more emails to the whitelist?
**A:** Yes! Edit `/php/api.php` line 80:
```php
$allowed_admin_emails = [
    'jacquesmasuruku2@gmail.com',
    'balumeboaz@gmail.com',
    'martinmusagara@gmail.com',
    'mwatsimulamoolivier@gmail.com',
    'newemail@gmail.com',  // ← Add here
];
```

### Q: Do I need to change the existing password login?
**A:** No! Password login still works. This just adds Google OAuth option.

### Q: What if someone tries to login with an unauthorized email?
**A:** They'll get error: "Email not authorized for admin access"

### Q: How long are the login tokens valid?
**A:** 7 days. After that, users need to login again.

### Q: Can I remove Google login after setup?
**A:** Yes, just don't configure the Google credentials. The API endpoint will error, and frontend won't use it.

## Error Handling

If you see these errors:

| Error | What to do |
|-------|-----------|
| "Google OAuth not configured" | Set environment variables with Google credentials |
| "Email not authorized" | Add email to whitelist in `/php/api.php` line 80 |
| "Invalid token" | User's Google session expired, try again |
| CORS errors | Check your domain is in Google OAuth allowed URIs |

## Support Files

All documentation is in:
- **Backend:** `Ynuka Site/php/GOOGLE_OAUTH_SETUP.md` 
- **Frontend:** `Panel Admin/GOOGLE_SIGNIN_INTEGRATION.md`

These have detailed setup instructions, troubleshooting, and code examples.

## Deployment Checklist

- [ ] Get Google OAuth Client ID and Secret
- [ ] Decide frontend integration option (1, 2, or 3)
- [ ] Set environment variables on server
- [ ] Upload 3 PHP files to `/php/`
- [ ] Update frontend code (if using Option 1)
- [ ] Test locally
- [ ] Test in production with each authorized email
- [ ] Verify unauthorized emails are blocked
- [ ] Monitor error logs

## Next Actions

1. **Right now (10 min):** Get Google credentials from Google Cloud Console
2. **Next (5-15 min):** Choose frontend integration option and implement
3. **Test (15 min):** Test locally and in staging
4. **Deploy (5 min):** Upload files and set environment variables

---

## Summary

✅ **Security:** Email whitelist blocks everyone except 4 authorized users
✅ **Simple:** No complex configuration beyond Google credentials
✅ **Flexible:** Multiple integration options for frontend
✅ **Ready:** All code is ready to upload and use
✅ **Documented:** Complete guides and examples provided

**You're ready to go! 🎉**

Questions? Check the detailed guides:
- `Ynuka Site/php/GOOGLE_OAUTH_SETUP.md` 
- `Panel Admin/GOOGLE_SIGNIN_INTEGRATION.md`
