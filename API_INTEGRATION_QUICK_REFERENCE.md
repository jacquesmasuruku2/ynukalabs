# 🔗 Ynuka Site API Integration - Quick Reference

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   YNUKA SITE (React Frontend)               │
│                  https://ynukalabs.com                       │
├─────────────────────────────────────────────────────────────┤
│  Pages: Events, Blog, About, Resources, Contact, Admin      │
│  Uses: strapiFetch() from src/lib/strapi.ts                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ fetch(`{origin}/php/api.php?action=list&resource=...`)
                       │ Headers: Content-Type: application/json
                       │         Authorization: Bearer {JWT}
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           PANEL ADMIN API (PHP Single File)                 │
│      https://ynukalabs.com/php/api.php                      │
├─────────────────────────────────────────────────────────────┤
│ • Accepts: action, resource, id from query string           │
│ • Validates JWT token                                        │
│ • CRUD Operations on MySQL                                  │
│ • Response: JSON                                             │
│ • CORS: Allow * (⚠️ restrict in production)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ SQL Queries
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              MYSQL DATABASE (Interserver)                   │
│         ynukalab_database_website @ 205.209.109.3           │
├─────────────────────────────────────────────────────────────┤
│ Tables: events, blog_posts, team_members, projects,        │
│         gallery_images, contact_messages, users, etc.      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Endpoints at a Glance

### Pages & Their API Calls

| Page | Endpoints Used | HTTP Methods |
|---|---|---|
| **Events.tsx** | `/api/events`, `/api/event-registrations` | GET, POST, DELETE |
| **EventDetail.tsx** | `/api/events/{id}`, `/api/event-registrations` | GET, POST |
| **About.tsx** | `/api/team-members`, `/api/partners` | GET |
| **BlogPost.tsx** | `/api/blog-posts/{id}`, `/api/blog-comments` | GET, POST |
| **Resources.tsx** | `/api/gallery-events`, `/api/resource-sections` | GET |
| **Contact.tsx** | `/api/contact-messages` | POST |
| **Index-final.tsx** | `/api/events`, `/api/blog-posts`, `/api/projects` | GET |
| **AdminDashboard.tsx** | All resources | GET, POST, PATCH, DELETE |

---

## 🔐 How strapiFetch() Works

```typescript
// Step 1: Frontend calls strapiFetch
strapiFetch('/api/events?sort=createdAt:desc', {
  method: 'GET'
})

// Step 2: Client-side proxy in src/lib/strapi.ts
// Converts to:
fetch(`{window.location.origin}/php/api.php?action=list&resource=events&sort=createdAt:desc`)

// Step 3: Backend receives
// api.php?action=list&resource=events&sort=createdAt:desc

// Step 4: PHP executes
SELECT * FROM events ORDER BY created_at DESC

// Step 5: Returns JSON
{ data: [{id: 1, title: "...", ...}, ...] }
```

---

## 🛡️ Authentication Flow

```
1. User logs in @ Contact Form or AdminDashboard
   ↓
2. strapiFetch('/api/auth/local', {
     method: 'POST',
     body: { email, password }
   })
   ↓
3. API validates + returns JWT
   ↓
4. localStorage.setItem('strapi_jwt', token)
   ↓
5. Subsequent requests include:
   Authorization: Bearer {token}
   ↓
6. API validates JWT in header
   ↓
7. Allowed? → Continue | Denied? → 401 error
```

---

## 📋 Data Model: Tables Used

```
events
├── id, title, description, date, location, type
├── upcoming (boolean), time, image
└── created_at, updated_at

event_registrations
├── id, event_id, full_name, email, phone
└── created_at

blog_posts
├── id, title, title_fr, content, content_fr
├── excerpt, excerpt_fr, published
├── image, created_at
└── category

gallery_images
├── id, title, event_id, image_url
└── uploaded_at

projects
├── id, title, description, image
└── created_at

team_members
├── id, name, role, image
├── social_x, social_telegram, social_linkedin
└── created_at

contact_messages
├── id, name, email, subject, message
└── created_at

newsletter_subscribers
├── id, email, subscribed_at
└── unsubscribed_at

partners
├── id, name, url, logo
└── created_at
```

---

## ⚙️ API Actions Supported

