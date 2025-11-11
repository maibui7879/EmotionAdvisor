# Aura Mental Wellness - API Requirements & Database Schema

> **Scope**: Backend API replaces localStorage for core features. Client-side storage (localStorage) retained only for UI state (theme, language preferences).
> **Database**: MongoDB (NoSQL) with collections instead of relational tables.

---

## 1. Database Schema (MongoDB)

### Database Setup
```javascript
// Create database and collections
use aura_db;

// All collections created on first insert, but here are the schemas:
db.createCollection("users");
db.createCollection("emotion_entries");
db.createCollection("chat_messages");
db.createCollection("schedule_items");
db.createCollection("notifications");
```

### 1.1 Users Collection
```javascript
// Document Structure
db.users.insertOne({
  _id: ObjectId(),
  name: "John Doe",
  email: "john@example.com",
  password_hash: "$2b$10$...", // Bcrypt hashed
  avatar_url: "https://i.pravatar.cc/150?u=john@example.com",
  created_at: ISODate("2025-11-10T08:00:00Z"),
  updated_at: ISODate("2025-11-11T10:30:00Z"),
  is_active: true
});

// Create indexes for fast lookups
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ created_at: -1 });
```

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | ✓ | MongoDB ObjectId (primary key) |
| name | String | ✓ | User's name |
| email | String | ✓ | Unique email |
| password_hash | String | ✓ | Bcrypt hashed password |
| avatar_url | String | | Avatar image URL |
| created_at | Date | ✓ | Account creation |
| updated_at | Date | ✓ | Last update |
| is_active | Boolean | ✓ | Active status |

**Notes**:
- Theme & color preferences → keep in **localStorage** (client-side only)
- Email indexed as unique constraint
- No need for separate theme/color fields in DB

---

### 1.2 Emotion Entries Collection
```javascript
// Document Structure
db.emotion_entries.insertOne({
  _id: ObjectId(),
  user_id: ObjectId("507f1f77bcf86cd799439011"),
  mood: "Happy",
  intensity: 7,
  note: "Had a great day at work!",
  ai_suggestion: "Keep up the positive energy!",
  created_at: ISODate("2025-11-11T14:20:00Z"),
  updated_at: ISODate("2025-11-11T14:20:00Z")
});

// Create indexes for fast queries
db.emotion_entries.createIndex({ user_id: 1, created_at: -1 });
db.emotion_entries.createIndex({ user_id: 1, mood: 1 });
db.emotion_entries.createIndex({ created_at: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL
```

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | ✓ | MongoDB ObjectId (primary key) |
| user_id | ObjectId | ✓ | Reference to users collection |
| mood | String | ✓ | One of: Happy, Sad, Anxious, Stressed, Tired, Peaceful, Angry, Excited, Neutral |
| intensity | Int (1-10) | ✓ | Emotion level |
| note | String | | User's note/message |
| ai_suggestion | String | | AI response |
| created_at | Date | ✓ | Entry creation |
| updated_at | Date | ✓ | Last update |

---

### 1.3 Chat Messages Collection
```javascript
// Document Structure
db.chat_messages.insertOne({
  _id: ObjectId(),
  user_id: ObjectId("507f1f77bcf86cd799439011"),
  role: "user", // 'user' or 'model'
  message_text: "I'm feeling anxious about my presentation",
  detected_mood: "Anxious",
  suggested_schedules: [
    {
      id: "temp-1",
      title: "Relaxation Exercise",
      startTime: "19:00",
      endTime: "19:15",
      accepted: false
    }
  ],
  image_base64: null, // Optional: base64 encoded image for mood detection
  created_at: ISODate("2025-11-11T18:00:00Z")
});

// Create indexes for pagination and filtering
db.chat_messages.createIndex({ user_id: 1, created_at: -1 });
db.chat_messages.createIndex({ user_id: 1, role: 1 });
```

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | ✓ | MongoDB ObjectId (primary key) |
| user_id | ObjectId | ✓ | Reference to users collection |
| role | String | ✓ | 'user' or 'model' |
| message_text | String | ✓ | Message content |
| detected_mood | String | | Mood detected (user messages only) |
| suggested_schedules | Array | | Array of schedule suggestions from AI |
| image_base64 | String | | Optional base64 image for mood analysis |
| created_at | Date | ✓ | Message timestamp |

