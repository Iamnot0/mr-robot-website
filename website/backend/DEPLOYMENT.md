# MR-ROBOT Backend Deployment Guide

## Railway Deployment

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```

### 3. Initialize Railway Project
```bash
railway init
```

### 4. Add Database
```bash
railway add mysql
```

### 5. Set Environment Variables
```bash
# Set JWT Secret
railway variables set JWT_SECRET=your-super-secret-jwt-key-here

# Set CORS Origin
railway variables set CORS_ORIGIN=https://mrrobotcomputerrepair.com,https://fronted-ten-self.vercel.app
```

### 6. Deploy
```bash
railway up
```

### 7. Get Backend URL
```bash
railway domain
```

## Environment Variables Needed:
- `JWT_SECRET`: Your JWT secret key
- `CORS_ORIGIN`: Allowed origins for CORS
- Database variables will be auto-provided by Railway

## After Deployment:
1. Update frontend config to use Railway backend URL
2. Test all API endpoints
3. Update Vercel environment variables if needed
