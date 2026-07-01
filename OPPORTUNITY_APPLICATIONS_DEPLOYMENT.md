# Opportunity Applications Admin - Deployment & Testing Guide

## Prerequisites

1. **Database Table**: The `opportunity_motivation_forms` table must exist
   - Location: `ynukalab_database_website` database
   - Must be created by running [CV_UPLOAD_DEPLOYMENT.md](Ynuka%20Site/php/CV_UPLOAD_DEPLOYMENT.md)

2. **API Endpoint**: `/api/api.php` must be deployed and running
   - Must support `?action=list&resource=opportunity_motivation_forms`
   - JWT authentication required

3. **Frontend Build**: Panel Admin must be built and deployed
   - Dev: `bun run dev` on `localhost:8082`
   - Prod: Built files in `dist/`

## Deployment Steps

### Step 1: Database Setup
```bash
# Run on your MySQL server to create the opportunity_motivation_forms table
# File: Ynuka Site/php/create-opportunity-motivation-forms-table.sql

# Or add CV column if table already exists
# File: Ynuka Site/php/add-cv-column-to-motivation-forms.sql
```

### Step 2: PHP API Configuration
File: `Panel Admin/php-api/api.php` (already updated)

```php
// Verify this line includes opportunity_motivation_forms:
$ALLOWED_TABLES = [
    // ... other tables ...
    'opportunity_motivation_forms',
];
```

### Step 3: Frontend TypeScript Updates
Files already updated:
- `Panel Admin/src/lib/api.ts` - Added resource to RESOURCES and labels
- `Panel Admin/src/components/AppSidebar.tsx` - Added sidebar link
- `Panel Admin/src/routes/admin.opportunity-applications.tsx` - Created new page

### Step 4: Build and Deploy
```bash
# Development
cd "Panel Admin"
bun install  # if needed
bun run dev  # Runs on localhost:8082

# Production
bun run build  # Creates dist/ folder
# Deploy dist/ folder to production server
```

## Testing Checklist

### Unit Tests (Local Development)

1. **Page Access**
   - [ ] Navigate to `http://localhost:8082/admin/opportunity-applications`
   - [ ] Page loads without errors
   - [ ] Sidebar link "Candidatures" is visible and clickable

2. **Data Loading**
   - [ ] Table displays loading state briefly
   - [ ] If data exists: Rows appear in table
   - [ ] If no data: "Aucune candidature trouvée" message appears
   - [ ] Check browser console for no API errors

3. **Opportunity Filter**
   - [ ] Dropdown shows all opportunities
   - [ ] Select an opportunity - table filters
   - [ ] Select "Toutes les opportunités" - table resets to show all
   - [ ] Total count updates correctly

4. **Search Functionality**
   - [ ] Type email in search box - results filter
   - [ ] Type name in search box - results filter
   - [ ] Clear search box - table resets
   - [ ] Works with and without opportunity filter

5. **Table Columns**
   - [ ] Email column shows applicant email
   - [ ] Nom column shows applicant name
   - [ ] Opportunité column shows opportunity badge
   - [ ] LinkedIn link opens in new tab when present, shows "-" when absent
   - [ ] X (Twitter) link works correctly
   - [ ] Portfolio link works correctly
   - [ ] CV column shows "PDF" link when file exists, "-" when absent
   - [ ] Date column shows formatted date

6. **CSV Export**
   - [ ] Click "Exporter en CSV" button
   - [ ] File downloads with name format: `candidatures-opportunites-2024-01-15.csv`
   - [ ] Open CSV in Excel/Numbers
   - [ ] Verify:
     - Headers are correct and quoted
     - All columns present (ID, Opportunité, Email, Nom, LinkedIn, X, Portfolio, CV, Message, Date)
     - Data is properly escaped (messages with quotes/commas handled)
     - UTF-8 characters display correctly

