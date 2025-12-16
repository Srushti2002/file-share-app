# File Share App

A simple full-stack app for uploading files, sharing with specific users, and sharing via authenticated links. Built with Node.js/Express, MongoDB (Atlas), and React (Vite).

Requirements implemented:
- File upload (bulk), local storage with metadata (name, type, size, date)
- Dashboard listing owned files and files shared with me
- Share with specific users (by email)
- Share via link (URL) requiring login; public access blocked
- Authorization enforced: only owner or explicitly shared users can access, even with URL
- File validation: allows PDF, images (PNG/JPEG/GIF), CSV, TXT with size limit

## Monorepo Structure

- backend/ — Express API with MongoDB & local file storage
- frontend/ — React app (Vite) consuming the API

## Quickstart (Local)

Prereqs: Node 18+, npm, MongoDB Atlas connection string

1) Backend

Copy env and install deps:

```bash
cd backend
copy .env.example .env   # Windows PowerShell: Copy-Item .env.example .env
npm install
```

Set `.env` values:

```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=change_me
CLIENT_ORIGIN=http://localhost:5173
MAX_FILE_SIZE_MB=20
```

Run API:

```bash
npm run dev
```

2) Frontend

```bash
cd ../frontend
npm install
npm run dev
```

Open http://localhost:5173

## Usage

1. Register a user and login.
2. Upload files (select multiple). Allowed: PDF, PNG/JPEG/GIF, CSV, TXT (max size from env).
3. Share a file:
   - With users: enter registered user emails (comma separated).
   - Generate link: copy link and share. Recipients must be logged in and explicitly permitted.
4. Download: via dashboard or link (if permitted and logged in).

## Storage

This project now uses local disk storage only for uploads and downloads. Files are stored under `backend/uploads/` and streamed directly from the API when authorized. For production, consider mounting a persistent volume or using a non-AWS cloud storage (e.g., Azure Blob Storage, GCP Cloud Storage) if you need durability across deploys.

## Deployment

### Backend (Render/Railway/Fly.io)
- Create a new Web Service from the `backend` folder.
- Build command: `npm install`
- Start command: `npm start`
- Environment variables: `PORT`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGINS` (comma-separated frontend URLs), `MAX_FILE_SIZE_MB`.
- Persistent storage: local uploads are ephemeral on many hosts; for production use a shared volume or switch to cloud storage (S3, etc.).

### Frontend (Vercel/Netlify)
- Deploy the `frontend` folder as a static site.
- Set environment: `VITE_API_URL` to your backend public URL + `/api` (e.g., `https://your-api.onrender.com/api`).

## API Summary

- POST /api/auth/register — { name, email, password } → sets httpOnly cookie and returns `{ id, name, email, token }`
- POST /api/auth/login — { email, password } → sets httpOnly cookie and returns `{ id, name, email, token }`
- POST /api/auth/logout
- GET  /api/auth/me
- POST /api/files/upload — multipart `files[]` (auth)
- GET  /api/files — lists { myFiles, sharedWithMe } (auth)
- GET  /api/files/:id/download (auth & authorized)
- POST /api/files/:id/share/users — { emails: string[] } (owner only)
- POST /api/files/:id/share/link — returns { token, urlPath } (owner only)
- GET  /api/share/:token/download (auth & authorized)

## Notes

- For production, move file storage to S3 or similar. The code isolates storage in `multer` config for easy swap.
- CORS is configured to allow credentials for the configured `CLIENT_ORIGINS` (supports multiple origins).
- JWT is stored in httpOnly cookie for security.
   - For tools or environments where cross-site cookies are blocked, you can also send `Authorization: Bearer <token>` using the `token` returned by login/register.