**suggested_schedules Array Structure**:
```javascript
[
  {
    id: "uuid-or-timestamp",
    title: "Relaxation Exercise",
    startTime: "19:00",
    endTime: "19:15",
    accepted: false
  }
]
```

---

### 1.4 Schedule Items Collection
```javascript
// Document Structure
db.schedule_items.insertOne({
  _id: ObjectId(),
  user_id: ObjectId("507f1f77bcf86cd799439011"),
  title: "Morning Meditation",
  start_time: "07:00", // HH:MM format
  end_time: "07:20", // HH:MM format
  schedule_date: ISODate("2025-11-12T00:00:00Z"), // Date in YYYY-MM-DD format
  is_completed: false,
  created_at: ISODate("2025-11-11T16:00:00Z"),
  updated_at: ISODate("2025-11-11T16:00:00Z")
});

// Create indexes for date range queries and conflict detection
db.schedule_items.createIndex({ user_id: 1, schedule_date: 1 });
db.schedule_items.createIndex({ user_id: 1, schedule_date: 1, start_time: 1 });
db.schedule_items.createIndex({ schedule_date: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL
```

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | ✓ | MongoDB ObjectId (primary key) |
| user_id | ObjectId | ✓ | Reference to users collection |
| title | String | ✓ | Activity name |
| start_time | String (HH:MM) | ✓ | Start time |
| end_time | String (HH:MM) | ✓ | End time |
| schedule_date | Date | ✓ | Activity date (stored as ISO date) |
| is_completed | Boolean | ✓ | Completion status |
| created_at | Date | ✓ | Creation time |
| updated_at | Date | ✓ | Last update |

**Notes**:
- Store times as HH:MM strings (simple, no timezone issues for daily schedule)
- Conflict detection & auto-adjust handled **server-side** during creation/update
- Use aggregation pipeline for range queries

---

### 1.5 Notifications Collection
```javascript
// Document Structure
db.notifications.insertOne({
  _id: ObjectId(),
  user_id: ObjectId("507f1f77bcf86cd799439011"),
  message: "You have a meditation session in 15 minutes",
  type: "info", // 'info', 'success', or 'error'
  is_read: false,
  created_at: ISODate("2025-11-11T19:45:00Z")
});

// Create indexes for efficient queries
db.notifications.createIndex({ user_id: 1, created_at: -1 });
db.notifications.createIndex({ user_id: 1, is_read: 1 });
db.notifications.createIndex({ created_at: 1 }, { expireAfterSeconds: 604800 }); // 7 days TTL
```

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | ✓ | MongoDB ObjectId (primary key) |
| user_id | ObjectId | ✓ | Reference to users collection |
| message | String | ✓ | Notification content |
| type | String | ✓ | 'info', 'success', or 'error' |
| is_read | Boolean | ✓ | Read status |
| created_at | Date | ✓ | Creation time |

**Notes**:
- TTL index automatically removes notifications after 7 days
- Supports efficient filtering by read status

---

## MongoDB Aggregation Pipelines

### Conflict Detection Query
```javascript
// Find overlapping schedules on a specific date
db.schedule_items.aggregate([
  {
    $match: {
      user_id: ObjectId("507f1f77bcf86cd799439011"),
      schedule_date: ISODate("2025-11-12T00:00:00Z")
    }
  },
  {
    $project: {
      title: 1,
      start_time: 1,
      end_time: 1,
      // Convert HH:MM to minutes for comparison
      start_minutes: {
        $toInt: {
          $substr: ["$start_time", 0, 2]
        }
      },
      start_minutes: {
        $add: [
          { $multiply: [{ $toInt: { $substr: ["$start_time", 0, 2] } }, 60] },
          { $toInt: { $substr: ["$start_time", 3, 2] } }
        ]
      },
      end_minutes: {
        $add: [
          { $multiply: [{ $toInt: { $substr: ["$end_time", 0, 2] } }, 60] },
          { $toInt: { $substr: ["$end_time", 3, 2] } }
        ]
      }
    }
  }
]);
```

### Analytics Summary Query (Mood Distribution)
```javascript
// Get mood distribution for the past 7 days
db.emotion_entries.aggregate([
  {
    $match: {
      user_id: ObjectId("507f1f77bcf86cd799439011"),
      created_at: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 7))
      }
    }
  },
  {
    $group: {
      _id: "$mood",
      count: { $sum: 1 },
      avg_intensity: { $avg: "$intensity" }
    }
  },
  {
    $sort: { count: -1 }
  }
]);
```

