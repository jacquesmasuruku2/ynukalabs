# Validation Checklist - Google OAuth Setup

## Pre-Deployment Verification

Use this checklist to verify everything is ready before uploading to your server.

### ✅ Phase 1: File Verification (Local Machine)

#### PHP Files Created
- [ ] `/php/google-oauth.php` exists
  - Contains: `get_google_auth_url()`, `exchange_google_code_for_token()`, `verify_google_id_token()`
  
- [ ] `/php/google-callback.php` exists
  - Contains: callback handler for Google OAuth

- [ ] `/php/api.php` modified
  - Contains: `$allowed_admin_emails` array (line ~80)
  - Contains: `is_email_allowed()` function
  - Contains: `google_auth_url` action
  - Contains: `google_oauth_verify` action
  - Contains: `google_oauth_login` action
  - Contains: `require_once 'google-oauth.php'` (line ~18)

#### Frontend Files Updated
- [ ] `/Panel Admin/src/lib/php-auth.ts` modified
  - Contains: `signInWithGoogleToken(idToken)` method

#### Documentation Files Created
- [ ] `/GOOGLE_OAUTH_QUICK_START.md` exists
- [ ] `/php/GOOGLE_OAUTH_SETUP.md` exists
- [ ] `/Panel Admin/GOOGLE_SIGNIN_INTEGRATION.md` exists
- [ ] `/php/API_PH_CHANGES.md` exists

### ✅ Phase 2: Code Quality Verification

#### Email Whitelist
```php
$allowed_admin_emails = [
    'jacquesmasuruku2@gmail.com',    ✅ Present
    'balumeboaz@gmail.com',           ✅ Present
    'martinmusagara@gmail.com',       ✅ Present
    'mwatsimulamoolivier@gmail.com',  ✅ Present
];
```
- [ ] All 4 emails are present
- [ ] Emails are lowercase
- [ ] No typos in emails

#### Helper Function
```php
function is_email_allowed($email) {
    global $allowed_admin_emails;
    return in_array(strtolower(trim($email)), ...);
}
```
- [ ] Function exists
- [ ] Uses `strtolower()` for case-insensitive comparison
- [ ] Uses `trim()` to remove whitespace
- [ ] Accessible globally

#### OAuth Actions
- [ ] `google_auth_url` action present
- [ ] `google_oauth_verify` action present
- [ ] `google_oauth_login` action present
- [ ] All actions check email whitelist
- [ ] All actions return JWT token on success
- [ ] All actions return 403 for unauthorized emails

### ✅ Phase 3: Database Verification

#### admin_users Table
```sql
CREATE TABLE `admin_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(120) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```
- [ ] Table exists and has correct schema
- [ ] `email` column has UNIQUE constraint
- [ ] Can insert new rows (OAuth auto-create)
- [ ] Can update existing rows (OAuth update name)

### ✅ Phase 4: Configuration Verification

#### Google OAuth Credentials
- [ ] Google Client ID obtained from Google Cloud Console
- [ ] Google Client Secret obtained from Google Cloud Console
- [ ] Redirect URIs added to Google OAuth settings:
  - [ ] Production: `https://yourdomain.com/php/google-callback.php`
  - [ ] Local dev: `http://localhost:5173`

