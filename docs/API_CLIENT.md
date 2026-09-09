# Baby John API Client Guide

## Overview

The Baby John API provides REST endpoints for managing baby activities, user profiles, and offline sync. All endpoints require JWT authentication and support rate limiting.

---

## Base URL

```
Development:  http://localhost:8000/api
Production:   https://api.babyjohn.app/api
```

---

## Authentication

### Obtain Token

**Endpoint:** `POST /api/auth/token`

```bash
curl -X POST "http://localhost:8000/api/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=papai@example.com&password=password123"
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 604800
}
```

### Using Token

Include in Authorization header:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/activities
```

---

## Activities Endpoints

### List Activities

**GET** `/api/activities`

Query Parameters:
- `date` (optional): ISO date string (2026-09-09)
- `activity_type` (optional): Type filter (amamentacao, sono, fralda, etc.)
- `skip` (optional): Pagination offset (default: 0)
- `limit` (optional): Items per page (default: 100, max: 1000)

```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:8000/api/activities?date=2026-09-09&activity_type=amamentacao"
```

**Response:**
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "amamentacao",
      "title": "Amamentação",
      "timestamp": "2026-09-09T14:30:00Z",
      "period": "Tarde",
      "details": {
        "breast": "left",
        "duration_minutes": 15
      },
      "user_id": "user-123",
      "created_at": "2026-09-09T14:30:00Z",
      "updated_at": "2026-09-09T14:30:00Z"
    }
  ],
  "total": 1,
  "skip": 0,
  "limit": 100
}
```

### Create Activity

**POST** `/api/activities`

```bash
curl -X POST "http://localhost:8000/api/activities" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "amamentacao",
    "title": "Amamentação",
    "period": "Tarde",
    "details": {
      "breast": "left",
      "duration_minutes": 15
    }
  }'
```

**Request Body:**
```json
{
  "type": "amamentacao",
  "title": "Amamentação",
  "subtitle": "Seio esquerdo",
  "period": "Tarde",
  "is_in_progress": false,
  "details": {
    "breast": "left",
    "duration_minutes": 15,
    "observations": "Dormiu depois"
  }
}
```

**Response:** (201 Created)
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "type": "amamentacao",
  "title": "Amamentação",
  "timestamp": "2026-09-09T14:30:00Z",
  "period": "Tarde",
  "details": { "breast": "left", "duration_minutes": 15 },
  "user_id": "user-123",
  "created_at": "2026-09-09T14:30:00Z",
  "updated_at": "2026-09-09T14:30:00Z"
}
```

### Get Activity

**GET** `/api/activities/{activity_id}`

```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:8000/api/activities/550e8400-e29b-41d4-a716-446655440000"
```

### Update Activity

**PUT** `/api/activities/{activity_id}`

```bash
curl -X PUT "http://localhost:8000/api/activities/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "amamentacao",
    "title": "Amamentação",
    "details": {
      "breast": "right",
      "duration_minutes": 20
    }
  }'
```

### Delete Activity

**DELETE** `/api/activities/{activity_id}`

```bash
curl -X DELETE "http://localhost:8000/api/activities/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer TOKEN"
```

**Response:** (204 No Content)

---

## Daily Summary

### Get Daily Summary

**GET** `/api/activities/summary/daily`

Query Parameters:
- `date` (optional): ISO date (default: today)

```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:8000/api/activities/summary/daily?date=2026-09-09"
```

**Response:**
```json
{
  "date": "2026-09-09",
  "activities_count": 12,
  "breakdown": {
    "amamentacao": 4,
    "sono": 2,
    "fralda": 3,
    "comeu": 2,
    "custom": 1
  },
  "last_activity": {
    "type": "sono",
    "timestamp": "2026-09-09T21:00:00Z",
    "duration": 120
  },
  "notes": "Dia calmo, bom apetite"
}
```

---

## User Profile

### Get Current User

**GET** `/api/users/me`

```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:8000/api/users/me"
```

**Response:**
```json
{
  "id": "user-123",
  "email": "papai@example.com",
  "name": "Papai",
  "baby_name": "John",
  "baby_birthdate": "2026-04-10",
  "role": "parent",
  "created_at": "2026-08-18T00:00:00Z"
}
```

### Update User Profile

**PUT** `/api/users/me`

```bash
curl -X PUT "http://localhost:8000/api/users/me" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Papai João",
    "email": "papai.joao@example.com"
  }'
```

---

## Offline Sync

### Get Sync Status

**GET** `/api/sync/status`

```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:8000/api/sync/status"
```

**Response:**
```json
{
  "pending_count": 3,
  "syncing": false,
  "last_sync": "2026-09-09T10:00:00Z",
  "queued_items": [
    {
      "id": "queue-123",
      "operation": "CREATE_ACTIVITY",
      "entity_type": "activity",
      "status": "pending",
      "created_at": "2026-09-09T10:05:00Z",
      "retry_count": 0
    }
  ]
}
```

### Trigger Sync

**POST** `/api/sync/process`

```bash
curl -X POST "http://localhost:8000/api/sync/process" \
  -H "Authorization: Bearer TOKEN"
```

**Response:**
```json
{
  "processed": 3,
  "failed": 0,
  "synced_at": "2026-09-09T10:15:00Z"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid request data",
  "error_code": "VALIDATION_ERROR"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid or expired token",
  "error_code": "INVALID_TOKEN"
}
```

### 403 Forbidden
```json
{
  "detail": "Access denied",
  "error_code": "FORBIDDEN"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found",
  "error_code": "NOT_FOUND"
}
```

### 429 Too Many Requests
```json
{
  "detail": "Rate limit exceeded",
  "error_code": "RATE_LIMITED",
  "retry_after": 60
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error",
  "error_code": "INTERNAL_ERROR",
  "request_id": "req-12345"
}
```

---

## Rate Limiting

All endpoints are rate limited:
- **Default:** 1000 requests per 60 seconds per IP
- **API endpoints:** 2000 requests per 60 seconds per IP

Headers in response:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1694300400
```

