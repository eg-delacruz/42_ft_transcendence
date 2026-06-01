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

## WebSocket Implementation (Phase 1 - Infrastructure)

### Current Status - What's Implemented

The WebSocket infrastructure is **fully initialized and tested** with the following components:

#### ✅ Core Infrastructure
- **Socket.IO Server** - Attached to Express HTTP server, allows HTTP and WebSocket on same port
- **Redis Adapter** - Multi-instance synchronization enabled (configured for horizontal scaling)
- **JWT Authentication Middleware** - Validates tokens from cookies, headers, or auth object before socket connection
- **Base Connection Handlers** - Connection, disconnection, and ping/pong test events working

#### ✅ Type Safety & Validation
- **Socket Types** (`src/types/socket.ts`) - All event interfaces, payloads, responses, and error types defined
- **Event Validation Middleware** (`src/utils/socket-validation.ts`) - Schema-based payload validation with automatic error handling
- **Error Standardization** - `SocketErrorCode` enum with structured error responses

#### ✅ Service Layer
- **Socket Service** (`src/utils/socket.service.ts`) - Abstracted business logic for presence tracking, room management, and broadcasting
- **Redis Utilities** (`src/utils/redis.ts`) - Helper functions for all Redis operations (presence, rooms, sets, etc.)
- **Chat Service Foundation** (`src/modules/chat/chat.service.ts`) - Skeleton ready for Phase 2 implementation

#### ✅ Namespace Setup
- **/chat Namespace** (`src/modules/chat/index.ts`) - Authentication middleware and connection handlers initialized
- **Chat Handlers Structure** (`src/modules/chat/chat.handlers.ts`) - Event handlers skeleton for join_room, send_message, leave_room

#### ✅ Frontend
- **useSocket Hook** (`frontend/src/hooks/useSocket.tsx`) - Custom React hook for Socket.IO client with reconnection logic
- **SocketDebug Page** (`frontend/src/pages/SocketDebug.tsx`) - Testing panel for verifying WebSocket connectivity
- **Authentication Integration** - HttpOnly cookie support, automatic reconnection, status tracking

#### ✅ Testing & Documentation
- TypeScript compilation successful (all type errors resolved)
- End-to-end connectivity tested (login → connect → ping → pong)
- Reconnection logic verified working

### TODO - Phase 2 Implementation

**High Priority (Core Chat Functionality):**
- [ ] Implement `join_room` handler - validate room, add user to Redis, notify others
- [ ] Implement `send_message` handler - validate membership, save to DB, broadcast to room
- [ ] Implement `leave_room` handler - remove from Redis, notify others, cleanup empty rooms
- [ ] Create MongoDB models for: `Room`, `Message`, `Membership`
- [ ] Implement `ChatService` methods in `src/modules/chat/chat.service.ts`
- [ ] Add presence cleanup on disconnect in `/chat` namespace

**Medium Priority (Features & Enhancement):**
- [ ] Implement optional `typing` / `stop_typing` handlers for real-time feedback
- [ ] Create `useSocketRoom` hook for frontend room management
- [ ] Build Chat UI component with message list, input, user presence
- [ ] Add message pagination (load history on scroll)
- [ ] Implement room creation/deletion endpoints

**Low Priority (Polish & Optimization):**
- [ ] Add rate limiting for message events
- [ ] Implement read receipts / message status
- [ ] Add typing indicator visual feedback
- [ ] Setup logging for all Socket.IO events in production
- [ ] Create integration tests for WebSocket flows

### Testing Socket Connectivity

**Login first** (required for WebSocket auth):
```bash
# Register/Login via REST API
curl -c cookies.txt -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"socket_test@example.com","password":"Test123"}'
```

**Test WebSocket Connection:**
1. Navigate to `http://localhost:5173/socket-debug` (after login)
2. Verify "Socket status" changes to "connected" (green)
3. Click "Send Ping" button
4. Confirm "Pong received at" message appears
5. Try disconnecting/reconnecting backend to verify auto-reconnection

### 6.4. Infrastructure Files Reference

| File | Purpose |
|------|---------|
| `src/index.ts` | Main server bootstrap, Socket.IO init, Redis adapter setup |
| `src/types/socket.ts` | All TypeScript interfaces for events and responses |
| `src/utils/socket.service.ts` | Business logic for presence, rooms, broadcasting |
| `src/utils/socket-validation.ts` | Schema validation for event payloads |
| `src/utils/redis.ts` | Redis operation helpers with error handling |
| `src/modules/chat/index.ts` | /chat namespace initialization and middleware |
| `src/modules/chat/chat.handlers.ts` | Event handler structure (ready to implement) |
| `src/modules/chat/chat.service.ts` | Chat service stubs (ready to implement) |
| `frontend/src/hooks/useSocket.tsx` | Socket.IO client hook with reconnection |
| `frontend/src/pages/SocketDebug.tsx` | Testing panel for connectivity verification |
