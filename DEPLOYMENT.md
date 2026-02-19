# BackupHub Production Deployment Plan

## Status: READY FOR DEPLOYMENT ✅

All code complete. Sprints 1-4 done. Rate limiting implemented. All features merged to main.

---

## Architecture Overview

BackupHub is a **multi-service application**:
- **apps/web:** Next.js dashboard (port 3004)
- **apps/worker:** BullMQ worker (background jobs)
- **Redis:** BullMQ queue + rate limiting (Upstash)
- **PostgreSQL:** Metadata (users, workspaces, databases, backups)
- **Cloudflare R2:** Backup file storage (S3-compatible)

---

## Prerequisites Checklist

- [x] Code complete (Sprints 1-4)
- [x] Rate limiting implemented
- [x] All features merged to main
- [ ] PostgreSQL database provisioned
- [ ] Redis (Upstash) provisioned
- [ ] Cloudflare R2 bucket created
- [ ] Environment variables configured
- [ ] Build passing
- [ ] DNS configured
- [ ] Monitoring set up

---

## Step 1: External Services Setup

### PostgreSQL Database

**Option A: Supabase**
1. Create project: `backuphub-prod`
2. Copy connection string
3. Run migrations: `pnpm db:push`

**Option B: Self-Hosted**
```bash
createdb backuphub_production
# DATABASE_URL=postgresql://user:pass@localhost:5432/backuphub_production
```

### Redis (Upstash)

1. Create Upstash Redis database: https://upstash.com
2. Copy REDIS_URL (format: `rediss://default:xxx@xxx.upstash.io:6379`)
3. Test connection: `redis-cli -u $REDIS_URL ping`

### Cloudflare R2

1. Cloudflare Dashboard → R2 → Create bucket: `backuphub-production`
2. Generate API token: Read/Write R2
3. Note:
   - Account ID
   - Access Key ID
   - Secret Access Key
   - Bucket name

---

## Step 2: Environment Variables

### apps/web/.env.production:

```bash
# Database
DATABASE_URL="postgresql://..."

# Redis
REDIS_URL="rediss://default:...@....upstash.io:6379"

# NextAuth
NEXTAUTH_SECRET="<openssl rand -base64 32>"
NEXTAUTH_URL="https://backuphub.threestack.io"

# Cloudflare R2
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="backuphub-production"
R2_PUBLIC_URL="https://backuphub-production.r2.dev"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_STARTER="price_..."
STRIPE_PRICE_PRO="price_..."

# Resend (Email)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="alerts@backuphub.threestack.io"

# App
NODE_ENV="production"
PORT=3004
APP_URL="https://backuphub.threestack.io"
```

### apps/worker/.env.production:

```bash
# Database
DATABASE_URL="postgresql://..."

# Redis
REDIS_URL="rediss://default:...@....upstash.io:6379"

# Cloudflare R2
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="backuphub-production"

# Resend
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="alerts@backuphub.threestack.io"

# App
NODE_ENV="production"
```

---

## Step 3: Build

```bash
cd /home/quint/backuphub
export DATABASE_URL="postgresql://..."
pnpm install
pnpm build --filter web
pnpm build --filter worker
```

---

## Step 4: Deploy Web App

### Using PM2:

```bash
cd /home/quint/backuphub/apps/web
pm2 start npm --name "backuphub-web" -- start
pm2 save
```

### Using systemd:

Create `/etc/systemd/system/backuphub-web.service`:

```ini
[Unit]
Description=BackupHub Web Dashboard
After=network.target

[Service]
Type=simple
User=quint
WorkingDirectory=/home/quint/backuphub/apps/web
Environment=NODE_ENV=production
EnvironmentFile=/home/quint/backuphub/apps/web/.env.production
ExecStart=/home/quint/.local/share/pnpm/pnpm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable backuphub-web
sudo systemctl start backuphub-web
```

---

## Step 5: Deploy Worker

### Using PM2:

```bash
cd /home/quint/backuphub/apps/worker
pm2 start dist/index.js --name "backuphub-worker"
pm2 save
```

