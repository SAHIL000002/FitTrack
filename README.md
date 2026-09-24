# FIT TRACK

A MERN-based gym management and fitness platform.

## Project Overview

FIT TRACK is a complete gym management and fitness platform. This repository contains the initial MERN foundation only. No business features have been implemented yet.

Existing Stitch-generated design reference is preserved under `stitch_apex_fitness_mern_platform/` and has not been modified.

## Technology Stack

- Frontend: React + Vite + JavaScript + react-router-dom + axios
- Backend: Node.js + Express + Mongoose + cors + dotenv
- Database: MongoDB (connection-ready, no models yet)
- Dev tools: nodemon, Vite, ESLint

## Folder Structure

```text
FIT-TRACK/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/ (axios api.js)
│   │   ├── utils/
│   │   ├── context/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── stitch_apex_fitness_mern_platform/ (preserved design reference)
├── .gitignore
└── README.md
```

## Environment Variables

Frontend (`frontend/.env.example`):

```text
VITE_API_URL=http://localhost:5000/api
```

Backend (`backend/.env.example`):

```text
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Copy each `.env.example` to `.env` for local development. Never commit real secrets.

## Frontend Setup

```bash
cd frontend
npm install
```

## Backend Setup

```bash
cd backend
npm install
```

## How to Run Frontend

```bash
cd frontend
npm run dev
```

Runs on Vite default port (usually http://localhost:5173).

Other scripts:

```bash
npm run build
npm run preview
```

## How to Run Backend

Development:

```bash
cd backend
npm run dev
```

Production:

```bash
cd backend
npm start
```

Health check:

```text
GET http://localhost:5000/api/health
```
