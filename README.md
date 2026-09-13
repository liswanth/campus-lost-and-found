# 🎓 Campus Lost & Found

A full-stack campus lost-and-found platform built with **React, Node.js, Express and MongoDB**.

The project includes authentication, image uploads, fuzzy Lost ↔ Found matching, ownership protection, validation, security hardening, automated tests, CI and a production-oriented Docker setup.

## ✨ Features

- User registration and login
- JWT authentication with short-lived access tokens
- Report lost items
- Report found items
- Cloudinary image uploads
- Search and category filters
- Fuzzy Lost ↔ Found matching
  - Levenshtein similarity
  - Token similarity
  - Name 40%
  - Category 20%
  - Location 15%
  - Description 15%
  - Date 10%
  - Match breakdown returned by the API
- My Reports dashboard
- Edit and delete your own reports
- Mark a lost item as found
- Server-side validation with Zod
- Helmet security headers
- Authentication rate limiting
- Restricted CORS
- Mongo-style input sanitization
- Server-side image validation and 5 MB limit
- Centralized API error handling
- API versioning with `/api/v1`
- Jest + Supertest tests
- GitHub Actions CI
- Production-oriented Dockerfile

## 🏗️ Structure

```text
Campus-Lost-And-Found/
├── client/
│   └── src/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
│   ├── __tests__/
│   ├── Dockerfile
│   └── server.js
├── .github/workflows/ci.yml
├── ARCHITECTURE.md
├── UPGRADE_NOTES.md
└── README.md
```

## 🚀 Local setup

### 1. Backend

```powershell
cd server
npm install
```

Create `server/.env` using `.env.example`.

```text
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=YOUR_MONGODB_URI
JWT_SECRET=YOUR_RANDOM_SECRET_AT_LEAST_32_CHARACTERS
CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
```

Never commit `.env`.

Start:

```powershell
npm start
```

### 2. Frontend

Open another PowerShell:

```powershell
cd client
npm install
npm run dev
```

Optional `client/.env`:

```text
VITE_API_URL=http://localhost:5000/api/v1
```

## 🧪 Tests

From `server`:

```powershell
npm test
```

This runs Jest with coverage.

## 🐳 Docker

From `server`:

```powershell
docker build -t campus-lost-found-api .
docker run --env-file .env -p 5000:5000 campus-lost-found-api
```

## 🔗 API

The application API is versioned:

```text
/api/v1/auth/register
/api/v1/auth/login
/api/v1/lost-items
/api/v1/found-items
/api/v1/my-reports
/api/v1/lost-items/:id/matches
```

Health check:

```text
GET /api/health
```

## 🔐 Security notes

- Keep MongoDB and Cloudinary secrets only in `.env`.
- Use a strong random `JWT_SECRET` of at least 32 characters.
- CORS only permits the configured frontend origin.
- Authentication endpoints are rate limited.
- Request bodies are validated before database writes.
- Uploaded images are limited to 5 MB and checked server-side.
- User-owned operations always verify the authenticated user's id.

## 📚 Documentation

See:

- `ARCHITECTURE.md`
- `UPGRADE_NOTES.md`