### Chat Segments Query (User + AI Exchanges)
```javascript
// Group chat messages into segments: user message followed by AI response
db.chat_messages.aggregate([
  {
    $match: {
      user_id: ObjectId("507f1f77bcf86cd799439011")
    }
  },
  {
    $sort: { created_at: 1 }
  },
  {
    $group: {
      _id: {
        $cond: [
          { $eq: ["$role", "user"] },
          { $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$created_at" } },
          null
        ]
      },
      messages: { $push: "$$ROOT" }
    }
  },
  {
    $match: {
      _id: { $ne: null }
    }
  }
]);
```

---

## 2. API Endpoints (REST)

**Base URL**: `/api/v1`  
**Authentication**: JWT Bearer token (required for all endpoints except auth)  
**Content-Type**: `application/json`

### Standard Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { ... }
  }
}
```

---

## 3. Auth Endpoints

### POST /auth/register
Create a new user account

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar_url": "https://i.pravatar.cc/150?u=john@example.com",
    "created_at": "2025-11-11T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### POST /auth/login
Login user

**Request**:
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar_url": "https://i.pravatar.cc/150?u=john@example.com",
    "created_at": "2025-11-10T08:00:00Z",
    "last_login": "2025-11-11T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### POST /auth/logout
Logout current user (invalidate token on client-side)

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 4. User Endpoints

### GET /users/profile
Get current user profile

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar_url": "https://i.pravatar.cc/150?u=john@example.com",
    "created_at": "2025-11-10T08:00:00Z",
    "last_login": "2025-11-11T10:30:00Z"
  }
}
```

---

### PUT /users/profile
Update user profile (name, avatar)

**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "name": "Jane Doe",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Jane Doe",
    "email": "john@example.com",
    "avatar_url": "https://example.com/avatar.jpg",
    "updated_at": "2025-11-11T11:45:00Z"
  }
}
```

---

## 5. Emotion Entries Endpoints

### POST /emotions
Create emotion entry

**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "mood": "Happy",
  "intensity": 7,
  "note": "Had a great day at work!",
  "ai_suggestion": "Keep up the positive energy!"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "mood": "Happy",
    "intensity": 7,
    "note": "Had a great day at work!",
    "ai_suggestion": "Keep up the positive energy!",
    "created_at": "2025-11-11T14:20:00Z",
    "updated_at": "2025-11-11T14:20:00Z"
  }
}
```

---

### GET /emotions
Get emotion entries (paginated, filtered)

**Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | Int | 20 | Results per page (max 100) |
| offset | Int | 0 | Pagination offset |
| mood | String | | Filter by mood |
| start_date | Date (YYYY-MM-DD) | | From date |
| end_date | Date (YYYY-MM-DD) | | To date |
| sort | String | created_at | Sort by: created_at, intensity, mood |
| order | String | desc | asc or desc |

**Example**: `GET /emotions?limit=10&mood=Happy&sort=intensity&order=desc`

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "mood": "Happy",
      "intensity": 7,
      "note": "Had a great day at work!",
      "ai_suggestion": "Keep up the positive energy!",
      "created_at": "2025-11-11T14:20:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 10,
    "offset": 0,
    "pages": 5
  }
}
```

---

### GET /emotions/:id
Get specific emotion entry

**Headers**: `Authorization: Bearer {token}`

**Response** (200): Same as emotion object above

---

### PUT /emotions/:id
Update emotion entry

**Headers**: `Authorization: Bearer {token}`

**Request**: Same structure as POST

**Response** (200): Updated emotion object

---

### DELETE /emotions/:id
Delete emotion entry

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "success": true,
  "message": "Emotion entry deleted successfully",
  "deleted_id": "uuid"
}
```

---

## 6. Chat Messages Endpoints

### POST /chat/messages
Send message to AI (with optional image)

