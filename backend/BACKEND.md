# BACKEND – Manual Tests

This document describes the **actual state of the backend implementation** dictated in the document `PLAN_DE_TRABAJO.md`, also how to manually test the current authentication flow of the backend API using `curl`
and lastly, some utils and commands to actually use the mongo db (_monogosh_ command in MAKEFILE).

## 1. Register a Standard User

Create a new standard user and store the session cookie in `cookies.txt`:

```bash
curl -i \
  -c cookies.txt \
  -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"Secret123"}'
```

Expected response

```json
{
  "error": "",
  "body": {
    "user": {
      "id": "69c14a69d6b5e51e1b02717e",
      "email": "user1@example.com",
      "role": "standard_user"
    }
  },
  "message": "User registered successfully"
}
```

## 2. Check Current Session (`/auth/me`)

Use the cookie stored in cookies.txt to check the authenticated user:

```bash
curl -i \
  -b cookies.txt \
  http://localhost:3000/api/auth/me
```

Expected Response:

```json
{
  "error": "",
  "body": {
    "user": {
      "userId": "69c14a69d6b5e51e1b02717e",
      "role": "standard_user",
      "email": "user1@example.com",
      "iat": 1774275177,
      "exp": 1774361577
    }
  },
  "message": "Authenticated user"
}
```

## 3. Logout

Log out the current user:

```bash
curl -i \
  -b cookies.txt \
  -X POST http://localhost:3000/api/auth/logout
```

Expected Response:

```json
{
  "error": "",
  "body": "",
  "message": "Logout successful"
}
```

Note: After logout, the cookie should be cleared and further calls to **/auth/me** should return `401 Not authenticated`.

If /auth/me still returns a valid user, double‑check that:

- The logout response is actually clearing the cookie,
- You are reusing the correct cookies.txt,
- The client is not holding an old cookie.

## 4. Login with an Existing User

Log in with the user created in the registration step and overwrite `cookies.txt`with the new session:

```bash
curl -i \
  -c cookies.txt \
  -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"Secret123"}'
```

Expected response:

```json
{
  "error": "",
  "body": {
    "user": {
      "id": "69c14a69d6b5e51e1b02717e",
      "email": "user1@example.com",
      "role": "standard_user"
    }
  },
  "message": "Login successful"
}
```

Verify the session again:

```bash
curl -i \
  -b cookies.txt \
  http://localhost:3000/api/auth/me
```

Expected response:

```json
{
  "error": "",
  "body": {
    "user": {
      "userId": "69c14a69d6b5e51e1b02717e",
      "role": "standard_user",
      "email": "user1@example.com",
      "iat": 1774275805,
      "exp": 1774362205
    }
  },
  "message": "Authenticated user"
}
```

## 5. Admin User Management

**TODO**:

- Add an endpoint or a startup script to create an initial super_user (admin) when the application starts, using the environment variables (e.g. SUPER_EMAIL, SUPER_PASS).

- Once that admin user exists, manual tests should include:

### 5.1. Logging in as the admin (`/api/auth/login`).

```bash
curl -i \
  -c admin_cookies.txt \
  -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"SUPER_EMAIL","password":"SUPER_PASS"}'
```

Expected response:

```json
{
  "error": "",
  "body": {
    "user": {
      "id": "SOME_ADMIN_ID",
      "email": "admin@example.com",
      "role": "super_user"
    }
  },
  "message": "Login successful"
}
```

Verify the authenticated admin:

```bash
curl -i \
  -b admin_cookies.txt \
  http://localhost:3000/api/auth/me

```

Expected response (role must be super_user)

```json
{
  "error": "",
  "body": {
    "user": {
      "userId": "69c153d5ead64855d9fa3b81",
      "role": "super_user",
      "email": "admin@example.com",
      "iat": 1774277744,
      "exp": 1774364144
    }
  },
  "message": "Authenticated user"
}
```

### 5.2. Managing users via admin-only endpoints:

#### Create user as Admin (`/users/create`)

```bash
curl -i \
  -b admin_cookies.txt \
  -X POST http://localhost:3000/api/users/create \
  -H "Content-Type: application/json" \
  -d '{"email":"agent@example.com","password":"AgentPass123","role":"standard_user"}'
```

