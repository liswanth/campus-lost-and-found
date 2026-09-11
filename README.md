# Campus Lost & Found

A full-stack campus lost-and-found application built with React, Node.js, Express and MongoDB.

## Features

- User registration and login
- JWT authentication
- Report lost items
- Report found items
- Optional item image upload using Cloudinary
- Search and category filters
- Automatic possible-match scoring between lost and found items
- My Reports dashboard
- Edit and delete your own reports
- Mark a lost item as found
- Protected API routes
- Jest + Supertest API security tests

## Project structure

```text
Campus-Lost-And-Found/
├── client/
│   └── src/
└── server/
    ├── middleware/
    ├── models/
    ├── utils/
    ├── __tests__/
    └── server.js
```

## Server setup

Open PowerShell:

```powershell
cd server
npm install
```

Create `server/.env` using the values in `.env.example`.

Example:

```text
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=YOUR_MONGODB_URI
JWT_SECRET=YOUR_SECRET
CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
```

Never upload `.env` to GitHub.

Start the backend:

```powershell
npm start
```

The backend should run at:

```text
http://localhost:5000
```

## Client setup

Open another PowerShell:

```powershell
cd client
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally:

```text
http://localhost:5173
```

## Tests

From the `server` folder:

```powershell
npm test
```

The tests verify the API health route and authentication protection on important endpoints.