**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "message_text": "I'm feeling anxious about my presentation",
  "image_base64": "data:image/jpeg;base64,..." // Optional
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "user_message": {
      "id": "uuid",
      "user_id": "uuid",
      "role": "user",
      "message_text": "I'm feeling anxious about my presentation",
      "detected_mood": "Anxious",
      "created_at": "2025-11-11T18:00:00Z"
    },
    "ai_message": {
      "id": "uuid",
      "user_id": "uuid",
      "role": "model",
      "message_text": "I understand your anxiety. Let me suggest...",
      "suggested_schedules": [
        {
          "id": "temp-1",
          "title": "Relaxation Exercise",
          "startTime": "19:00",
          "endTime": "19:15",
          "accepted": false
        }
      ],
      "created_at": "2025-11-11T18:00:15Z"
    },
    "emotion_entry_created": {
      "id": "uuid",
      "mood": "Anxious",
      "intensity": 6,
      "note": "I'm feeling anxious about my presentation"
    }
  }
}
```

---

### GET /chat/messages
Get chat history (paginated)

**Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | Int | 50 | Results per page |
| offset | Int | 0 | Pagination offset |

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "role": "user",
      "message_text": "...",
      "detected_mood": "Anxious",
      "created_at": "2025-11-11T18:00:00Z"
    },
    {
      "id": "uuid",
      "user_id": "uuid",
      "role": "model",
      "message_text": "...",
      "suggested_schedules": [...],
      "created_at": "2025-11-11T18:00:15Z"
    }
  ],
  "pagination": {
    "total": 156,
    "limit": 50,
    "offset": 0,
    "pages": 4
  }
}
```

---

### DELETE /chat/messages/:id
Delete specific chat message

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "success": true,
  "message": "Message deleted successfully",
  "deleted_id": "uuid"
}
```

---

### DELETE /chat/messages
Clear all chat history

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "success": true,
  "message": "All chat messages deleted successfully",
  "deleted_count": 156
}
```

---

## 7. Schedule Items Endpoints

### POST /schedules
Create schedule item (with conflict detection & auto-adjust)

**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "title": "Morning Meditation",
  "start_time": "07:00",
  "end_time": "07:20",
  "schedule_date": "2025-11-12",
  "auto_adjust": true
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "Morning Meditation",
    "start_time": "07:00",
    "end_time": "07:20",
    "schedule_date": "2025-11-12",
    "is_completed": false,
    "created_at": "2025-11-11T16:00:00Z",
    "updated_at": "2025-11-11T16:00:00Z"
  }
}
```

**Response** (201 - With auto-adjust):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Morning Meditation",
    "start_time": "07:45",
    "end_time": "08:05",
    "schedule_date": "2025-11-12",
    "is_completed": false,
    "created_at": "2025-11-11T16:00:00Z"
  },
  "message": "Schedule adjusted to avoid conflict with existing activity"
}
```

**Response** (409 - Conflict, no auto-adjust):
```json
{
  "success": false,
  "error": {
    "code": "SCHEDULE_CONFLICT",
    "message": "Time slot conflicts with existing schedule",
    "details": {
      "conflicts": [
        {
          "id": "uuid",
          "title": "Breakfast",
          "start_time": "07:15",
          "end_time": "07:45"
        }
      ],
      "suggested_slot": {
        "start_time": "07:45",
        "end_time": "08:05"
      }
    }
  }
}
```

---

### GET /schedules
Get schedule items (filtered by date range)

**Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| date | Date | Get schedules for specific date (YYYY-MM-DD) |
| start_date | Date | From date (YYYY-MM-DD) |
| end_date | Date | To date (YYYY-MM-DD) |
| is_completed | Boolean | Filter by completion status |
| limit | Int | Results per page (default: 50) |
| offset | Int | Pagination offset (default: 0) |

**Example**: `GET /schedules?date=2025-11-12`

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "Morning Meditation",
      "start_time": "07:00",
      "end_time": "07:20",
      "schedule_date": "2025-11-12",
      "is_completed": false,
      "created_at": "2025-11-11T16:00:00Z"
    }
  ],
  "pagination": {
    "total": 12,
    "limit": 50,
    "offset": 0,
    "pages": 1
  }
}
```

---

### GET /schedules/:id
Get specific schedule item

**Headers**: `Authorization: Bearer {token}`

**Response** (200): Schedule object

---

### PUT /schedules/:id
Update schedule item

**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "title": "Extended Morning Meditation",
  "start_time": "07:00",
  "end_time": "07:30",
  "is_completed": false,
  "auto_adjust": true
}
```

**Response** (200): Updated schedule object

---

### PATCH /schedules/:id/complete
Mark schedule as completed/uncompleted

**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "is_completed": true
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "is_completed": true,
    "updated_at": "2025-11-12T07:25:00Z"
  }
}
```

---

### DELETE /schedules/:id
Delete schedule item

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "success": true,
  "message": "Schedule item deleted successfully",
  "deleted_id": "uuid"
}
```

