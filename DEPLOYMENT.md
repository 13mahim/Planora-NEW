# Vercel Deployment Guide

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- GitHub repository pushed
- PostgreSQL database (Neon/Supabase/Railway)

---

## Backend Deployment

### Step 1: Create New Project
1. Go to https://vercel.com/new
2. Import your GitHub repository `Planora-NEW`
3. Configure project:
   - **Project Name:** `planora-backend`
   - **Root Directory:** `backend`
   - **Framework Preset:** Other

### Step 2: Build Settings
```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Step 3: Environment Variables
Add these in Vercel dashboard:

```env
DATABASE_URL=postgresql://neondb_owner:npg_FcvMWGD2a1yx@ep-holy-lab-am2pwkbo-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=planora-super-secret-jwt-key-min-32-characters
JWT_REFRESH_SECRET=planora-refresh-secret-key-min-32-chars
STRIPE_SECRET_KEY=sk_test_51TGzpd9x843jbgp6NQHAQ2YZF1VQjkbseY3VWaxQpgLDINs1uXNwbSVEtHbxC9w2Hl26AOlt2pPT2QFSlVST6Z2d00TTQLmNIW
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
CLIENT_URL=https://your-frontend.vercel.app
NODE_ENV=production
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_LIVE=false
```

### Step 4: Deploy
Click **Deploy** button

After deployment, copy your backend URL (e.g., `https://planora-backend.vercel.app`)

---

## Frontend Deployment

### Step 1: Create New Project
1. Go to https://vercel.com/new
2. Import same GitHub repository `Planora-NEW`
3. Configure project:
   - **Project Name:** `planora-frontend`
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite

### Step 2: Build Settings
```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Step 3: Environment Variables
Add these in Vercel dashboard:

```env
VITE_API_URL=https://planora-backend.vercel.app/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Step 4: Deploy
Click **Deploy** button

---

## Post-Deployment

### Update Backend CLIENT_URL
1. Go to backend project settings in Vercel
2. Update `CLIENT_URL` environment variable with your frontend URL
3. Redeploy backend

### Update Frontend API URL
1. Go to frontend project settings in Vercel
2. Update `VITE_API_URL` with your backend URL
3. Redeploy frontend

### Run Database Migrations
```bash
# Connect to your production database
DATABASE_URL="your_production_db_url" npx prisma migrate deploy
```

---

## Troubleshooting

### Backend Issues
- Check Vercel logs for errors
- Verify all environment variables are set
- Ensure DATABASE_URL is correct
- Check CORS settings match frontend URL

### Frontend Issues
- Verify VITE_API_URL points to correct backend
- Check browser console for API errors
- Ensure Firebase config is correct

### Database Issues
- Run migrations: `npx prisma migrate deploy`
- Generate Prisma client: `npx prisma generate`
- Check database connection string

---

## Useful Commands

```bash
# View backend logs
vercel logs <deployment-url>

# Redeploy
vercel --prod

# Check environment variables
vercel env ls
```

---

## Alternative: Deploy Both in One Project

If you want to deploy both in a single Vercel project:

1. Create `vercel.json` in root:
```json
{
  "builds": [
    { "src": "backend/src/index.ts", "use": "@vercel/node" },
    { "src": "frontend/package.json", "use": "@vercel/static-build" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "backend/src/index.ts" },
    { "src": "/(.*)", "dest": "frontend/dist/$1" }
  ]
}
```

2. Update `frontend/package.json`:
```json
{
  "scripts": {
    "vercel-build": "npm run build"
  }
}
```

This approach serves both from one domain but is more complex to configure.
