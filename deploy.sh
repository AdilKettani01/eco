#!/bin/bash

# EcoLimpio Deployment Script for VPS
# Run this script on your VPS at /var/www/ecolimpio

set -e  # Exit on error

echo "🚀 Starting EcoLimpio deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Pull latest changes
echo -e "${BLUE}📥 Pulling latest changes from git...${NC}"
git pull origin main

# Step 2: Install/update dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Step 3: Generate Prisma client
echo -e "${BLUE}🔧 Generating Prisma client...${NC}"
npx prisma generate

# Step 4: Run database migration
echo -e "${BLUE}🗄️  Running database migration...${NC}"
npx prisma migrate deploy

# Step 5: Run session migration (clear old sessions)
echo -e "${BLUE}🔄 Running session migration...${NC}"
npx ts-node scripts/migrate-sessions.ts

# Step 6: Restart PM2 process
echo -e "${BLUE}♻️  Restarting application...${NC}"
pm2 restart ecolimpio || pm2 start npm --name "ecolimpio" -- start

# Step 7: Save PM2 configuration
echo -e "${BLUE}💾 Saving PM2 configuration...${NC}"
pm2 save

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "📝 Important notes:"
echo "  - All existing sessions have been cleared"
echo "  - Users will need to log in again"
echo "  - Admin panels: https://ecolimpio.es/{hash}/admin/dashboard"
echo "  - User panels: https://ecolimpio.es/{hash}/dashboard"
echo ""
echo "🔍 Check application status:"
echo "  pm2 status"
echo "  pm2 logs ecolimpio"
