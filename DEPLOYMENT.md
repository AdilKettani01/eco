# Production Deployment Guide

## Hash-Based Routing Migration Deployment

This guide will help you deploy the migration from subdomain-based routing to hash-based path routing.

## Prerequisites

- VPS access with SSH
- Application running at `/var/www/ecolimpio`
- PM2 installed and configured
- Database connection configured in `.env`

## Option 1: Automated Deployment (Recommended)

### Step 1: Upload deployment script to VPS

On your local machine:
```bash
scp deploy.sh root@ecolimpio.es:/var/www/ecolimpio/
```

### Step 2: SSH to your VPS

```bash
ssh root@ecolimpio.es
```

### Step 3: Navigate to application directory

```bash
cd /var/www/ecolimpio
```

### Step 4: Make script executable and run

```bash
chmod +x deploy.sh
./deploy.sh
```

The script will:
- ✅ Pull latest changes
- ✅ Install dependencies
- ✅ Generate Prisma client
- ✅ Run database migration
- ✅ Clear existing sessions
- ✅ Restart PM2 process

---

## Option 2: Manual Deployment

If you prefer to run commands step by step:

### Step 1: SSH to VPS

```bash
ssh root@ecolimpio.es
```

### Step 2: Navigate to application directory

```bash
cd /var/www/ecolimpio
```

### Step 3: Pull latest changes

```bash
git pull origin main
```

### Step 4: Install dependencies

```bash
npm install
```

### Step 5: Generate Prisma client

```bash
npx prisma generate
```

### Step 6: Run database migration

```bash
npx prisma migrate deploy
```

**Expected output:**
```
Applying migration `20XXXXXX_rename_subdomain_to_access_hash`
Database schema updated successfully
```

### Step 7: Run session migration script

```bash
npx ts-node scripts/migrate-sessions.ts
```

**Expected output:**
```
✓ Deleted X existing sessions
✓ Users will need to log in again with new hash-based URLs
✓ Migration completed successfully
```

### Step 8: Restart PM2 process

```bash
pm2 restart ecolimpio
```

### Step 9: Verify deployment

```bash
pm2 status
pm2 logs ecolimpio --lines 50
```

### Step 10: Save PM2 configuration

```bash
pm2 save
```

---

## Verification Checklist

After deployment, verify the following:

### Database Check
```bash
# Verify schema was updated
npx prisma studio
# Check that Session table has 'accessHash' field instead of 'subdomain'
```

### Application Health
```bash
# Check PM2 status
pm2 status

# Check application logs
pm2 logs ecolimpio

# Check for errors
pm2 logs ecolimpio --err
```

### Functional Testing

1. **Login Flow**
   - Go to `https://ecolimpio.es/login`
   - Login as admin
   - Verify redirect to: `https://ecolimpio.es/{random-hash}/admin/dashboard`

2. **Navigation**
   - Click sidebar links
   - Verify hash is preserved in URLs
   - Check that all admin pages load correctly

3. **Customer Login**
   - Login as customer
   - Verify redirect to: `https://ecolimpio.es/{random-hash}/dashboard`

4. **Logout**
   - Click logout
   - Verify redirect to `/login`
   - Verify session is cleared

5. **Security**
   - Try accessing `/admin` directly (should redirect to login)
   - Try accessing an invalid hash path (should redirect to login)

---

## Rollback Plan

If issues occur, rollback with:

```bash
# Stop application
pm2 stop ecolimpio

# Revert git commit
git revert HEAD
git push origin main

# Pull reverted changes
git pull origin main

# Rollback database migration
npx prisma migrate resolve --rolled-back 20XXXXXX_rename_subdomain_to_access_hash

# Or manually rollback database
mysql -u user -p ecolimpio -e "ALTER TABLE Session RENAME COLUMN accessHash TO subdomain;"

# Restart application
pm2 restart ecolimpio
```

---

## Post-Deployment Notes

### DNS Changes
- **No DNS changes required!** The new hash-based routing doesn't need wildcard subdomain configuration
- You can optionally remove the `*.ecolimpio.es` DNS record if you had one configured

### User Impact
- All existing sessions will be cleared
- Users must log in again
- New session URLs will use hash-based paths instead of subdomains

### Performance
- Middleware now queries database on every request
- Consider implementing Redis caching for session validation if performance issues arise

---

## Troubleshooting

### Issue: Prisma migration fails
```bash
# Check database connection
npx prisma db pull

# Check migration status
npx prisma migrate status

# Force reset (⚠️ WARNING: This will delete all data)
# npx prisma migrate reset
```

### Issue: PM2 won't start
```bash
# Check PM2 logs
pm2 logs ecolimpio --err

# Delete old PM2 process and restart
pm2 delete ecolimpio
pm2 start npm --name "ecolimpio" -- start
pm2 save
```

### Issue: 500 errors after deployment
```bash
# Check if Prisma client is generated
ls -la node_modules/.prisma/client

# Regenerate if missing
npx prisma generate

# Check environment variables
cat .env | grep DATABASE_URL
```

### Issue: Users can't login
```bash
# Check database connection
npx prisma studio

# Verify sessions table structure
# Should have 'accessHash' column, not 'subdomain'

# Clear all sessions and try again
npx ts-node scripts/migrate-sessions.ts
```

---

## Support

If you encounter any issues during deployment:

1. Check PM2 logs: `pm2 logs ecolimpio`
2. Check database migration status: `npx prisma migrate status`
3. Verify environment variables are set correctly
4. Check GitHub issues or create a new one

---

## Success Indicators

✅ PM2 shows status: "online"
✅ No errors in PM2 logs
✅ Database migration completed successfully
✅ Login redirects to hash-based URLs
✅ Navigation preserves hash in URLs
✅ Logout clears session properly
