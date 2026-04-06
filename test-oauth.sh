#!/bin/bash

# Test OAuth Service Endpoints

BASE_URL="http://localhost:3000"

echo "🧪 Testing OAuth Service..."
echo ""

# Test 1: OAuth Status
echo "1️⃣ Testing OAuth Status Endpoint"
curl -s "$BASE_URL/oauth" | jq '.'
echo ""

# Test 2: OpenID Discovery
echo "2️⃣ Testing OpenID Discovery"
curl -s "$BASE_URL/.well-known/openid-configuration" | jq '.'
echo ""

# Test 3: Register Client
echo "3️⃣ Registering Demo Client"
RESPONSE=$(curl -s -X POST "$BASE_URL/oauth/v1/clients" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Demo App",
    "redirect_uris": ["http://localhost:3002/auth/callback"],
    "allowed_origins": ["http://localhost:3002"]
  }')

echo "$RESPONSE" | jq '.'

CLIENT_ID=$(echo "$RESPONSE" | jq -r '.client_id')
CLIENT_SECRET=$(echo "$RESPONSE" | jq -r '.client_secret')

echo ""
echo "✅ OAuth Service Tests Complete!"
echo ""
echo "📋 Save these credentials:"
echo "CLIENT_ID=$CLIENT_ID"
echo "CLIENT_SECRET=$CLIENT_SECRET"
echo ""
echo "🔗 Test Authorization URL:"
echo "$BASE_URL/oauth/v1/authorize?client_id=$CLIENT_ID&redirect_uri=http://localhost:3002/auth/callback&response_type=code&state=test123&scope=openid%20profile%20email"