---

### POST /schedules/check-conflicts
Check for time conflicts without creating

**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "start_time": "07:00",
  "end_time": "07:30",
  "schedule_date": "2025-11-12"
}
```

**Response** (200 - No conflict):
```json
{
  "success": true,
  "has_conflict": false,
  "conflicts": []
}
```

**Response** (200 - With conflict):
```json
{
  "success": true,
  "has_conflict": true,
  "conflicts": [
    {
      "id": "uuid",
      "title": "Breakfast",
      "start_time": "07:15",
      "end_time": "07:45"
    }
  ],
  "suggested_slot": {
    "start_time": "07:45",
    "end_time": "08:15"
  }
}
```

---

## 8. Suggested Schedules (from Chat) Endpoints

### PATCH /suggestions/:id/accept
Accept suggested schedule from chat & add to calendar

**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "schedule_date": "2025-11-12"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "suggestion_updated": {
      "id": "temp-1",
      "accepted": true,
      "accepted_at": "2025-11-11T18:30:00Z"
    },
    "created_schedule": {
      "id": "uuid",
      "title": "Relaxation Exercise",
      "start_time": "19:00",
      "end_time": "19:15",
      "schedule_date": "2025-11-12",
      "is_completed": false,
      "created_at": "2025-11-11T18:30:00Z"
    }
  }
}
```

**Response** (409 - Conflict):
```json
{
  "success": false,
  "error": {
    "code": "SCHEDULE_CONFLICT",
    "message": "Suggested time conflicts with existing schedule",
    "details": {
      "conflicts": [...],
      "suggested_slot": {...}
    }
  }
}
```

---

## 9. Notifications Endpoints

### GET /notifications
Get user notifications (paginated, filtered)

**Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | Int | 20 | Results per page |
| offset | Int | 0 | Pagination offset |
| type | String | | Filter by type: info, success, error |
| is_read | Boolean | | Filter by read status |

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": "uuid",
      "message": "You have a meditation session in 15 minutes",
      "type": "info",
      "is_read": false,
      "created_at": "2025-11-11T19:45:00Z"
    }
  ],
  "pagination": {
    "total": 28,
    "limit": 20,
    "offset": 0,
    "pages": 2
  }
}
```

---

### PATCH /notifications/:id/read
Mark notification as read

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "is_read": true
  }
}
```

---

### PATCH /notifications/read-all
Mark all notifications as read

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "updated_count": 5
}
```

---

### DELETE /notifications/:id
Delete notification

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "success": true,
  "message": "Notification deleted successfully",
  "deleted_id": 1
}
```

---

### DELETE /notifications
Delete all notifications

**Headers**: `Authorization: Bearer {token}`

**Response** (200):
```json
{
  "success": true,
  "message": "All notifications deleted successfully",
  "deleted_count": 28
}
```

---

## 10. AI & Analytics Endpoints

### POST /ai/analyze-mood
Analyze user message & detect mood + get AI response

**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "message": "I'm feeling very stressed about my work",
  "image_base64": "data:image/jpeg;base64,..." // Optional: only if camera is ON
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "mood": "Stressed",
    "intensity": 7,
    "response_text": "I understand you're stressed about work...",
    "suggested_schedules": [
      {
        "title": "Breathing Exercise",
        "start_time": "18:00",
        "end_time": "18:10"
      }
    ]
  }
}
```

**Server-side Logic**:
- If `image_base64` provided (camera ON):
  - Prioritize **facial expression** for mood detection (40% weight)
  - Use text context as secondary (60% weight)
- If NO `image_base64` (camera OFF):
  - Prioritize **text context** for mood detection (100%)
  - Analyze semantic meaning, keywords, intensity

---

### GET /ai/analytics/summary
Get AI wellness summary (cached, 5-min min interval)

**Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| force | Boolean | Bypass cache & regenerate (optional) |

**Response** (200):
```json
{
  "success": true,
  "data": {
    "summary": "**Tuần này bạn có vẻ như:**\n* Nhiều cảm xúc lo lắng\n* Đã có vài ngày mệt mỏi\n\n**Lời khuyên:**\n* Nghỉ ngơi ngắn 10 phút\n* Thực hiện 1 hoạt động nhẹ nhàng",
    "generated_at": "2025-11-11T10:20:00Z",
    "cached": true
  },
  "headers": {
    "X-Cache": "HIT"
  }
}
```

**Caching Logic**:
- Cache last summary per user in Redis (key: `analytics:summary:{userId}`)
- Return cached if `now() - generated_at < 5 minutes` and `?force != true`
- Header `X-Cache: HIT` if cached, `X-Cache: MISS` if fresh

**Response** (429 - Rate limit):
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT",
    "message": "Summary can only be refreshed every 5 minutes. Next refresh available at: 2025-11-11T10:25:00Z"
  }
}
```

