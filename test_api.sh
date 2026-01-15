#!/bin/bash
# Complete API Testing Script
# Make sure your server is running on http://localhost:3000

echo "================================"
echo "1. REGISTER USERS"
echo "================================"

# Register first user (Alice)
echo "\n→ Registering user 'alice'"
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"alice123"}'

echo "\n"

# Register second user (Bob)
echo "→ Registering user 'bob'"
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"bob","password":"bob456"}'

echo "\n"

# Try to register duplicate user (should fail)
echo "→ Trying to register duplicate user 'alice' (should fail)"
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"newpass"}'

echo "\n\n================================"
echo "2. TEST AUTHENTICATION"
echo "================================"

# Missing authentication header (should fail)
echo "\n→ Accessing balance without auth (should fail)"
curl -X GET http://localhost:3000/api/payments/bal

echo "\n"

# Wrong credentials (should fail)
echo "→ Using wrong password (should fail)"
curl -X GET http://localhost:3000/api/payments/bal \
  -H "Authorization: Basic $(echo -n 'alice:wrongpass' | base64)"

echo "\n"

# Correct credentials (should work)
echo "→ Using correct credentials (should work)"
curl -X GET http://localhost:3000/api/payments/bal \
  -H "Authorization: Basic $(echo -n 'alice:alice123' | base64)"

echo "\n\n================================"
echo "3. FUND ACCOUNT"
echo "================================"

# Fund Alice's account
echo "\n→ Funding Alice's account with 1000 INR"
curl -X POST http://localhost:3000/api/payments/fund \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'alice:alice123' | base64)" \
  -d '{"amt":1000}'

echo "\n"

# Fund Bob's account
echo "→ Funding Bob's account with 500 INR"
curl -X POST http://localhost:3000/api/payments/fund \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'bob:bob456' | base64)" \
  -d '{"amt":500}'

echo "\n"

# Try to fund with negative amount (should fail)
echo "→ Trying to fund with negative amount (should fail)"
curl -X POST http://localhost:3000/api/payments/fund \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'alice:alice123' | base64)" \
  -d '{"amt":-100}'

echo "\n"

# Try to fund without amount (should fail)
echo "→ Trying to fund without amount field (should fail)"
curl -X POST http://localhost:3000/api/payments/fund \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'alice:alice123' | base64)" \
  -d '{}'

echo "\n\n================================"
echo "4. CHECK BALANCES"
echo "================================"

# Check Alice's balance
echo "\n→ Checking Alice's balance"
curl -X GET http://localhost:3000/api/payments/bal \
  -H "Authorization: Basic $(echo -n 'alice:alice123' | base64)"

echo "\n"

# Check Bob's balance
echo "→ Checking Bob's balance"
curl -X GET http://localhost:3000/api/payments/bal \
  -H "Authorization: Basic $(echo -n 'bob:bob456' | base64)"

echo "\n\n================================"
echo "5. MAKE PAYMENTS"
echo "================================"

# Alice pays Bob 200 INR
echo "\n→ Alice pays Bob 200 INR"
curl -X POST http://localhost:3000/api/payments/pay \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'alice:alice123' | base64)" \
  -d '{"to":"bob","amt":200}'

echo "\n"

# Bob pays Alice 50 INR
echo "→ Bob pays Alice 50 INR"
curl -X POST http://localhost:3000/api/payments/pay \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'bob:bob456' | base64)" \
  -d '{"to":"alice","amt":50}'

echo "\n"

# Try to pay without 'to' field (should fail)
echo "→ Trying to pay without recipient (should fail)"
curl -X POST http://localhost:3000/api/payments/pay \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'alice:alice123' | base64)" \
  -d '{"amt":100}'

echo "\n"

# Try to pay without amount (should fail)
echo "→ Trying to pay without amount (should fail)"
curl -X POST http://localhost:3000/api/payments/pay \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'alice:alice123' | base64)" \
  -d '{"to":"bob"}'

echo "\n"

# Try to pay more than balance (should fail)
echo "→ Alice tries to pay 10000 INR (insufficient funds, should fail)"
curl -X POST http://localhost:3000/api/payments/pay \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'alice:alice123' | base64)" \
  -d '{"to":"bob","amt":10000}'

echo "\n"

# Try to pay to non-existent user (should fail)
echo "→ Trying to pay to non-existent user (should fail)"
curl -X POST http://localhost:3000/api/payments/pay \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'alice:alice123' | base64)" \
  -d '{"to":"charlie","amt":50}'

echo "\n\n================================"
echo "6. CHECK UPDATED BALANCES"
echo "================================"

# Check Alice's balance after transactions
echo "\n→ Alice's balance after transactions (should be 850)"
curl -X GET http://localhost:3000/api/payments/bal \
  -H "Authorization: Basic $(echo -n 'alice:alice123' | base64)"

echo "\n"

# Check Bob's balance after transactions
echo "→ Bob's balance after transactions (should be 650)"
curl -X GET http://localhost:3000/api/payments/bal \
  -H "Authorization: Basic $(echo -n 'bob:bob456' | base64)"

echo "\n\n================================"
echo "7. CURRENCY CONVERSION"
echo "================================"

# Check balance in USD
echo "\n→ Alice's balance in USD"
curl -X GET "http://localhost:3000/api/payments/bal?currency=USD" \
  -H "Authorization: Basic $(echo -n 'alice:alice123' | base64)"

echo "\n"

# Check balance in EUR
echo "→ Alice's balance in EUR"
curl -X GET "http://localhost:3000/api/payments/bal?currency=EUR" \
  -H "Authorization: Basic $(echo -n 'alice:alice123' | base64)"

echo "\n"

# Check balance in GBP
echo "→ Alice's balance in GBP"
curl -X GET "http://localhost:3000/api/payments/bal?currency=GBP" \
  -H "Authorization: Basic $(echo -n 'alice:alice123' | base64)"

echo "\n\n================================"
echo "8. TRANSACTION STATEMENTS"
echo "================================"

# Get Alice's transaction statement
echo "\n→ Alice's transaction statement"
curl -X GET http://localhost:3000/api/payments/stmt \
  -H "Authorization: Basic $(echo -n 'alice:alice123' | base64)"

echo "\n"

# Get Bob's transaction statement
echo "→ Bob's transaction statement"
curl -X GET http://localhost:3000/api/payments/stmt \
  -H "Authorization: Basic $(echo -n 'bob:bob456' | base64)"
