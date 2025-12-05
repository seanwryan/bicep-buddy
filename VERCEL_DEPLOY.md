# Deploy to Vercel from GitHub

## Quick Steps:

1. **Go to Vercel:**
   - Visit https://vercel.com
   - Sign up or log in (you can use your GitHub account)

2. **Import Your Project:**
   - Click "Add New Project" or "Import Project"
   - You'll see a list of your GitHub repositories
   - Find your repo (e.g., "bicep-buddy" or whatever you named it)
   - Click "Import"

3. **Configure Project:**
   - **Framework Preset:** Should auto-detect "Next.js" ✅
   - **Root Directory:** Leave as `./` (default)
   - **Build Command:** Should be `next build` (auto-filled)
   - **Output Directory:** Leave as `.next` (auto-filled)
   - **Install Command:** Should be `npm install` (auto-filled)

4. **Environment Variables:**
   - For this prototype, you don't need any environment variables
   - (The app uses localStorage, no API keys needed for the demo)

5. **Deploy:**
   - Click "Deploy"
   - Wait 1-2 minutes for the build to complete
   - You'll get a live URL like: `https://your-repo-name.vercel.app`

6. **Share the Link:**
   - Copy the URL and share it with your friend!
   - Every time you push to GitHub, Vercel will auto-deploy

## That's it! 🎉

Your app is now live and accessible to anyone with the link.