Expeceted response:

```json
{
  "error": "",
  "body": {
    "_id": "69c15c5544dc8c41fbf588b8",
    "email": "agent@example.com",
    "role": "standard_user"
  },
  "message": "User created successfully"
}
```

#### 5.3 Get all users (`/users/all`)

Retrieve a list of all users:

```bash
curl -i \
  -b admin_cookies.txt \
  http://localhost:3000/api/users/all
```

Expected response:

```json
{
  "error": "",
  "body": [
    {
      "_id": "69c15c5544dc8c41fbf588b8",
      "email": "agent@example.com",
      "role": "standard_user"
    }
  ],
  "message": "Users retrieved successfully"
}
```

#### 5.4 Delete a user (`/users/delete/:id`)

Delete a specific user by ID (replace the ID with one from the previous list):

```bash
curl -i \
  -b admin_cookies.txt \
  -X DELETE http://localhost:3000/api/users/delete/69c15c5544dc8c41fbf588b8
```

Expected response:

```json
{
  "error": "",
  "body": {
    "_id": "69c15c5544dc8c41fbf588b8",
    "email": "agent@example.com",
    "role": "standard_user"
  },
  "message": "User deleted successfully"
}
```

## MONGOSH COMMANDS

Useful commands for managing your MongoDB database and the `users` collection from the `mongosh` shell, in line with the backend authentication and user flows:

### 1. Connect to the database

```bash
make mongosh
```

### 2. Show all collections

```mongodb
show collections
```

### 3. List all users

```mongodb
db.users.find().pretty()
```

### 4. Find a user by email

```mongodb
db.users.findOne({ email: "user1@example.com" })
```

### 5. Manually create a user

```mongodb
db.users.insertOne({
  email: "admin@example.com",
  password: "<hashed_password>",
  role: "super_user"
})
```

> **Note:** The `password` field must be hashed as in your backend.

### 6. Update a user's role

```mongodb
db.users.updateOne(
  { email: "user1@example.com" },
  { $set: { role: "super_user" } }
)
```

### 7. Delete a user

```mongodb
db.users.deleteOne({ email: "user1@example.com" })
```

### 8. Delete all users (use with caution!)

```mongodb
db.users.deleteMany({})
```

### 9. Count users

```mongodb
db.users.countDocuments()
```

---


## WebSocket Implementation

### Current Status - What's Implemented

The WebSocket infrastructure is **fully initialized and partially implemented**, with a working real-time foundation and an early-stage chat system.

---

#### ✅ Core Infrastructure

- **Socket.IO Server** - Attached to Express HTTP server, sharing the same port (HTTP + WS)
- **Redis Adapter** - Multi-instance synchronization enabled (ready for horizontal scaling)
- **JWT Authentication Middleware** - Validates auth via cookies / headers before socket connection
- **Base Connection Lifecycle** - Connection, disconnection, and ping/pong fully working

---

#### ✅ Chat System (NEW - Phase 1 UI + Transport Layer)

- **/chat namespace fully active**
- Room-based architecture implemented (join / leave / active room tracking)
- Message transport working end-to-end (frontend → socket → backend → broadcast)
- Messages are currently stored in **frontend state (debug mode)**

##### 💬 Frontend Chat Features Implemented

- Room creation
- Join / leave room
- Active room tracking
- Message sending per room
- Message viewer per room
- User-based message filtering (email / username)
- Auto-scroll message view
- Basic chat debug UI (`SocketDebug`)

⚠️ Important: UI currently expects normalized message shape but backend may send nested objects (see Known Issues below).

---

#### ✅ Type Safety & Validation

- **Socket Types (`src/types/socket.ts`)**
  - Strongly typed event interfaces (room, message, auth, errors)

- **Validation Middleware (`src/utils/socket-validation.ts`)**
  - Schema-based payload validation
  - Automatic rejection of invalid socket events

- **Standardized Errors**
  - `SocketErrorCode` enum
  - Consistent error payload structure across all events

---

#### ✅ Service Layer

