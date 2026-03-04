# Deployment Guide: Vercel + Railway

## Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- Railway account (sign up at railway.app)
- Push your code to a GitHub repository

---

## Part 1: Deploy Backend to Railway

### Step 1: Create Railway Project
1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select the `backend` folder as the root directory

### Step 2: Configure Environment Variables
In Railway dashboard, add these environment variables:
```
ULAP_NGA_SERVER=https://ulap-nga.georisk.gov.ph/arcgis
ULAP_HAZARD_SERVER=https://ulap-hazards.georisk.gov.ph/arcgis
ARCGIS_USER=mayonv
ARCGIS_PASSWORD=taal*2025
```

### Step 3: Add PostgreSQL Database (if needed)
1. In your Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create a `DATABASE_URL` variable
4. Your backend will have access to this variable

### Step 4: Get Your Backend URL
- After deployment, Railway will provide a URL like: `https://your-app.railway.app`
- Copy this URL for the frontend configuration

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Project
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect it's a Vite project

### Step 2: Configure Build Settings
- Framework Preset: `Vite`
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

### Step 3: Add Environment Variable
In Vercel project settings → Environment Variables, add:
```
VITE_API_URL=https://your-backend-url.railway.app
```
Replace with your actual Railway backend URL from Part 1, Step 4.

### Step 4: Deploy
- Click "Deploy"
- Vercel will build and deploy your frontend
- You'll get a URL like: `https://your-app.vercel.app`

---

## Part 3: Update CORS Settings

After deployment, update your backend CORS settings to allow requests from your Vercel domain.

In `backend/app/main.py`, update the CORS origins:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-app.vercel.app",  # Add your Vercel URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Then redeploy the backend on Railway (it will auto-deploy on git push).

---

## Part 4: Custom Domain (Optional)

### For Vercel (Frontend):
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### For Railway (Backend):
1. Go to Project Settings → Domains
2. Add a custom domain for your API
3. Update the `VITE_API_URL` in Vercel to use your custom API domain

---

## Troubleshooting

### Backend Issues:
- Check Railway logs: Project → Deployments → View Logs
- Verify all environment variables are set
- Ensure `requirements.txt` includes all dependencies

### Frontend Issues:
- Check Vercel deployment logs
- Verify `VITE_API_URL` is set correctly
- Test API connection in browser console

### CORS Errors:
- Ensure Vercel URL is added to backend CORS origins
- Redeploy backend after CORS changes

---

## Cost Estimates

### Railway (Backend):
- Free tier: $5 credit/month (limited resources)
- Hobby plan: $5/month + usage
- PostgreSQL: Included in usage

### Vercel (Frontend):
- Free tier: Unlimited personal projects
- Bandwidth: 100GB/month
- Build time: 6000 minutes/month

---

## Quick Commands

### Update Frontend:
```bash
git add .
git commit -m "Update frontend"
git push
```
Vercel auto-deploys on push to main branch.

### Update Backend:
```bash
git add .
git commit -m "Update backend"
git push
```
Railway auto-deploys on push to main branch.

---

## Next Steps

1. Push your code to GitHub
2. Follow Part 1 to deploy backend
3. Follow Part 2 to deploy frontend
4. Update CORS settings (Part 3)
5. Test your live application!

Need help? Check the logs in Railway and Vercel dashboards.
