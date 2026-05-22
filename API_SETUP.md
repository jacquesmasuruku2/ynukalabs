# Ynuka Labs API Setup Guide

## Architecture

L'API est unifiée dans `/php/api.php` accessible depuis :
- **Admin Panel** : https://admin.ynukalabs.com → appelle https://ynukalabs.com/api.php
- **Public Site** : https://ynukalabs.com → appelle https://ynukalabs.com/api.php
- **Both** : Partagent la même base de données `ynukalab_database_website`

## Deployment Steps

### 1. Upload Files to Server (Interserver - shared hosting at 205.209.109.3)

```bash
# Upload these to /public_html/
/Ynuka Site/php/api.php → /public_html/api.php
/Ynuka Site/php/config.php → /public_html/config.php
/Ynuka Site/php/setup.sql → /public_html/setup.sql
/Ynuka Site/php/generate-admin.php → /public_html/generate-admin.php
```

### 2. Generate Admin Account Hash

**Locally (before uploading):**

```bash
cd "Ynuka Site/php"
php generate-admin.php "YourSecurePassword"
```

Output:
```
Password: YourSecurePassword
Hash: $2y$10$...
```

### 3. Create Admin User in Database

Using phpMyAdmin on Interserver:

```sql
INSERT INTO admin_users (email, password_hash, name) 
VALUES ('admin@ynukalabs.com', '$2y$10$PASTE_HASH_HERE', 'Admin');
```

Or upload `setup.sql` and execute in phpMyAdmin (after updating the hash).

### 4. Test API Connectivity

Open in browser:
```
https://ynukalabs.com/api.php?action=ping
```

Expected response:
```json
{
  "status": "ok",
  "database": "ynukalab_database_website",
  "tables": ["admin_users", "blog_posts", "blog_comments", ...],
  "timestamp": "2026-05-22T12:00:00+00:00"
}
```

## API Endpoints

### Authentication
- **POST** `/api.php?action=login` - Login and get JWT token
- **GET** `/api.php?action=me` - Get current user (requires Bearer token)

### CRUD Operations (requires Bearer token for create/update/delete)

- **GET** `/api.php?action=list&resource=blog_posts&page=1&limit=25`
- **GET** `/api.php?action=get&resource=blog_posts&id=123`
- **POST** `/api.php?action=create&resource=blog_posts` - Create (auth required)
- **POST** `/api.php?action=update&resource=blog_posts&id=123` - Update (auth required)
- **POST** `/api.php?action=delete&resource=blog_posts&id=123` - Delete (auth required)

### Example: Create Blog Post

```javascript
const response = await fetch('https://ynukalabs.com/api.php?action=create&resource=blog_posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'My Blog Post',
    content: 'Content here...',
    author_id: 1
  })
});

const { id, message } = await response.json();
console.log('Created post ID:', id);
```

### Example: Get All Blog Posts (no auth needed)

```javascript
const response = await fetch('https://ynukalabs.com/api.php?action=list&resource=blog_posts');
const { rows, total, columns } = await response.json();
console.log('Total posts:', total);
console.log('Posts:', rows);
```

## Security Notes

- **JWT Secret**: Change `jwt_secret()` in `api.php` before production
- **Allowed Tables**: Modify `$allowed_tables` to restrict access
- **CORS**: Currently allows all origins (`*`) - restrict in production
- **Passwords**: Always use bcrypt hashing for `password_hash` field

## Troubleshooting

### "Unauthorized" Error
- Check Bearer token is valid and not expired
- Generate new token with login endpoint

### "Database connection failed"
- Verify DB_USER and DB_PASS credentials
- Ensure database exists and user has access
- Check firewall rules on server

### "Invalid resource"
- Resource name must be in `$allowed_tables` array
- Table must exist in database

## Files Structure

```
/Ynuka Site/php/
├── api.php              ← Main REST API (copy to production)
├── config.php           ← Database credentials (copy to production)
├── generate-admin.php   ← Password hash generator (local use only)
├── setup.sql            ← Database initialization (phpMyAdmin import)
└── database.php         ← Legacy (deprecated, kept for reference)

/Admin Ynuka/php-api/
├── api.php              ← Copy of unified API
└── config.php           ← Same database config
```

## Next Steps

1. ✅ Deploy API files to production
2. ✅ Create admin user
3. ✅ Test `/api.php?action=ping`
4. ✅ Admin panel can now create/update/delete data
5. ✅ Public site can read data

Your site is now fully connected!
