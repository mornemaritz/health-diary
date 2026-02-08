# API Contracts: Daily Summary Endpoint

**Date**: 2026-02-06  
**Feature**: Frontend-Backend API Integration (002-ui-backend-integration)  
**Source**: OpenAPI 3.0.0 (health-diary-be/openapi.yaml)

## GET /api/health/summary/{date}

Retrieve all health records for a specific date, organized by record type.

### Request

**Path Parameters**:
```
{date} (string, required): ISO 8601 date in format yyyy-MM-dd
```

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Query Parameters**: None

**Example Requests**:
```bash
# Basic request for today
curl -X GET http://localhost:5000/api/health/summary/2026-02-06 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Request for specific date
curl -X GET http://localhost:5000/api/health/summary/2026-01-15 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Response

**Success (200 OK)**:
```typescript
interface DailySummaryResponse {
  date: string;                     // ISO 8601 date (yyyy-MM-dd)
  data: HealthRecord[];             // Array of all records for the date
}

interface HealthRecord {
  id: string;                       // UUID
  date: string;                     // yyyy-MM-dd
  time: string;                     // HH:mm
  recordType: string;               // 'medication' | 'hydration' | 'bowel' | 'food' | 'observation'
  // Additional fields depend on recordType:
  // medication: { medication?: string, dosage?: string }
  // hydration: { quantity?: number }
  // bowel: { consistency?: 'Hard' | 'Normal' | 'Soft' | 'Diarrhea' }
  // food: { food?: string, quantity?: string }
  // observation: { notes?: string, category?: string }
}
```

**Example Response (200)**:
```json
{
  "date": "2026-02-06",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "date": "2026-02-06",
      "time": "09:00",
      "recordType": "medication",
      "medication": "Metformin",
      "dosage": "500mg"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "date": "2026-02-06",
      "time": "10:30",
      "recordType": "hydration",
      "quantity": 250
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "date": "2026-02-06",
      "time": "14:00",
      "recordType": "bowel",
      "consistency": "Normal"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "date": "2026-02-06",
      "time": "12:30",
      "recordType": "food",
      "food": "Grilled chicken with rice",
      "quantity": "1 plate"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440005",
      "date": "2026-02-06",
      "time": "18:00",
      "recordType": "observation",
      "notes": "Feeling tired and experiencing mild headache",
      "category": "Symptoms"
    }
  ]
}
```

**Success (200 OK) - No Records**:
```json
{
  "date": "2026-02-06",
  "data": []
}
```

**Error (400 Bad Request)** - Invalid date format:
```json
{
  "statusCode": 400,
  "message": "Invalid date format. Please use yyyy-MM-dd"
}
```

**Error (401 Unauthorized)** - Invalid or missing auth token:
```json
{
  "statusCode": 401,
  "message": "Unauthorized - Valid access token required"
}
```

---

## Response Data Structure Details

### Date Format
- Format: ISO 8601 (yyyy-MM-dd)
- Examples: "2026-02-06", "2026-01-01", "2025-12-31"

### Time Format
- Format: ISO 8601 (HH:mm in 24-hour format)
- Examples: "09:00", "14:30", "23:45", "00:15"

### Record Type Values
- `"medication"` - Medication administration record
- `"hydration"` - Bottle/hydration consumption record
- `"bowel"` - Bowel movement record
- `"food"` - Solid food consumption record
- `"observation"` - Note/observation record

### Type-Specific Fields

**Medication Record**:
```json
{
  "id": "...",
  "date": "2026-02-06",
  "time": "09:00",
  "recordType": "medication",
  "medication": "Metformin",      // Optional
  "dosage": "500mg"               // Optional
}
```

**Hydration Record**:
```json
{
  "id": "...",
  "date": "2026-02-06",
  "time": "10:30",
  "recordType": "hydration",
  "quantity": 250                 // Optional, numeric
}
```

**Bowel Movement Record**:
```json
{
  "id": "...",
  "date": "2026-02-06",
  "time": "14:00",
  "recordType": "bowel",
  "consistency": "Normal"         // Optional, enum: Hard | Normal | Soft | Diarrhea
}
```

**Food Consumption Record**:
```json
{
  "id": "...",
  "date": "2026-02-06",
  "time": "12:30",
  "recordType": "food",
  "food": "Grilled chicken",      // Optional
  "quantity": "1 plate"           // Optional
}
```

**Observation Record**:
```json
{
  "id": "...",
  "date": "2026-02-06",
  "time": "18:00",
  "recordType": "observation",
  "notes": "Feeling tired",       // Optional
  "category": "Symptoms"          // Optional
}
```

---

## Frontend Implementation Notes

### Date Parameter Formatting

Always pass dates in yyyy-MM-dd format:

```javascript
// Correct
const date = "2026-02-06";
const url = `/api/health/summary/${date}`;

