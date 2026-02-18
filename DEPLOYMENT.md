# 🚀 Deployment Guide - Young AI Founder Lab

## Best Option: Vercel + Neon PostgreSQL (FREE)

**Total Cost: $0/month forever**

| Platform | Free Tier | Why It's Great |
|----------|-----------|----------------|
| **Vercel** | 100GB bandwidth | Made for Next.js, zero config |
| **Neon** | 0.5GB database | Serverless PostgreSQL, auto-scaling |

---

## 📋 Quick Deploy Checklist

- [ ] 1. Push code to GitHub
- [ ] 2. Create free Neon database
- [ ] 3. Switch to PostgreSQL schema
- [ ] 4. Connect Vercel to GitHub
- [ ] 5. Add environment variables
- [ ] 6. Deploy & seed database

---

## Step-by-Step Instructions

### Step 1: Push to GitHub

```bash
cd /home/z/my-project

# Initialize git
git init

# Create .gitignore
echo "node_modules/
.next/
.env
*.log
db/" > .gitignore

# Commit
git add .
git commit -m "Young AI Founder Lab - Initial commit"

# Create repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/young-ai-founder-lab.git
git branch -M main
git push -u origin main
```

---

### Step 2: Create Free Neon Database

1. Go to **https://neon.tech**
2. Click **Sign Up** (free, no credit card)
3. Create project: `young-ai-founder-lab`
4. Copy BOTH connection strings:
   
   **Pooled connection (for app):**
   ```
   postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
   
   **Direct connection (for migrations):**
   ```
   postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

---

### Step 3: Switch to PostgreSQL Schema

Before deploying, switch from SQLite to PostgreSQL:

```bash
cd /home/z/my-project

# Backup SQLite schema
cp prisma/schema.prisma prisma/schema.sqlite.prisma

# Use PostgreSQL schema
cp prisma/schema.production.prisma prisma/schema.prisma
```

---

### Step 4: Deploy to Vercel

1. Go to **https://vercel.com**
2. Sign up with **GitHub**
3. Click **"Add New Project"**
4. Import `young-ai-founder-lab`
5. **Framework**: Next.js (auto-detected)
6. **Root Directory**: ./
7. **Build Command**: `bun run build`
8. **Output Directory**: .next

---

### Step 5: Add Environment Variables

In Vercel project settings, add these **Environment Variables**:

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | Your Neon **pooled** connection string | Production, Preview, Development |
| `DIRECT_URL` | Your Neon **direct** connection string | Production, Preview, Development |

**Note**: If you use the AI Mentor feature, also add your API keys.

---

### Step 6: Deploy!

Click **Deploy** and wait ~2 minutes.

Your app will be live at:
```
https://young-ai-founder-lab.vercel.app
```

---

### Step 7: Seed the Database (One-Time)

After first deployment, seed the missions:

**Option A: Using Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Pull environment variables
cd /home/z/my-project
vercel env pull .env.production

# Push schema and seed
bun run db:push
bun run prisma/seed.ts
```

**Option B: Using Neon SQL Editor**
1. Go to Neon dashboard → SQL Editor
2. Run schema creation (from `prisma/schema.production.prisma`)
3. Run seed queries manually (or use Option A)

---

## 🔄 Alternative: Vercel Postgres (Even Simpler!)

Vercel has built-in PostgreSQL (powered by Neon):

1. In Vercel dashboard → **Storage** tab
2. Click **Create Database** → **Postgres**
3. It auto-connects! (no connection strings needed)
4. Deploy

**Note**: Free tier is 256MB vs Neon's 512MB

---

## 🛠 Maintenance

### Updating the App
```bash
git add .
git commit -m "Your update message"
git push
```
Vercel auto-deploys on every push!

### Viewing Logs
- Vercel Dashboard → Project → **Deployments** → Click deployment → **Functions**

### Database Management
- Neon dashboard has query editor, backups, and monitoring

---

## ⚠️ Common Issues

### Build Fails
- Check `bun run build` works locally
- Verify all dependencies in package.json

### Database Connection Error
- Verify DATABASE_URL and DIRECT_URL are set
- Check Neon database isn't paused (free tier sleeps after inactivity)

### Missing Missions
- Run seed script: `bun run prisma/seed.ts`
- Ensure DATABASE_URL points to production database

---

## 🌐 Custom Domain (Optional)

1. Vercel Dashboard → Project → **Settings** → **Domains**
2. Add your domain
3. Update DNS records as shown

---

## 📊 Free Tier Limits

| Service | Limit | What Happens |
|---------|-------|--------------|
| Vercel | 100GB bandwidth/month | Auto-pause |
| Neon | 0.5GB storage | Can't write more |
| Neon | 191 hours compute/month | Auto-pause |

**For personal use, you'll never hit these limits!**

---

## 🎉 That's It!

Your Young AI Founder Lab is now live and free forever!
