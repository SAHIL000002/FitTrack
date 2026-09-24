# FIT TRACK — Backend

Express + MongoDB/Mongoose backend for the FIT TRACK gym management platform.

## Structure

```
backend/
├── src/
│   ├── config/       # DB connection and app config
│   ├── controllers/  # Request handlers (future)
│   ├── middleware/   # CORS, error handling, auth (future)
│   ├── models/       # Mongoose models (future)
│   ├── routes/       # API route definitions
│   ├── services/     # Business logic (future)
│   ├── utils/        # Helpers (future)
│   ├── app.js        # Express app (middleware + routing)
│   └── server.js     # Server startup
├── .env.example
└── package.json
```

## Setup

```bash
cd backend
cp .env.example .env   # then fill in real values
npm install
```

## MongoDB requirement

MongoDB (local or Atlas) is optional to *start* the API — `/api/health` works
even without it. The connection is used by the database-driven features added
in later phases.

### Configure MONGO_URI

The database name is `fit_track` and lives inside the connection string.

```env
# Local MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/fit_track

# MongoDB Atlas
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/fit_track
```

Never commit a real `.env` or share credentials.

## Run

```bash
npm run dev    # nodemon
npm start      # production
```

## Health check

```
GET http://localhost:5000/api/health
```

Response includes a non-sensitive database status:

```json
{
  "success": true,
  "message": "FIT TRACK API is running",
  "environment": "development",
  "database": "connected" | "not_configured" | "error"
}
```

### Behavior when MONGO_URI is missing

- The server starts normally.
- The log prints `MONGO_URI not set - skipping MongoDB connection.`
- `/api/health` reports `"database": "not_configured"`.

### Behavior when MONGO_URI is invalid

- The server starts normally.
- The log reports a clear connection error (credentials/URI are redacted).
- `/api/health` reports `"database": "error"` — it never falsely claims connected.

## API

### Base path

All endpoints live under `/api`.

```
GET /api                     → API root
GET /api/health              → health + database status
```

### Response format

Success (single resource):

```json
{ "success": true, "message": "Operation successful", "data": {} }
```

List (with pagination meta):

```json
{
  "success": true,
  "message": "Records fetched successfully",
  "data": [],
  "meta": { "page": 1, "limit": 10, "total": 0, "pages": 0 }
}
```

Error:

```json
{ "success": false, "message": "Something went wrong" }
```

Pagination is controlled with `?page=&limit=` (default page 1, limit 10, max limit 100).

### Route architecture

```
src/routes/
├── index.js               # /api root + mounts
├── programRoutes.js       # GET /api/programs, GET /api/programs/:id
├── equipmentRoutes.js     # GET /api/equipment, GET /api/equipment/:id
├── trainerRoutes.js       # GET /api/trainers, GET /api/trainers/:id
└── membershipPlanRoutes.js# GET /api/membership-plans, GET /api/membership-plans/:id
```

Controllers (HTTP concerns), services (business logic, later), models (schemas),
middleware (cross-cutting), utils (reusable helpers) each live in their own folder.

### Error handling

- Unknown routes → `404 { success: false, message: "API route not found" }`
- Invalid MongoDB ObjectId → `400 { success: false, message: "Invalid resource ID" }`
- Mongoose validation → `400`, invalid cast → `400`, duplicate key → `409`
- Missing/unknown API routes never serve HTML — JSON only.

### Authentication status

**Implemented (Phase 3 Step 5) — foundation only.**

```
POST /api/auth/register   — public; ALWAYS creates a MEMBER
POST /api/auth/login      — public
GET  /api/auth/me         — protected (Bearer token)
```

Key behaviors:

- **Public registration creates members only.** Any `role` sent by the client is
  ignored — OWNER accounts can never be created through public registration.
- **Passwords** are hashed with bcrypt (salt factor 10) via a Mongoose pre-save
  hook, stored with `select: false`, and never returned by any endpoint.
- **JWT** payload contains only `{ id, role }`. Expiration is configured with
  `JWT_EXPIRES_IN` (default 7d). The secret comes from `JWT_SECRET` — if it is
  missing, auth endpoints fail safely with a clear server configuration error.
- **Protected routes** use the `protect` middleware
  (`Authorization: Bearer <token>`); deleted and deactivated users are rejected.
- **Role foundation**: `requireRole('OWNER', ...)` middleware exists for future
  role-based routes. No owner/member APIs are implemented yet.
- **Login failures** (wrong password, unknown email, inactive account) all
  return the same generic message — they never reveal which one failed.
- Not yet implemented: refresh tokens, email verification, password reset,
  OTP, rate limiting, frontend auth UI.

### Authorization (Phase 3 Step 6)

**Authentication** = *who are you?* (`protect` middleware — verifies the JWT and
loads the user). **Authorization** = *what are you allowed to do?*
(`requireRole` middleware — checks the server-side role).

Current roles: `OWNER`, `MEMBER` (from the User model enum — no other roles exist).

```
Owner-only routes:  router.get('/x', protect, requireRole('OWNER'), handler)
Member-only routes: router.get('/x', protect, requireRole('MEMBER'), handler)
Mixed routes:       router.get('/x', protect, requireRole('OWNER', 'MEMBER'), handler)
```

Middleware order matters: `protect` FIRST, then `requireRole` — authorization
depends on authentication. `requireRole` never authenticates by itself.

Access rules:

| User     | Public | Authenticated | Owner route | Member route |
| -------- | ------ | ------------- | ----------- | ------------ |
| No token | YES    | NO            | NO          | NO           |
| Member   | YES    | YES           | 403         | YES          |
| Owner    | YES    | YES           | YES         | 403          |

- `401` = unauthenticated (no/invalid/expired token, deleted or **inactive**
  account — an old token never keeps a deactivated account alive)
- `403` = authenticated but forbidden
- Authorization always comes from the **server-side user record** — roles sent
  by the client (body/query/params/headers) are never trusted.

Temporary verification endpoints (will be removed once real role-protected
feature routes exist): `GET /api/auth/test-owner`, `GET /api/auth/test-member`.

Not yet implemented: role-protected business APIs (memberships, payments,
attendance, trainers, reports, etc.) — they belong to later feature steps.

## Environment variables

| Name          | Default                    | Purpose                        |
| ------------- | -------------------------- | ------------------------------ |
| PORT          | 5000                       | Server port                    |
| NODE_ENV      | development                | Runtime environment            |
| JWT_SECRET    | (empty, required for auth) | JWT signing secret             |
| JWT_EXPIRES_IN| 7d                         | Token lifetime                 |
| MONGO_URI     | (empty)                    | MongoDB connection             |
| CLIENT_URL    | http://localhost:5173      | Allowed CORS origin(s)         |