---

### POST /ai/schedule-suggestions
Get AI schedule suggestions from user message

**Headers**: `Authorization: Bearer {token}`

**Request**:
```json
{
  "note": "I'm feeling anxious and need to relax"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "title": "Relaxation Exercise",
      "start_time": "19:00",
      "end_time": "19:15",
      "reason": "Deep breathing to reduce anxiety"
    },
    {
      "title": "Gentle Walk",
      "start_time": "19:30",
      "end_time": "19:50",
      "reason": "Physical activity to boost mood"
    }
  ]
}
```

---

## 11. Server-Side Business Logic

### Schedule Conflict Detection & Resolution

**Algorithm**:
```
1. When POST/PUT /schedules:
   a) Query existing schedules for user on same date
   b) Check if new schedule overlaps (overlap = start1 < end2 AND end1 > start2)
   c) If NO conflict → insert and return 201
   d) If conflict AND auto_adjust=true:
      - Find next available 15-min or 30-min slot (configurable)
      - If found same day → insert at adjusted time, return 201 with message
      - If NOT found → either insert next day OR return 409 (configurable)
   e) If conflict AND auto_adjust=false:
      - Return 409 with conflicts list + suggested slot
```

**Implementation Detail**:
- Use transaction (SELECT ... FOR UPDATE) to avoid race conditions
- Time comparison: convert HH:MM to minutes for easier calculation

---

### Analytics Summary Caching

**Redis Pattern**:
```
Key: analytics:summary:{userId}
Value: {
  summary: "text...",
  generated_at: ISO timestamp,
  expires_in: 5 minutes
}

When GET /ai/analytics/summary:
  if (now - generated_at < 5 min) and !force
    → return cached (X-Cache: HIT)
  else
    → regenerate, cache, return (X-Cache: MISS)
```

---

## 12. Frontend Integration Notes

### Replace localStorage with API Calls

**Before** (localStorage):
```typescript
// storageService.ts
export const getEmotionEntries = () => {
  return JSON.parse(localStorage.getItem('emotions') || '[]');
};

export const saveEmotionEntry = (entry) => {
  const entries = getEmotionEntries();
  entries.push(entry);
  localStorage.setItem('emotions', JSON.stringify(entries));
};
```

**After** (API):
```typescript
// apiService.ts
export const getEmotionEntries = async (limit=20, offset=0) => {
  const response = await fetch('/api/v1/emotions?limit=${limit}&offset=${offset}', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

export const saveEmotionEntry = async (entry) => {
  const response = await fetch('/api/v1/emotions', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(entry)
  });
  return response.json();
};
```

**Retry & Error Handling**:
```typescript
// Use exponential backoff: 1s, 2s, 4s
// Timeout: 10s for AI endpoints, 5s for CRUD
// On 401 → refresh token or logout
// On 429 → wait and retry (respect X-RateLimit-Reset)
// On 5xx → show error notification (do NOT retry)
```

---

### Keep in localStorage (Client-side UI State)

```typescript
// Only these → localStorage (NO API)
localStorage.setItem('theme_preference', 'dark'); // light/dark
localStorage.setItem('color_theme', 'green'); // green/blue/purple/orange
localStorage.setItem('language', 'vi'); // i18n
localStorage.setItem('notifications_enabled', 'true'); // UX state only
```

**Why**: These are UI-only, no multi-device sync needed.

---

## 13. Error Codes Reference

| Code | HTTP | Meaning |
|------|------|---------|
| VALIDATION_ERROR | 400 | Invalid request data |
| UNAUTHORIZED | 401 | Missing/invalid JWT |
| FORBIDDEN | 403 | User lacks permission |
| NOT_FOUND | 404 | Resource not found |
| SCHEDULE_CONFLICT | 409 | Time slot conflict |
| DUPLICATE_ENTRY | 409 | Duplicate resource |
| RATE_LIMIT | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

---

## 14. Rate Limiting

**Global**: 1000 requests/hour per user