### Using systemd:

Create `/etc/systemd/system/backuphub-worker.service`:

```ini
[Unit]
Description=BackupHub Worker (BullMQ)
After=network.target redis.service

[Service]
Type=simple
User=quint
WorkingDirectory=/home/quint/backuphub/apps/worker
Environment=NODE_ENV=production
EnvironmentFile=/home/quint/backuphub/apps/worker/.env.production
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable backuphub-worker
sudo systemctl start backuphub-worker
```

---

## Step 6: Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name backuphub.threestack.io;

    location / {
        proxy_pass http://localhost:3004;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Step 7: DNS Configuration

**Cloudflare DNS:**
- Type: A
- Name: backuphub
- IPv4: 46.62.246.46
- Proxy: ON (orange cloud)
- SSL/TLS: Full (strict)

---

## Step 8: Test Production

### Manual Tests:
1. **Auth:** Sign up + login
2. **Workspace:** Create workspace
3. **Database Connection:** Add PostgreSQL database (connection test should pass)
4. **Manual Backup:** Trigger backup job
   - Worker should pick it up
   - Backup should complete
   - File should appear in R2
5. **Download:** Download backup (rate limit test: try 11 in quick succession, 11th should 429)
6. **Schema Diff:** Run schema diff
7. **Stripe:** Upgrade to Pro plan
8. **Email Alerts:** Trigger a backup failure (invalid credentials) → verify email sent

### Expected Results:
- ✅ Auth works
- ✅ Database connections validate
- ✅ Backups complete and upload to R2
- ✅ Worker processes jobs
- ✅ Rate limiting enforces 10 downloads/hr
- ✅ Schema diff works
- ✅ Stripe checkout functional
- ✅ Email alerts sent on failures

---

## Step 9: Monitoring

### Service Health:
```bash
# Check web app
curl https://backuphub.threestack.io

# Check worker logs
pm2 logs backuphub-worker --lines 50
# or
journalctl -u backuphub-worker -f
```

### UptimeRobot:
- URL: `https://backuphub.threestack.io`
- Type: HTTP(S)
- Check interval: 5 minutes

### Sentry (Optional):
```bash
pnpm add @sentry/nextjs
# Configure DSN in .env
```

---

## Step 10: Stripe Webhook

After deployment:
1. Stripe Dashboard → Webhooks
2. Create endpoint: `https://backuphub.threestack.io/api/stripe/webhook`
3. Subscribe to: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Send test event, verify 200 OK

---

## Step 11: Update Project Status

```bash
curl -X PATCH https://api.codevier.com/api/playground/projects/6fa92014-013f-427b-a8f8-80984de8dd40 \
  -H "Content-Type: application/json" \
  -d '{"status": "shipped", "demoUrl": "https://backuphub.threestack.io"}'
```

---

## Rollback Plan

If deployment fails:
1. Stop services: `pm2 stop backuphub-web backuphub-worker`
2. Check logs: `pm2 logs --lines 100`
3. Verify external services (Redis, R2, PostgreSQL)
4. Debug locally with production env
5. Fix, rebuild, redeploy

---

## Security Checklist

- [x] Rate limiting on restore endpoint (10/hr)
- [x] Database passwords encrypted (AES-256-GCM)
- [x] Auth middleware on all dashboard routes
- [ ] Firewall configured (only 80/443 exposed)
- [ ] SSL/TLS enabled (Cloudflare)
- [ ] Secrets in .env (not hardcoded)
- [ ] Worker isolated (no public endpoints)

---

## Estimated Time
- External services setup: 20 min
- Build + deploy (web + worker): 20 min
- DNS propagation: 5 min
- Testing: 15 min
- **Total: ~60 minutes**

---

## Post-Deployment

1. Monitor first 24 hours for errors
2. Test automated backups (schedule a daily backup)
3. Verify email alerts work in production
4. Announce launch
5. Plan v1.1 features (S3 lifecycle policies, backup retention UI)
