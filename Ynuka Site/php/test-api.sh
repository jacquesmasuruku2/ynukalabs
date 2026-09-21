#!/bin/bash
# Ynuka Labs API Testing Script
# Usage: bash test-api.sh

API_URL="http://localhost/php/api.php"

echo "=== Ynuka Labs API Test Suite ==="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: PING
echo -e "${YELLOW}[1/5] Testing PING endpoint...${NC}"
curl -s "$API_URL?action=ping" | jq '.' || echo "Failed to parse JSON"
echo ""

# Test 2: Newsletter Subscription
echo -e "${YELLOW}[2/5] Testing Newsletter Subscription...${NC}"
curl -s -X POST "$API_URL?action=create&resource=newsletter_subscribers" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-'$(date +%s)'@example.com",
    "name": "Test User",
    "active": 1,
    "subscribed_at": "'$(date -u +'%Y-%m-%dT%H:%M:%SZ')'",
    "test": true
  }' | jq '.' || echo "Failed"
echo ""

# Test 3: Contact Message
echo -e "${YELLOW}[3/5] Testing Contact Message...${NC}"
curl -s -X POST "$API_URL?action=create&resource=contact_messages" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Contact",
    "email": "test-'$(date +%s)'@example.com",
    "phone": "+33612345678",
    "subject": "Test Message",
    "message": "This is a test message from the API testing script"
  }' | jq '.' || echo "Failed"
echo ""

# Test 4: Event Registration
echo -e "${YELLOW}[4/5] Testing Event Registration...${NC}"
curl -s -X POST "$API_URL?action=create&resource=event_registrations" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": 1,
    "full_name": "Test User",
    "email": "test-'$(date +%s)'@example.com",
    "phone": "+33612345678",
    "organization": "Test Company"
  }' | jq '.' || echo "Failed"
echo ""

# Test 5: List Newsletter Subscribers (without auth - should show error or limited data)
echo -e "${YELLOW}[5/5] Testing List Newsletter Subscribers...${NC}"
curl -s "$API_URL?action=list&resource=newsletter_subscribers&page=1&limit=5" | jq '.' || echo "Failed"
echo ""

echo -e "${GREEN}=== Tests Complete ===${NC}"
echo ""
echo "Tips:"
echo "1. Replace 'localhost' with your domain if needed"
echo "2. Use 'jq' for JSON formatting (install with: apt-get install jq)"
echo "3. Check the database for inserted records"
echo "4. Review error messages for any issues"
