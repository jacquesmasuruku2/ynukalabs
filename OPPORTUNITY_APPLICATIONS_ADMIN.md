# Panel Admin - Opportunity Applications Feature

## Overview
Added a new admin panel page to view, filter, and export opportunity applications.

## New Files Created

### 1. `/Panel Admin/src/routes/admin.opportunity-applications.tsx`
**Purpose**: Admin page to view applications submitted by users for opportunities.

**Features**:
- List all applications in a sortable table
- Filter by opportunity (dropdown)
- Search by email or applicant name
- Pagination (50 items per page)
- Export to CSV with formatted data
- Display applicant details:
  - Email
  - Name
  - Opportunity (as badge)
  - LinkedIn, X, Portfolio URLs (as clickable links)
  - CV file (downloadable link)
  - Submission date

**Architecture**:
```typescript
// State management
- applications: Application[] (from opportunity_motivation_forms table)
- opportunities: Opportunity[] (for filtering)
- search, selectedOpportunity, page, limit
- loading state

// API calls
- fetch(`/api/api.php?action=list&resource=opportunity_motivation_forms`)
- api.list("opportunities", 1, 1000) for opportunity lookup

// Export
- CSV format with UTF-8 encoding
- Filename: candidatures-opportunites-{date}.csv
- Includes all form fields + opportunity name
```

## Modified Files

### 1. `/Panel Admin/src/components/AppSidebar.tsx`
**Change**: Added menu item for applications
```tsx
{ url: "/admin/opportunity-applications", label: "Candidatures", icon: ClipboardList }
```

### 2. `/Panel Admin/php-api/api.php`
**Change**: Added `opportunity_motivation_forms` to ALLOWED_TABLES
```php
$ALLOWED_TABLES = [
    // ... existing tables ...
    'opportunity_motivation_forms',
];
```

### 3. `/Panel Admin/src/lib/api.ts`
**Changes**:
- Added `opportunity_motivation_forms` to RESOURCES array
- Added label in RESOURCE_LABELS
- Added columns in RESOURCE_COLUMNS

## Database Requirements

The `opportunity_motivation_forms` table must exist and contain:
```sql
CREATE TABLE `opportunity_motivation_forms` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `opportunity_id` INT NOT NULL,
  `user_email` VARCHAR(255) NOT NULL,
  `user_name` VARCHAR(255),
  `user_avatar` LONGTEXT,
  `linkedin_url` VARCHAR(500),
  `twitter_url` VARCHAR(500),
  `portfolio_url` VARCHAR(500),
  `message` LONGTEXT,
  `cv_file_url` LONGTEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE,
  KEY `idx_opportunity_id` (`opportunity_id`),
  KEY `idx_user_email` (`user_email`),
  UNIQUE KEY `idx_opportunity_email` (`opportunity_id`, `user_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## Usage

1. **Access the page**: Navigate to `/admin/opportunity-applications` in the admin panel
2. **View applications**: Table displays all applications with relevant details
3. **Filter**: Use the dropdown to filter by opportunity
4. **Search**: Search by email or applicant name
5. **Export**: Click "Exporter en CSV" to download all filtered results
6. **Sort**: Click table headers to sort (pagination refreshes data)

## API Integration

The page communicates with the backend via:
- `GET /api/api.php?action=list&resource=opportunity_motivation_forms&page=X&limit=50&search=...`
- `GET /api/api.php?action=list&resource=opportunities&page=1&limit=1000`

Both endpoints require authentication via JWT token (Bearer header).

## Frontend Components Used
- Tailwind CSS for styling
- Lucide React icons (Download, RefreshCcw, ExternalLink)
- Radix UI components (Select, Button, Badge)
- Table component from UI library
- PageShell, PageHeader, PageToolbar for consistent layout

## Deployment Checklist

- [ ] Database table `opportunity_motivation_forms` created
- [ ] Base data migrated (from previous implementation)
- [ ] PHP API updated with new resource
- [ ] TypeScript types updated
- [ ] Sidebar navigation updated
- [ ] Test in development environment
- [ ] Verify CSV export works with sample data
- [ ] Test filtering by opportunity
- [ ] Test search functionality
- [ ] Check responsive design on mobile

## Next Steps (Optional Enhancements)

1. Add bilingual support (French/English) to labels and placeholders
2. Add advanced filtering (date range, email domain, etc.)
3. Add individual application detail view/modal
4. Add bulk actions (delete, approve, send email, etc.)
5. Add export to XLSX (Excel) format instead of CSV
6. Add application status tracking (new, reviewed, hired, rejected)
7. Add email notification system for new applications
8. Add application comments/notes for admins
