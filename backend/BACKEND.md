# BACKEND – Manual Tests

This document describes how to manually test the current authentication flow of the backend API using `curl`.

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

## 2.   Check Current Session (`/auth/me`)

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

## 3.   Logout

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

## 4.   Login with an Existing User

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

### 5.1.  Logging in as the admin (`/api/auth/login`).

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
  "error":"",
  "body":
  {
    "user":
    {
      "userId":"69c153d5ead64855d9fa3b81",
      "role":"super_user",
      "email":"admin@example.com",
      "iat":1774277744,
      "exp":1774364144
      }
  },
  "message":"Authenticated user"
}

```

### 5.2.  Managing users via admin-only endpoints:

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
  "error":"",
  "body":
  {
    "_id":"69c15c5544dc8c41fbf588b8",
    "email":"agent@example.com",
    "role":"standard_user"
  },
  "message":"User created successfully"
}

```

#### 5.3  Get all users (`/users/all`)

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

#### 5.4  Delete a user (`/users/delete/:id`)

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