- **Socket Service (`src/utils/socket.service.ts`)**
  - Room management abstraction
  - Presence tracking
  - Broadcast utilities

- **Redis Utilities (`src/utils/redis.ts`)**
  - Helpers for sets, presence, room membership

- **Chat Service (`src/modules/chat/chat.service.ts`)**
  - Skeleton implemented (Phase 2 logic pending DB persistence)

---

#### ✅ Namespace Setup

- **/chat namespace initialized**
  - Auth middleware applied
  - Connection lifecycle handled
  - Event handler structure defined but NOT fully implemented

- **Handlers scaffold (`chat.handlers.ts`)**
  - join_room
  - send_message
  - leave_room
  (currently partial / placeholder logic)

---

#### ⚠️ Known Issues / Current Limitations

### 1. Message Shape Inconsistency (Frontend issue)

Messages may arrive in different formats:

```ts
// Case A
user: {
  userId,
  email,
  role
}

// Case B
sender: {
  userId,
  email,
  role
}
````

👉 This caused React rendering errors when objects were rendered directly instead of strings.

✔ Fix required: always normalize before render:

```ts
const sender =
  msg.user?.email ??
  msg.sender?.email ??
  msg.username ??
  'Unknown';
```

---

### 2. No Backend Persistence Yet

* Messages are NOT stored in MongoDB yet
* No `Message` or `Room` collections implemented
* Current system is real-time only (ephemeral)

---

### 3. Global Message State (Frontend)

* All messages are stored in a single array:

```ts
messages: Message[]
```

* Filtering is done client-side:

```ts
messages.filter(m => m.roomId === activeRoomId)
```

👉 This is fine for debug, but not scalable for production.

---

### 4. Room State is not persisted server-side

* Room existence depends on runtime memory / Redis sets
* No database-backed room model yet

---

### 🔴 Core Chat Backend (HIGH PRIORITY)

* [ ] Implement `join_room` handler fully
* [ ] Implement `leave_room` cleanup logic

---

### 🟠 Real-time Enhancements

* [ ] Typing indicators (`typing`, `stop_typing`)
* [ ] Presence per room (online users)
* [ ] Room creation endpoint (server-authoritative)

---

### 🟡 Frontend Improvements

* [ ] Replace global message array with `messagesByRoom`
* [ ] Create `useSocketRoom` hook
* [ ] Chat UI component extraction (out of debug panel)
* [ ] Add message status (sent / delivered / read)

---

### 🟢 Infra / Production Readiness

* [ ] Rate limiting per socket event
* [ ] Logging of all socket events
* [ ] Integration tests for chat flows
* [ ] Redis cleanup on disconnect (robust presence system)

---

## 🧪 Testing Socket Connectivity

Same flow as REST authentication is required before connecting sockets.

### 1. Authenticate first

```bash
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"socket_test@example.com","password":"Test123"}'
```

---

### 2. Verify connection

1. Open: `http://localhost:5173/socket-debug`
2. Ensure status → `connected`
3. Click **Ping**
4. Verify **Pong received**
5. Join room → send message → verify broadcast

---

## 📁 Infrastructure Files Reference

| File                                   | Purpose                                      |
| -------------------------------------- | -------------------------------------------- |
| `src/index.ts`                         | Server bootstrap + Socket.IO + Redis adapter |
| `src/types/socket.ts`                  | Full socket type system                      |
| `src/utils/socket.service.ts`          | Room + presence + broadcast logic            |
| `src/utils/socket-validation.ts`       | Payload validation layer                     |
| `src/utils/redis.ts`                   | Redis helpers                                |
| `src/modules/chat/index.ts`            | Namespace initialization                     |
| `src/modules/chat/chat.handlers.ts`    | Event handlers (partial)                     |
| `src/modules/chat/chat.service.ts`     | Business logic (skeleton)                    |
| `frontend/src/hooks/useSocket.tsx`     | Socket client hook                           |
| `frontend/src/hooks/useChatSocket.tsx` | Chat abstraction layer                       |
| `frontend/src/pages/SocketDebug.tsx`   | Debug + chat playground UI                   |

```
---