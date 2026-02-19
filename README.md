# BackupHub

> Managed database backup SaaS — 5x cheaper than SimpleBackups, with Git-like UX for browsing, diffing, and restoring backups.

**Deploy:** [backuphub.threestack.io](https://backuphub.threestack.io)

## Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui, Monaco Editor
- **Backend:** Next.js API Routes, Drizzle ORM, PostgreSQL
- **Worker:** BullMQ + Redis (Upstash)
- **Storage:** Cloudflare R2 (S3-compatible)
- **Backup:** pg_dump / mysqldump wrappers
- **Auth:** NextAuth.js v5
- **Billing:** Stripe
- **Email:** Resend

## Packages

| Package | Description |
|---------|-------------|
| `apps/web` | Next.js dashboard + API |
| `apps/worker` | BullMQ worker + scheduler |
| `packages/db` | Drizzle ORM schema + client |
| `packages/s3` | Cloudflare R2 client |
| `packages/backup-engine` | pg_dump/mysqldump wrappers |

## Quick Start

```bash
cp .env.example .env
pnpm install
pnpm dev
```

## Environment Variables

See `.env.example` for all required variables.

## Architecture

1. User registers a database (host, port, credentials encrypted with AES-256-GCM)
2. User sets a backup schedule (cron expression)
3. Scheduler (every 5min) finds due databases → creates backup_jobs → enqueues to BullMQ
4. Worker picks up jobs → runs pg_dump/mysqldump → compresses → uploads to R2
5. On failure → sends email alert via Resend
6. User can browse backup timeline, diff schemas, download backups

## Built by ThreeStack

Part of the [ThreeStack](https://threestack.io) indie SaaS portfolio.
