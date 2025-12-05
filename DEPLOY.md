# Deploy to Vercel (Free)

## Quick Deploy via CLI

1. **Login to Vercel:**
   ```bash
   vercel login
   ```
   This will open your browser to authenticate.

2. **Deploy:**
   ```bash
   vercel --yes
   ```
   Follow the prompts. It will ask:
   - Link to existing project? → **No** (first time)
   - Project name? → Press Enter (uses "bicep-buddy")
   - Directory? → Press Enter (uses ".")
   - Override settings? → **No**

3. **Get your URL:**
   After deployment, you'll get a URL like: `https://bicep-buddy-xxxxx.vercel.app`

## Alternative: Deploy via GitHub + Vercel Web

1. **Push to GitHub:**
   ```bash
   # Create a new repo on GitHub, then:
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to https://vercel.com
   - Sign up/login (free)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"
   - Get your live URL!

## Notes

- The app uses localStorage, so data persists per browser
- No environment variables needed for the prototype
- Free tier includes unlimited deployments
- Your friend can access the link immediately