// From HTML input[type="date"]
const dateInput = document.querySelector('input[type="date"]');
const formattedDate = dateInput.value; // Already in yyyy-MM-dd format

// From Date object
const today = new Date();
const dateString = today.toISOString().split('T')[0]; // "2026-02-06"
```

### Data Organization (FR-016)

Process the flat `data` array into organized structure for display:

```javascript
function organizeDailySummary(apiResponse) {
  const organized = {
    date: apiResponse.date,
    medications: [],
    hydrations: [],
    bowels: [],
    foods: [],
    observations: []
  };
  
  apiResponse.data.forEach(record => {
    switch(record.recordType) {
      case 'medication':
        organized.medications.push(record);
        break;
      case 'hydration':
        organized.hydrations.push(record);
        break;
      case 'bowel':
        organized.bowels.push(record);
        break;
      case 'food':
        organized.foods.push(record);
        break;
      case 'observation':
        organized.observations.push(record);
        break;
    }
  });
  
  return organized;
}
```

### Rendering Display Sections

Render each record type as a separate section (FR-016):

```javascript
function renderDailySummary(organized) {
  const container = document.getElementById('summary-container');
  
  // Render medications
  if (organized.medications.length > 0) {
    const section = document.createElement('div');
    section.className = 'summary-section';
    section.innerHTML = `
      <h3>Medications</h3>
      <ul>
        ${organized.medications.map(m => `
          <li>
            <time>${m.time}</time> - ${m.medication || 'No name'} 
            ${m.dosage ? `(${m.dosage})` : ''}
          </li>
        `).join('')}
      </ul>
    `;
    container.appendChild(section);
  }
  
  // Similar for hydrations, bowels, foods, observations...
  
  // Show "no records" message if all arrays are empty
  if (organized.medications.length === 0 && 
      organized.hydrations.length === 0 && 
      organized.bowels.length === 0 && 
      organized.foods.length === 0 && 
      organized.observations.length === 0) {
    container.innerHTML = '<p>No records for this date</p>';
  }
}
```

### Loading and Error Handling

```javascript
async function loadDailySummary(date) {
  try {
    const response = await fetch(`/api/health/summary/${date}`, {
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`
      }
    });
    
    if (response.status === 401) {
      // Attempt refresh
      const newToken = await refreshAccessToken();
      if (newToken) return loadDailySummary(date); // Retry
      else window.location.hash = '#/login';
      return;
    }
    
    if (response.status === 400) {
      const error = await response.json();
      displayError(error.message); // "Invalid date format..."
      return;
    }
    
    const data = await response.json();
    const organized = organizeDailySummary(data);
    renderDailySummary(organized);
  } catch (error) {
    displayError('Failed to load summary. Please check your connection.');
  }
}
```

### User-Friendly Time Display

Format time for display in a readable way:

```javascript
function formatTime(time24h) {
  // Input: "14:30"
  // Output: "2:30 PM"
  const [hours, minutes] = time24h.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}
```

---

## Summary Table

| Aspect | Details |
|--------|---------|
| **Endpoint** | GET /api/health/summary/{date} |
| **Path Parameter** | date (yyyy-MM-dd format) |
| **Auth Required** | Yes (Bearer token) |
| **Response Status** | 200 OK on success |
| **Response Body** | { date, data[] } |
| **Record Types** | medication, hydration, bowel, food, observation |
| **Max Records** | Unlimited (all records for the date returned) |
| **Pagination** | None (returns all records for date) |
| **Filtering** | Not available; filtering done client-side if needed |
| **Performance Target** | Load within 2 seconds per SC-004 |

---

## Error Handling Matrix

| Status | Scenario | User Message |
|--------|----------|--------------|
| 200 | Success with records | Display organized records |
| 200 | Success with no records | "No records for this date" |
| 400 | Invalid date format | "Invalid date format. Use yyyy-MM-dd" |
| 401 | Invalid token | Attempt refresh, then redirect to login |
| 401 | Expired token | Attempt refresh with refresh token |
| 500 | Server error | "Failed to load summary. Please try again." |

