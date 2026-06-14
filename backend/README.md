# Documentacion del Backend

Este documento recopila el estado actual del backend y las pruebas manuales disponibles. Usalo para documentar flujos de autenticacion, endpoints administrativos y utilidades relacionadas con MongoDB.
Para ver las tareas del proyecto, ir a:

`https://github.com/users/eg-delacruz/projects/2/views/1`

## Tabla de Contenidos

- [Documentacion Swagger](#swagger-api-docs)
- [Login como admin](#login-como-admin)
- [Comandos de mongosh](#mongosh-commands)

---

## Swagger API Docs

The API is documented with Swagger/OpenAPI. While the backend is running in development mode, you can access the interactive UI at:

```
http://localhost:3000/api-docs
```

From the UI you can:

- Browse all endpoints with their HTTP methods, parameters, and responses.
- Use the **Authorize** button to authenticate with the `access_token` cookie.
- Test any endpoint with **Try it out** — no curl needed.

> **Note:** `/api-docs` is only available when `NODE_ENV` is not `production`. The route is not served in production.

## Login como admin

To login as a "super_admin" role, use the credentials in the .env file:
SUPER_EMAIL, SUPER_PASS
The super admin user is seeded every time the backend mounts.

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