When limit exceeded:
- Status: `429 Too Many Requests`
- Retry-After: seconds to wait before retry

---

## JavaScript Client Example

```javascript
class BabyJohnClient {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async request(method, endpoint, data = null) {
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`${error.error_code}: ${error.detail}`);
    }

    return response.json();
  }

  // Activities
  async getActivities(date, type) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (type) params.append('activity_type', type);
    
    return this.request('GET', `/api/activities?${params}`);
  }

  async createActivity(activity) {
    return this.request('POST', '/api/activities', activity);
  }

  async deleteActivity(id) {
    return this.request('DELETE', `/api/activities/${id}`);
  }

  // Summary
  async getDailySummary(date) {
    const params = date ? `?date=${date}` : '';
    return this.request('GET', `/api/activities/summary/daily${params}`);
  }

  // User
  async getCurrentUser() {
    return this.request('GET', '/api/users/me');
  }

  // Sync
  async getSyncStatus() {
    return this.request('GET', '/api/sync/status');
  }

  async triggerSync() {
    return this.request('POST', '/api/sync/process');
  }
}

// Usage
const client = new BabyJohnClient('http://localhost:8000', token);

// Get activities
const activities = await client.getActivities('2026-09-09', 'amamentacao');

// Create activity
const newActivity = await client.createActivity({
  type: 'amamentacao',
  title: 'Amamentação',
  period: 'Tarde',
  details: { breast: 'left', duration_minutes: 15 }
});

// Get summary
const summary = await client.getDailySummary('2026-09-09');
```

---

## Python Client Example

```python
import requests
from typing import Optional

class BabyJohnClient:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }

    def get_activities(self, date: Optional[str] = None, 
                      activity_type: Optional[str] = None):
        params = {}
        if date:
            params['date'] = date
        if activity_type:
            params['activity_type'] = activity_type
        
        response = requests.get(
            f'{self.base_url}/api/activities',
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        return response.json()

    def create_activity(self, activity_data: dict):
        response = requests.post(
            f'{self.base_url}/api/activities',
            headers=self.headers,
            json=activity_data
        )
        response.raise_for_status()
        return response.json()

    def get_daily_summary(self, date: Optional[str] = None):
        params = {'date': date} if date else {}
        response = requests.get(
            f'{self.base_url}/api/activities/summary/daily',
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        return response.json()

# Usage
client = BabyJohnClient('http://localhost:8000', token)
activities = client.get_activities('2026-09-09')
print(activities)
```

---

## cURL Examples

```bash
# Get token
TOKEN=$(curl -s -X POST "http://localhost:8000/api/auth/token" \
  -d "username=papai@example.com&password=password123" \
  | jq -r '.access_token')

# List activities
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/activities"

# Create activity
curl -X POST "http://localhost:8000/api/activities" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "amamentacao",
    "title": "Amamentação",
    "period": "Tarde",
    "details": {"breast": "left", "duration_minutes": 15}
  }'

# Get daily summary
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/activities/summary/daily?date=2026-09-09"

# Get current user
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/users/me"

# Get sync status
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/sync/status"
```

---

## Rate Limit Handling Example

```python
import time
import requests

def make_request_with_retry(client, method, endpoint, data=None, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = requests.request(
                method,
                f'{client.base_url}{endpoint}',
                headers=client.headers,
                json=data
            )
            
            if response.status_code == 429:
                retry_after = int(response.headers.get('Retry-After', 60))
                print(f"Rate limited. Waiting {retry_after} seconds...")
                time.sleep(retry_after)
                continue
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)  # Exponential backoff
    
    raise Exception("Max retries exceeded")
```

---

## Integration Testing

```bash
#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

BASE_URL="http://localhost:8000"
EMAIL="papai@example.com"
PASSWORD="password123"

# Get token
echo "Getting token..."
TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/token" \
  -d "username=$EMAIL&password=$PASSWORD" \
  | jq -r '.access_token')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo -e "${RED}Failed to get token${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Token obtained${NC}"

# Test health
echo "Testing health endpoint..."
curl -s "$BASE_URL/api/health" | jq .
echo -e "${GREEN}✓ Health check passed${NC}"

# Get current user
echo "Getting current user..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/users/me" | jq .
echo -e "${GREEN}✓ User profile retrieved${NC}"

# List activities
echo "Listing activities..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/api/activities" | jq .
echo -e "${GREEN}✓ Activities listed${NC}"

# Create activity
echo "Creating activity..."
ACTIVITY=$(curl -s -X POST "$BASE_URL/api/activities" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "amamentacao",
    "title": "Test",
    "period": "Tarde",
    "details": {"breast": "left", "duration_minutes": 15}
  }')

ACTIVITY_ID=$(echo $ACTIVITY | jq -r '.id')
echo -e "${GREEN}✓ Activity created: $ACTIVITY_ID${NC}"

# Get daily summary
echo "Getting daily summary..."
curl -s -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/api/activities/summary/daily" | jq .
echo -e "${GREEN}✓ Summary retrieved${NC}"

# Get sync status
echo "Getting sync status..."
curl -s -H "Authorization: Bearer $TOKEN" \
  "$BASE_URL/api/sync/status" | jq .
echo -e "${GREEN}✓ Sync status retrieved${NC}"

echo -e "\n${GREEN}All tests passed!${NC}"
```

---

## Documentation

- **OpenAPI Docs:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **OpenAPI Schema:** http://localhost:8000/openapi.json

---

**Last Updated:** 2026-09-09
