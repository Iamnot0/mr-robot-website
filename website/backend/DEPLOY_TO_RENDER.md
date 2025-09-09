# Deploy MR-ROBOT Backend to Render

## Quick Deployment Steps:

### 1. Go to Render.com
- Visit: https://render.com
- Sign up/Login with GitHub

### 2. Create New Web Service
- Click "New +" → "Web Service"
- Connect your GitHub repository
- Select the `MR-ROBOT` repository
- Choose the `website/backend` folder

### 3. Configure Service
- **Name**: `mr-robot-backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Plan**: Free

### 4. Environment Variables
Add these environment variables in Render dashboard:

```
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here
CORS_ORIGIN=https://mrrobotcomputerrepair.com,https://fronted-ten-self.vercel.app
```

### 5. Database
- Add a PostgreSQL database (free tier)
- Render will provide connection details automatically

### 6. Deploy
- Click "Create Web Service"
- Wait for deployment to complete
- Copy the provided URL (e.g., `https://mr-robot-backend.onrender.com`)

### 7. Update Frontend
Update your frontend config to use the new backend URL.

## Alternative: Use Existing Database
If you want to keep using your local MariaDB, you can:
1. Use a database tunneling service
2. Or migrate to PostgreSQL (recommended for production)