#### Server Environment
- [ ] Environment variables ready to be set:
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`
  - [ ] `GOOGLE_REDIRECT_URI`
- [ ] Or `google-oauth.php` constants updated (lines 11-13)

### ✅ Phase 5: Security Verification

#### Input Validation
- [ ] Emails are validated against whitelist
- [ ] Email comparison is case-insensitive
- [ ] Empty/null emails are rejected
- [ ] Google tokens are verified

#### Error Handling
- [ ] Unauthorized emails return 403 status
- [ ] Invalid tokens return 401 status
- [ ] Missing parameters return 400 status
- [ ] Server errors return 500 status
- [ ] Error messages don't leak sensitive info

#### Access Control
- [ ] Password login preserved for backward compatibility
- [ ] Google OAuth requires valid email in whitelist
- [ ] Token expiration enforced (7 days)
- [ ] JWT signature validation working

### ✅ Phase 6: Frontend Verification

#### php-auth.ts Updates
- [ ] `signInWithGoogleToken()` method exists
- [ ] Method accepts `idToken` parameter
- [ ] Method calls `?action=google_oauth_verify`
- [ ] Method persists token in localStorage
- [ ] Method throws descriptive errors

#### login.tsx (If Using Option 1)
- [ ] Google Sign-In Library imported
- [ ] `handleGoogleLoginSuccess` handler exists
- [ ] `handleGoogleLoginError` handler exists
- [ ] Success redirects to `/admin`
- [ ] Error shows user-friendly message

### ✅ Phase 7: Testing Checklist

#### Unit Tests
- [ ] `is_email_allowed()` returns true for authorized emails
  ```php
  assert(is_email_allowed('jacquesmasuruku2@gmail.com') === true);
  ```
- [ ] `is_email_allowed()` returns false for unauthorized emails
  ```php
  assert(is_email_allowed('random@gmail.com') === false);
  ```
- [ ] Email comparison is case-insensitive
  ```php
  assert(is_email_allowed('JACQUESMASURUKU2@GMAIL.COM') === true);
  ```

#### Integration Tests - Local
- [ ] Can call `?action=google_oauth_login` with authorized email
  - Should return: `{token, user}` with status 200
- [ ] Cannot call `?action=google_oauth_login` with unauthorized email
  - Should return: `{error: "Email not authorized..."}` with status 403
- [ ] JWT token can be decoded and contains user info
- [ ] Token expiration is set to 7 days

#### End-to-End Tests - Production
- [ ] User can log in with: jacquesmasuruku2@gmail.com ✅
- [ ] User can log in with: balumeboaz@gmail.com ✅
- [ ] User can log in with: martinmusagara@gmail.com ✅
- [ ] User can log in with: mwatsimulamoolivier@gmail.com ✅
- [ ] User cannot log in with: random@gmail.com ❌
- [ ] Error message is clear: "Email not authorized..."
- [ ] Token persists in localStorage
- [ ] Token used for subsequent API calls
- [ ] Logout clears token

### ✅ Phase 8: Documentation Verification

#### User Guides
- [ ] Quick start guide is clear and actionable
- [ ] Setup instructions are complete
- [ ] Integration options are explained
- [ ] Code examples are correct and complete

#### Technical Docs
- [ ] API endpoint documentation is accurate
- [ ] Error codes are documented
- [ ] Configuration options are documented
- [ ] Troubleshooting section covers common issues

#### Code Comments
- [ ] New functions have docstring comments
- [ ] Logic is explained where needed
- [ ] Copyright/author information is present

### ✅ Phase 9: Performance Verification

- [ ] Email whitelist lookup is fast (O(n) with n=4)
- [ ] Database queries are using prepared statements
- [ ] No N+1 query problems
- [ ] Token generation/validation is fast
- [ ] No memory leaks in loops

### ✅ Phase 10: Browser Compatibility

- [ ] Tested in Chrome/Chromium
- [ ] Tested in Firefox
- [ ] Tested in Safari
- [ ] Tested in Edge
- [ ] Mobile browsers working (if applicable)

### ✅ Phase 11: Deployment Readiness

#### Files to Upload
- [ ] `/php/api.php` (MODIFIED)
- [ ] `/php/google-oauth.php` (NEW)
- [ ] `/php/google-callback.php` (NEW)

#### Frontend Deployment (If Using Option 1)
- [ ] `Panel Admin/src/lib/php-auth.ts` (MODIFIED)
- [ ] `Panel Admin/src/routes/login.tsx` (UPDATED - if using Option 1)
- [ ] New dependency added: `@react-oauth/google` (if using Option 1)

#### Server Configuration
- [ ] Environment variables set on production server
- [ ] File permissions correct (644 for .php files)
- [ ] PHP version compatible (7.4+)
- [ ] MySQL/database connection working

#### Monitoring
- [ ] Error logs monitored after deployment
- [ ] User activity monitored (login attempts)
- [ ] Performance metrics checked
- [ ] No unexpected errors appearing

### ✅ Phase 12: Post-Deployment Verification

After uploading to production:

- [ ] Test with all 4 authorized emails
- [ ] Verify token is returned (status 200)
- [ ] Verify user is created/updated in database
- [ ] Verify unauthorized email is rejected (status 403)
- [ ] Verify error message is clear
- [ ] Verify token works for subsequent API calls
- [ ] Verify logout clears token
- [ ] Monitor server logs for errors
- [ ] Check database for new user records

## Rollback Plan

If something goes wrong:

1. **Quick Rollback:**
   - Restore previous version of `/php/api.php`
   - Restart web server
   - Clear browser cache

2. **Partial Rollback:**
   - Remove `google-oauth.php` include from api.php
   - Google OAuth actions will error but API continues working
   - Password login continues to work

3. **Full Rollback:**
   - Restore all files to previous version
   - Clear any newly created user records
   - Verify existing users can still login with password

## Sign-Off

- [ ] All checklist items completed
- [ ] All tests passing
- [ ] Documentation reviewed
- [ ] Ready for deployment

### Deployment Date: ___________

### Deployed By: ___________

### Verified By: ___________

---

## Quick Issue Resolution

### Issue: "Google OAuth not configured"
**Resolution:**
1. Check Google Client ID is set
2. Verify environment variables are loaded
3. Check `/php/google-oauth.php` lines 11-13

### Issue: "Email not authorized"
**Resolution:**
1. Check email is in whitelist in `/php/api.php` line 80
2. Verify email case (should work regardless)
3. Check for trailing/leading spaces

### Issue: Token not working
**Resolution:**
1. Verify token is being persisted in localStorage
2. Check token expiration (7 days)
3. Verify authorization header is sent in requests

### Issue: Database errors
**Resolution:**
1. Verify `admin_users` table exists
2. Check table permissions (can insert/update)
3. Check database connection in `config.php`

---

**Reference Documents:**
- Setup Guide: `/php/GOOGLE_OAUTH_SETUP.md`
- Quick Start: `/GOOGLE_OAUTH_QUICK_START.md`
- Integration Guide: `/Panel Admin/GOOGLE_SIGNIN_INTEGRATION.md`
- Changes Summary: `/php/API_PH_CHANGES.md`
