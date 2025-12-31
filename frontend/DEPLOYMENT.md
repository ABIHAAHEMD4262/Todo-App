# Deploying Taskly Frontend to Vercel

## Prerequisites
- GitHub repository: https://github.com/ABIHAAHEMD4262/Todo-App
- Vercel account (sign up at https://vercel.com)
- Backend deployed at: https://huggingface.co/spaces/AbihaCodes/TodoApp

## Deployment Steps

### 1. Import Project to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub account and import: `ABIHAAHEMD4262/Todo-App`
4. Vercel will auto-detect Next.js framework

### 2. Configure Project

**Root Directory**: Set to `frontend`
- Click "Edit" next to Root Directory
- Enter: `frontend`
- Click "Continue"

### 3. Set Environment Variables

Click "Environment Variables" and add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://huggingface.co/spaces/AbihaCodes/TodoApp` |
| `DATABASE_URL` | Your Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Your Better Auth secret (same as backend) |
| `BETTER_AUTH_URL` | Your Vercel deployment URL (will be `https://your-app.vercel.app`) |

**Important**:
- For `BETTER_AUTH_URL`, you can set it after first deployment and redeploy
- Or use the preview URL from Vercel

### 4. Deploy

1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Vercel will provide your deployment URL: `https://your-app.vercel.app`

### 5. Update Backend CORS

After deployment, update your backend environment variables on HuggingFace Spaces:

1. Go to: https://huggingface.co/spaces/AbihaCodes/TodoApp/settings
2. Add environment variable:
   - Name: `FRONTEND_URL`
   - Value: `https://your-app.vercel.app` (your Vercel URL)
3. Restart the Space

### 6. Update Frontend Environment

1. Go to Vercel Project Settings → Environment Variables
2. Update `BETTER_AUTH_URL` to your Vercel URL
3. Redeploy to apply changes

## Vercel CLI Deployment (Alternative)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow prompts to configure project
```

## Post-Deployment Checklist

- [ ] Frontend accessible at Vercel URL
- [ ] Backend accessible at HuggingFace URL
- [ ] User can sign up and login
- [ ] Tasks CRUD operations work
- [ ] Dashboard displays statistics
- [ ] No CORS errors in browser console

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` is set correctly in backend environment
- Check backend CORS middleware includes your Vercel domain

### Authentication Not Working
- Verify `BETTER_AUTH_SECRET` matches between frontend and backend
- Check `BETTER_AUTH_URL` is set to your Vercel URL
- Ensure `DATABASE_URL` is accessible from Vercel

### API Requests Failing
- Check `NEXT_PUBLIC_API_URL` points to correct HuggingFace Space URL
- Verify backend is running (visit `/health` endpoint)
- Check browser console for detailed error messages

## Custom Domain (Optional)

1. Go to Vercel Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed by Vercel
4. Update `BETTER_AUTH_URL` to new domain
5. Update backend `FRONTEND_URL` to new domain
