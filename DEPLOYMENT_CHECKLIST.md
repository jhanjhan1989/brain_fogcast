# Deployment Checklist

## Before You Deploy

- [ ] Push your code to GitHub
- [ ] Create accounts on Vercel and Railway
- [ ] Have your ArcGIS credentials ready

---

## Backend Deployment (Railway)

- [ ] Create new Railway project from GitHub
- [ ] Set root directory to `backend`
- [ ] Add environment variables:
  - [ ] `ULAP_NGA_SERVER`
  - [ ] `ULAP_HAZARD_SERVER`
  - [ ] `ARCGIS_USER`
  - [ ] `ARCGIS_PASSWORD`
- [ ] Add PostgreSQL database (if needed)
- [ ] Wait for deployment to complete
- [ ] Copy the Railway backend URL (e.g., `https://xxx.railway.app`)
- [ ] Test backend: Visit `https://your-backend.railway.app/docs`

---

## Frontend Deployment (Vercel)

- [ ] Create new Vercel project from GitHub
- [ ] Set root directory to `frontend`
- [ ] Set framework preset to `Vite`
- [ ] Add environment variable:
  - [ ] `VITE_API_URL` = Your Railway backend URL
- [ ] Deploy
- [ ] Copy the Vercel frontend URL (e.g., `https://xxx.vercel.app`)
- [ ] Test frontend: Visit your Vercel URL

---

## Post-Deployment

- [ ] Update CORS in `backend/app/main.py`:
  ```python
  allow_origins=[
      "http://localhost:3000",
      "https://your-app.vercel.app",  # Your actual Vercel URL
  ]
  ```
- [ ] Commit and push CORS changes
- [ ] Railway will auto-redeploy
- [ ] Test the full application
- [ ] Check browser console for any errors

---

## Optional Enhancements

- [ ] Add custom domain to Vercel
- [ ] Add custom domain to Railway
- [ ] Set up monitoring/logging
- [ ] Configure database backups
- [ ] Add CI/CD workflows

---

## Troubleshooting

If something doesn't work:

1. Check Railway logs for backend errors
2. Check Vercel deployment logs for frontend errors
3. Open browser DevTools → Console for client-side errors
4. Verify all environment variables are set correctly
5. Ensure CORS origins match your Vercel URL exactly

---

## Quick Links

- Railway Dashboard: https://railway.app/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
