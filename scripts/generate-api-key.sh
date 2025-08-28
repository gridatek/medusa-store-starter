#!/bin/bash

# Complete Local Development Setup for Medusa Store
# Usage: ./scripts/generate-api-key.sh [admin-email] [admin-password]

set -e

# Configuration
BACKEND_URL="http://localhost:9000"
CONFIG_FILE="storefront/public/assets/config/environment.json"

# Default credentials (can be overridden by command line arguments)
ADMIN_EMAIL="${1:-admin@example.com}"
ADMIN_PASSWORD="${2:-supersecret}"

echo "Complete Local Development Setup"
echo "==============================="

# Clean up existing setup
echo "1. Cleaning up existing setup..."
echo "   - Stopping Docker containers..."
docker compose down 2>/dev/null || echo "   No Docker containers to stop"

echo "   - Removing node_modules..."
rm -rf node_modules backend/node_modules storefront/node_modules e2e/node_modules

echo "   - Cleaning Docker volumes..."
docker compose down -v 2>/dev/null || true
docker system prune -f 2>/dev/null || true

# Start Docker services
echo "2. Starting Docker services..."
docker compose up -d

echo "   Waiting for services to be healthy..."
timeout 60s bash -c 'until [ $(docker compose ps | grep -c "healthy") -eq 2 ]; do
    echo "   Waiting for services..."
    sleep 3
done' || {
    echo "   Services failed to start properly"
    docker compose ps
    exit 1
}

echo "   Testing connections..."
docker compose exec -T postgres pg_isready -U postgres
docker compose exec -T redis redis-cli ping

# Install dependencies
echo "3. Installing dependencies..."
npm install

# Setup backend environment
echo "4. Setting up backend environment..."
BACKEND_ENV_FILE="backend/.env.development"
cat > "$BACKEND_ENV_FILE" << EOF
DATABASE_URL=postgres://postgres:postgres@localhost:5432/medusa-store
REDIS_URL=redis://localhost:6379
JWT_SECRET=supersecret
COOKIE_SECRET=supersecret
NODE_ENV=development
PORT=9000
STORE_CORS=http://localhost:4200
ADMIN_CORS=http://localhost:9000
AUTH_CORS=http://localhost:9000
EOF

# Also create .env for compatibility
cp "$BACKEND_ENV_FILE" "backend/.env"

# Build and migrate backend
echo "5. Building and migrating backend..."
cd backend
npm run build
npx medusa db:migrate

# Seed database
echo "6. Seeding database..."
npm run seed || echo "   No seed script found, skipping..."

# Create admin user
echo "7. Creating admin user..."
npx medusa user -e "$ADMIN_EMAIL" -p "$ADMIN_PASSWORD" || echo "   Admin user might already exist"

# Start backend in background
echo "8. Starting Medusa backend..."
npm run start &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo "   Waiting for backend to start..."
timeout 60s bash -c 'until curl -f -s http://localhost:9000/health > /dev/null; do
    echo "   Backend starting..."
    sleep 3
done'

# Authenticate admin user
echo "🔐 Authenticating admin user: $ADMIN_EMAIL"
AUTH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BACKEND_URL/auth/user/emailpass" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$ADMIN_EMAIL\", \"password\": \"$ADMIN_PASSWORD\"}")

# Check authentication
HTTP_CODE=$(echo "$AUTH_RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
if [ "$HTTP_CODE" != "200" ]; then
    echo "❌ Authentication failed with HTTP code: $HTTP_CODE"
    echo "   Response: $(echo "$AUTH_RESPONSE" | head -n -1)"
    echo ""
    echo "💡 Make sure you have created an admin user:"
    echo "   cd backend && npx medusa user -e $ADMIN_EMAIL -p $ADMIN_PASSWORD"
    exit 1
fi

# Extract JWT token
ACCESS_TOKEN=$(echo "$AUTH_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Failed to extract access token from response"
    echo "   Response: $(echo "$AUTH_RESPONSE" | head -n -1)"
    exit 1
fi
echo "✅ Admin authenticated successfully"

# Create publishable API key
echo "🛠️  Creating publishable API key..."
KEY_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BACKEND_URL/admin/api-keys" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d '{"title": "Development Key", "type": "publishable"}')

# Check key creation
HTTP_CODE=$(echo "$KEY_RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
if [ "$HTTP_CODE" != "200" ] && [ "$HTTP_CODE" != "201" ]; then
    echo "❌ Key creation failed with HTTP code: $HTTP_CODE"
    echo "   Response: $(echo "$KEY_RESPONSE" | head -n -1)"
    exit 1
fi

# Extract publishable key
PUBLISHABLE_KEY=$(echo "$KEY_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -z "$PUBLISHABLE_KEY" ]; then
    echo "❌ Failed to extract publishable API key from response"
    echo "   Response: $(echo "$KEY_RESPONSE" | head -n -1)"
    exit 1
fi

echo "✅ Publishable API key created: ${PUBLISHABLE_KEY:0:20}..."

# Create config directory if it doesn't exist
mkdir -p "$(dirname "$CONFIG_FILE")"

# Create environment configuration file
echo "📄 Creating storefront configuration file..."
cat > "$CONFIG_FILE" << EOF
{
  "medusaApiUrl": "$BACKEND_URL",
  "medusaPublishableApiKey": "$PUBLISHABLE_KEY"
}
EOF

echo "✅ Configuration file created: $CONFIG_FILE"

# Create .env.development for backend if it doesn't exist
BACKEND_ENV_FILE="backend/.env.development"
if [ ! -f "$BACKEND_ENV_FILE" ]; then
    echo "📄 Creating backend .env.development file..."
    cat > "$BACKEND_ENV_FILE" << EOF
DATABASE_URL=postgres://postgres:postgres@localhost:5432/medusa-store
REDIS_URL=redis://localhost:6379
JWT_SECRET=supersecret
COOKIE_SECRET=supersecret
NODE_ENV=development
PORT=9000
STORE_CORS=http://localhost:4200
ADMIN_CORS=http://localhost:9000
AUTH_CORS=http://localhost:9000
EOF
    echo "✅ Backend .env.development file created: $BACKEND_ENV_FILE"
else
    echo "ℹ️  Backend .env.development already exists, skipping..."
fi
echo ""
echo "🎉 Setup Complete!"
echo "================="
echo "Your Angular storefront is now configured with:"
echo "• API URL: $BACKEND_URL"
echo "• Publishable Key: ${PUBLISHABLE_KEY:0:20}..."
echo ""
echo "You can now start your Angular storefront:"
echo "cd storefront && npm run start"