**AI Endpoints**:
- `POST /ai/analyze-mood`: 1 per 5 seconds
- `GET /ai/analytics/summary`: 1 per 5 minutes (cached)
- `POST /ai/schedule-suggestions`: 1 per 5 seconds

**Headers**:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1731354000
```

---

## 15. Security & Best Practices

1. **JWT Auth**: 24-hour token expiration + refresh token pattern
2. **HTTPS Only**: All API calls must be HTTPS
3. **CORS**: Whitelist frontend domain only
4. **SQL Injection**: Use parameterized queries (no string concatenation)
5. **XSS Protection**: Sanitize all text inputs
6. **Row-Level Security**: Users can only access their own data (enforce in DB or app layer)
7. **Password**: Hash with bcrypt (10+ rounds)
8. **Image Base64**: Validate size (<5MB), reject invalid MIME types

---

## 16. Migration & Deployment Checklist

- [ ] Run SQL migration scripts (create tables + indexes)
- [ ] Set up Redis for caching (analytics summary)
- [ ] Configure JWT secrets (environment variables)
- [ ] Set up email service (optional: password reset, notifications)
- [ ] Deploy backend to server/cloud
- [ ] Test all endpoints with cURL or Postman
- [ ] Update frontend `.env` with API base URL
- [ ] Replace all localStorage calls with API calls (emit to frontend team)
- [ ] Set up monitoring & logging
- [ ] Document API on Swagger/OpenAPI

---

## 17. Example cURL Requests

### Register User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

### Create Emotion Entry
```bash
curl -X POST http://localhost:3000/api/v1/emotions \
  -H "Authorization: Bearer eyJhbGciOi..." \
  -H "Content-Type: application/json" \
  -d '{
    "mood": "Happy",
    "intensity": 7,
    "note": "Great day!"
  }'
```

### Get Today Schedules
```bash
curl -X GET "http://localhost:3000/api/v1/schedules?date=2025-11-12" \
  -H "Authorization: Bearer eyJhbGciOi..."
```

### Create Schedule with Auto-Adjust
```bash
curl -X POST http://localhost:3000/api/v1/schedules \
  -H "Authorization: Bearer eyJhbGciOi..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Meditation",
    "start_time": "07:00",
    "end_time": "07:20",
    "schedule_date": "2025-11-12",
    "auto_adjust": true
  }'
```

### Get Analytics Summary
```bash
curl -X GET http://localhost:3000/api/v1/ai/analytics/summary \
  -H "Authorization: Bearer eyJhbGciOi..."
```

### Force Refresh Analytics (Bypass Cache)
```bash
curl -X GET "http://localhost:3000/api/v1/ai/analytics/summary?force=true" \
  -H "Authorization: Bearer eyJhbGciOi..."
```

---

## 18. Summary: What Changes from localStorage

| Feature | Before (localStorage) | After (API) | Notes |
|---------|----------------------|------------|-------|
| Emotion Entries | ✓ | ✓ | Full API integration (MongoDB) |
| Chat History | ✓ | ✓ | Full API integration, suggested_schedules stored as array |
| Schedule Items | ✓ | ✓ | API + server-side conflict handling (MongoDB) |
| Notifications | ✓ | ✓ | Full API integration (MongoDB) with TTL |
| Analytics Summary | ✓ | ✓ | API + 5-min cache using MongoDB aggregation |
| Theme Preference | ✓ | **✗** (localStorage) | Client-side only |
| Color Theme | ✓ | **✗** (localStorage) | Client-side only |
| User Profile | - | ✓ | New: GET/PUT /users/profile |
| Authentication | - | ✓ | New: JWT tokens |

---

## 19. MongoDB vs PostgreSQL: Key Differences

| Aspect | PostgreSQL | MongoDB |
|--------|------------|---------|
| **ID Field** | UUID | ObjectId |
| **Foreign Keys** | REFERENCES (strict) | Manual reference (ObjectId) |
| **Constraints** | Enforced in schema | Application-level validation |
| **Indexes** | Same syntax | Same syntax (mostly) |
| **Queries** | SQL (JOIN) | Aggregation pipelines |
| **Data Structure** | Tables (rigid schema) | Collections (flexible BSON) |
| **Transactions** | ACID (multi-row) | ACID (4.0+, multi-document) |
| **TTL** | Manual cleanup | Built-in TTL indexes |

---

**Last Updated**: 2025-11-11  
**Status**: MongoDB version ready for backend development
