# Deployment Guide - Render (Separate Services)

This guide walks you through deploying the backend and frontend separately on Render.

## Prerequisites

1. A [Render account](https://render.com) (free tier available)
2. A MongoDB Atlas cluster (or another MongoDB hosting solution)
3. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

---

## Part 1: Deploy Backend API

### Step 1: Create Backend Web Service

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"Web Service"**
3. Connect your Git repository
4. Configure the service:
   - **Name**: `file-share-backend` (or your choice)
   - **Region**: Oregon (US West) or your preferred region
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 2: Configure Backend Environment Variables

Add these environment variables in the Render dashboard:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | |
| `PORT` | `10000` | Render's default internal port |
| `MONGO_URI` | `mongodb+srv://...` | Your MongoDB connection string |
| `JWT_SECRET` | (auto-generate) | Click "Generate" for a secure value |
| `CLIENT_ORIGINS` | *leave empty for now* | Will add frontend URL after deployment |
| `MAX_FILE_SIZE_MB` | `20` | Maximum upload size in MB |
| `API_BASE_URL` | *leave empty for now* | Will add backend URL after deployment |

### Step 3: Add Persistent Disk (for File Uploads)

1. In your service settings, go to **"Disks"**
2. Click **"Add Disk"**
   - **Name**: `file-uploads`
   - **Mount Path**: `/opt/render/project/src/backend/uploads`
   - **Size**: `1 GB` (free tier)
3. Save changes

### Step 4: Deploy Backend

1. Click **"Create Web Service"**
2. Wait for deployment to complete (~2-3 minutes)
3. Note your backend URL: `https://file-share-backend-XXXX.onrender.com`

### Step 5: Update Backend Environment Variables

Once deployed, update these variables with actual URLs:
- `API_BASE_URL`: `https://file-share-backend-XXXX.onrender.com`
- `CLIENT_ORIGINS`: *will add after frontend deployment*

---

## Part 2: Deploy Frontend Static Site

### Step 1: Create Frontend Static Site

1. In Render Dashboard, click **"New"** → **"Static Site"**
2. Connect the same Git repository
3. Configure the service:
   - **Name**: `file-share-frontend` (or your choice)
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

### Step 2: Configure Frontend Environment Variables

Add this environment variable:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://file-share-backend-XXXX.onrender.com/api` |

Replace `XXXX` with your actual backend service URL from Part 1.

### Step 3: Deploy Frontend

1. Click **"Create Static Site"**
2. Wait for build and deployment (~2-3 minutes)
3. Note your frontend URL: `https://file-share-frontend-XXXX.onrender.com`

---

## Part 3: Final Configuration

### Update Backend CORS Settings

1. Go back to your **backend service** in Render
2. Update the `CLIENT_ORIGINS` environment variable:
   - Value: `https://file-share-frontend-XXXX.onrender.com`
3. Save - backend will automatically redeploy

---

## MongoDB Setup

If you haven't already set up MongoDB:

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user with read/write permissions
3. Configure Network Access:
   - Add IP: `0.0.0.0/0` (allow from anywhere)
   - Or add Render's IP ranges
4. Get connection string:
   - Format: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority`
5. Add to backend `MONGO_URI` environment variable

---

## Testing Your Deployment

1. Visit your frontend URL: `https://file-share-frontend-XXXX.onrender.com`
2. Register a new account
3. Try uploading a file
4. Test file sharing functionality

---

## Important Notes

### Free Tier Limitations

- **Backend**: Spins down after 15 minutes of inactivity (30s cold start on first request)
- **Frontend**: Always available (static site)
- **Storage**: 1GB persistent disk for uploads
- **Bandwidth**: 100GB/month combined

### Monitoring

- **Backend Logs**: Available in backend service dashboard
- **Frontend Logs**: Build logs in static site dashboard
- **Health Check**: Backend has `/api/health` endpoint

### Auto-Deploy

Both services will automatically redeploy when you push to your Git repository:
- Backend: On changes to `backend/` directory
- Frontend: On changes to `frontend/` directory

### Custom Domains (Optional)

You can add custom domains to both services:
1. Go to service **Settings** → **Custom Domain**
2. Add your domain and configure DNS
3. Render provides free SSL certificates

---

## Troubleshooting

### Backend Issues

**Service won't start:**
- Check logs for errors
- Verify `MONGO_URI` connection string
- Ensure all required environment variables are set

**Database connection failed:**
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check database user credentials
- Ensure database name is in connection string

### Frontend Issues

**Blank page or errors:**
- Check browser console for errors
- Verify `VITE_API_URL` is correct (must include `/api`)
- Ensure backend is running

**CORS errors:**
- Verify backend `CLIENT_ORIGINS` includes frontend URL
- Check for typos in URLs
- Ensure no trailing slashes

**API calls failing:**
- Backend may be spinning up (wait 30 seconds)
- Check backend logs
- Verify backend health: `https://your-backend.onrender.com/api/health`

### File Upload Issues

- Check disk storage usage in backend service
- Verify `MAX_FILE_SIZE_MB` setting
- Review backend logs for specific errors

---

## Updating Your Application

### Backend Updates
1. Push changes to `backend/` directory
2. Render automatically detects and redeploys
3. Monitor deployment in dashboard

### Frontend Updates
1. Push changes to `frontend/` directory
2. Render rebuilds and redeploys
3. Changes live immediately after build

### Manual Deploy
Can manually trigger from service dashboard: **"Manual Deploy"** → **"Deploy latest commit"**

---

## Environment Variables Summary

### Backend
```
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=<auto-generated>
CLIENT_ORIGINS=https://file-share-frontend-XXXX.onrender.com
MAX_FILE_SIZE_MB=20
API_BASE_URL=https://file-share-backend-XXXX.onrender.com
```

### Frontend
```
VITE_API_URL=https://file-share-backend-XXXX.onrender.com/api
```

---

## Next Steps

- Consider upgrading to paid plans for better performance
- Set up monitoring and alerts
- Configure custom domains
- Implement backups for uploaded files
- Add CDN for better global performance

## Resources

- [Render Documentation](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/deploy-node-express-app)
- [Static Sites on Render](https://render.com/docs/static-sites)
- [Render Community](https://community.render.com)