7. **Pagination**
   - [ ] Shows "Affichage 1 à 50 sur X" text
   - [ ] "Précédent" button is disabled on first page
   - [ ] "Suivant" button is disabled on last page (if total ≤ 50)
   - [ ] Click "Suivant" - next page loads
   - [ ] Click "Précédent" - previous page loads
   - [ ] Page refresh maintains current page

8. **Refresh Button**
   - [ ] Click refresh icon - page reloads data
   - [ ] Button shows loading state during fetch
   - [ ] Data updates correctly

9. **Error Handling**
   - [ ] Simulate API error - "toast.error" appears
   - [ ] Recovery after error (can retry)
   - [ ] Try export with no data - message "Aucune donnée à exporter"

### Integration Tests

1. **End-to-End Data Flow**
   ```bash
   # Test sequence:
   1. Create new opportunity on opportunities page
   2. Go to public site, apply for opportunity
   3. Submit motivation form
   4. Return to admin panel
   5. Verify new application appears in list
   6. Filter by new opportunity - should appear
   7. Export - data should include new entry
   ```

2. **Authentication**
   - [ ] Log out and try accessing `/admin/opportunity-applications`
   - [ ] Should redirect to login
   - [ ] Log back in - page loads correctly

3. **Permission Checks**
   - [ ] Verify admin user can access page
   - [ ] Verify non-admin user cannot access page
   - [ ] Test with different user roles (if implemented)

### Performance Tests

1. **Large Dataset**
   - [ ] Database contains 1000+ applications
   - [ ] First page loads in < 2 seconds
   - [ ] Pagination between pages smooth
   - [ ] Search on large dataset completes in < 1 second

2. **CSV Export**
   - [ ] Export with 500+ rows completes in < 3 seconds
   - [ ] File size is reasonable (< 10MB for typical data)
   - [ ] Browser doesn't freeze during download

### Browser Compatibility

Test on:
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (if macOS available)
- [ ] Mobile browsers (iOS Safari, Chrome Android)

Verify:
- [ ] Layout responsive on mobile
- [ ] All links clickable on touch devices
- [ ] Dropdowns work on mobile
- [ ] Table scrolls horizontally on small screens

## Troubleshooting

### Issue: "Aucune candidature trouvée" appears but data exists

**Solution**: 
1. Check database: `SELECT COUNT(*) FROM opportunity_motivation_forms;`
2. Verify JWT token is valid (check browser Network tab)
3. Check console for API error messages
4. Verify table is in correct database

### Issue: Export button disabled or not working

**Solution**:
1. Verify CSV export function has data (check console)
2. Check browser console for JavaScript errors
3. Test with sample data (if empty, message should appear)

### Issue: Opportunity filter dropdown empty

**Solution**:
1. Verify opportunities table has data
2. Check API response: `?action=list&resource=opportunities`
3. Verify user has permission to read opportunities table

### Issue: API returns 401 Unauthorized

**Solution**:
1. Check JWT token exists in localStorage
2. Verify token is not expired (token expiry: 7 days)
3. Re-login if token invalid
4. Check CORS headers in API response

### Issue: CSV special characters display as ??

**Solution**:
1. Ensure file opens with UTF-8 encoding
2. In Excel: File → Open → Select file → Click "File Origin: UTF-8"
3. In Google Sheets: Open with Google Sheets

## Rollback Plan

If issues occur during deployment:

1. **Revert Changes**
   ```bash
   git revert <commit-hash>
   ```

2. **Database**
   - No data is deleted, only tables added
   - If needed, drop `opportunity_motivation_forms` table safely

3. **Frontend**
   - Keep previous build deployed
   - Route `/admin/opportunity-applications` will 404 (acceptable)

## Monitoring

Post-deployment, monitor:
- [ ] API response times for list operations
- [ ] Error rates in API logs
- [ ] User engagement with new feature
- [ ] CSV export success rate
- [ ] Database query performance

## Support

For issues or questions:
1. Check browser console for errors
2. Check server API logs for backend errors
3. Verify database connection and table structure
4. Review deployment checklist above