### Authentication
- `ping` - Check API health + config status
- `login` - Email/password authentication
- `register` - Create new admin account
- `google_auth_url` - Get Google OAuth URL
- `google_callback` - Handle Google OAuth callback
- `me` - Get current user profile

### Data Operations
- `list` - Get all records from a table
- `get` - Get a specific record by ID
- `create` - Insert new record
- `update` - Modify existing record
- `delete` - Remove record

### Admin
- `allowed_emails_list` - List allowed admin emails
- `allowed_emails_add` - Add email to allowlist
- `allowed_emails_remove` - Remove from allowlist
- `upload_image` - Upload image file

---

## 🔗 Query String Parameters

### For LIST action
```
?action=list&resource=events
  &limit=100              (pagination)
  &page=1                 (page number)
  &search=keyword         (search text)
  &sort=created_at:desc   (ignored currently)
```

### For GET action
```
?action=get&resource=events&id=123
```

### For CREATE action
```
?action=create&resource=blog_posts
POST body: { title: "...", content: "...", ... }
```

### For UPDATE action
```
?action=update&resource=events&id=123
POST body: { title: "new title", ... }
```

### For DELETE action
```
?action=delete&resource=events&id=123
```

---

## 🚨 CORS Configuration

**Location**: `Panel Admin/php-api/api.php` (lines 67-71)

```php
header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400');
```

**Current Setting** (line 38):
```php
define('ALLOWED_ORIGIN', '*');  // ⚠️ INSECURE IN PRODUCTION
```

**Production Fix**:
```php
define('ALLOWED_ORIGIN', 'https://ynukalabs.com');
// Or for multiple domains:
$origins = ['https://ynukalabs.com', 'https://admin.ynukalabs.com'];
if (in_array($_SERVER['HTTP_ORIGIN'] ?? '', $origins)) {
    header('Access-Control-Allow-Origin: ' . $_SERVER['HTTP_ORIGIN']);
}
```

---

## 🔧 Configuration Files

| File | Purpose | Key Settings |
|---|---|---|
| `Ynuka Site/.env` | Environment variables | Supabase, Luma, Blockfrost URLs |
| `Ynuka Site/src/lib/strapi.ts` | API client | STRAPI_URL, phpApi proxy |
| `Panel Admin/php-api/api.php` | API backend | DB credentials, JWT_SECRET, CORS |
| `Panel Admin/php-api/setup.sql` | Database schema | Table definitions |

---

## 🧪 Testing the API

### Using curl
```bash
# Test connectivity
curl -s "https://ynukalabs.com/php/api.php?action=ping" | jq '.'

# Get events
curl -s "https://ynukalabs.com/php/api.php?action=list&resource=events" | jq '.data[0]'

# With authentication
curl -s -H "Authorization: Bearer {JWT_TOKEN}" \
  "https://ynukalabs.com/php/api.php?action=list&resource=blog_posts"
```

### Using browser console
```javascript
// From Ynuka Site
import { strapiFetch } from '@/lib/strapi';

strapiFetch('/api/events?pagination[pageSize]=5')
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

### HTML Test Page
```
/php/test-api.html - Interactive form to test all endpoints
/php/test-api.sh - Bash script with test commands
```

---

## ✅ Pre-Flight Checklist

Before deploying to production:

- [ ] Update `ALLOWED_ORIGIN` from `'*'` to `'https://ynukalabs.com'`
- [ ] Set `VITE_STRAPI_URL` in `.env` if using non-default URL
- [ ] Verify JWT_SECRET is long + random (minimum 32 chars)
- [ ] Test all 7 endpoints with real data
- [ ] Verify HTTPS redirect for API calls
- [ ] Check rate limiting is in place (or implement it)
- [ ] Enable logging for API requests
- [ ] Test Google OAuth flow
- [ ] Verify database backups are scheduled
- [ ] Monitor API performance metrics

---

## 📞 Support Resources

- **Full Analysis**: `API_INTEGRATION_ANALYSIS.md`
- **API README**: `Panel Admin/php-api/README.md`
- **Setup Guide**: `Panel Admin/php-api/setup.sql`
- **Deployment**: See `deployment-config.md`

---

**Last Updated**: June 1, 2026  
**Status**: ✅ All endpoints verified and documented
