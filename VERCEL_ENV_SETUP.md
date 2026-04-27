# Vercel Environment Variables Setup

## Problem
Google OAuth login shows "Missing required parameter: client_id" error on production (Vercel).

## Solution
You need to add environment variables to Vercel dashboard.

## Steps to Add Environment Variables on Vercel:

### 1. Go to Vercel Dashboard
- Open: https://vercel.com/dashboard
- Select your project: `stock-management-frontend`

### 2. Go to Settings
- Click on "Settings" tab
- Click on "Environment Variables" in the left sidebar

### 3. Add These Variables:

#### Variable 1: VITE_API_BASE_URL
- **Key**: `VITE_API_BASE_URL`
- **Value**: `https://stock-managementa5x.onrender.com/api`
- **Environment**: Select all (Production, Preview, Development)
- Click "Save"

#### Variable 2: VITE_GOOGLE_CLIENT_ID
- **Key**: `VITE_GOOGLE_CLIENT_ID`
- **Value**: `390216460898-ok1m083bgu9p07cvol46sgva434r46k5.apps.googleusercontent.com`
- **Environment**: Select all (Production, Preview, Development)
- Click "Save"

#### Variable 3: VITE_GA_ID
- **Key**: `VITE_GA_ID`
- **Value**: `G-MKJ6X9ELZQ`
- **Environment**: Select all (Production, Preview, Development)
- Click "Save"

### 4. Redeploy
After adding environment variables, you need to redeploy:
- Go to "Deployments" tab
- Click on the latest deployment
- Click "Redeploy" button
- OR: Just push a new commit to trigger automatic deployment

## Important Notes:

1. **VITE_ Prefix**: All environment variables in Vite must start with `VITE_` to be exposed to the client-side code.

2. **Rebuild Required**: Environment variables are embedded during build time, so you must redeploy after adding them.

3. **Security**: Never commit `.env` files to git. They are already in `.gitignore`.

4. **Local Development**: Use `.env` file for local development (already exists).

5. **Production**: Use `.env.production` file or Vercel dashboard for production.

## Verification:

After redeploying, open browser console on your production site and you should see:
```
✅ Google Client ID loaded: 390216460898-ok1m08...
```

If you see:
```
❌ VITE_GOOGLE_CLIENT_ID is not set!
```

Then the environment variable is not properly set on Vercel.

## Alternative: Using .env.production File

I've created a `.env.production` file in the frontend directory. Vite will automatically use this file when building for production. However, Vercel environment variables take precedence over `.env.production` file.

## Troubleshooting:

### Issue: Still showing "client_id missing" error
**Solution**: 
1. Make sure you added the environment variables on Vercel
2. Make sure you redeployed after adding them
3. Clear browser cache and try again
4. Check browser console for the debug log

### Issue: Environment variable not loading
**Solution**:
1. Make sure the variable name starts with `VITE_`
2. Make sure you selected the correct environment (Production)
3. Make sure you redeployed after adding the variable

## Quick Fix Command:

If you want to redeploy from command line:
```bash
cd frontend
vercel --prod
```

This will trigger a new production deployment with the updated environment variables.
