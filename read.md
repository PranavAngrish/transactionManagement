# Payment API Documentation

A RESTful API for managing user accounts, payments, and transactions with multi-currency support.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Testing](#testing)
- [Docker Deployment](#docker-deployment)
- [Configuration](#configuration)
- [Error Handling](#error-handling)
- [Limitations](#limitations)
- [Contributing](#contributing)

## Features

- ✅ User registration with secure password hashing
- ✅ Basic HTTP authentication
- ✅ Account funding
- ✅ User-to-user payments
- ✅ Multi-currency balance viewing (INR, USD, EUR, GBP, etc.)
- ✅ Transaction history
- ✅ Real-time currency conversion via external API
- ✅ Comprehensive error handling
- ✅ RESTful API design

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Authentication:** Basic Auth with bcrypt
- **Currency API:** Open Exchange Rates API
- **Storage:** In-memory (Map) - Development only
- **Testing:** Mocha, Chai, Chai-HTTP, Nock
- **Containerization:** Docker

## Project Structure

```
payment_api/
│
├── app.js                          # Main application entry point
├── package.json                    # Dependencies and scripts
├── .env                            # Environment variables
├── Dockerfile                      # Docker configuration
├── docker-compose.yml              # Docker Compose configuration
|
│
├── config/
│   └── constants.js                # Application constants
│
├── db/
│   └── store.js                    # In-memory data store
│
├── routes/
│   ├── userRoutes.js               # User registration routes
│   ├── paymentRoutes.js            # Payment routes
│   └── testRoutes.js               # Test/debug routes
│
├── controllers/
│   ├── userController.js           # User registration controller
│   └── paymentController.js        # Payment operations controller
│
├── services/
│   ├── userService.js              # User business logic
│   ├── paymentService.js           # Payment business logic
│   └── currencyService.js          # Currency conversion logic
│
├── middleware/
│   └── auth.js                     # Authentication middleware
│
├── test/
│   ├── setup.js                    # Test configuration
│   ├── services/                   # Service unit tests
│   └── integration/                # API integration tests
│
├── views/
│   └── error.jade                  # Error page template
│
└── public/                         # Static files
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Docker (optional, for containerized deployment)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd payment-api
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file:**
```bash
PORT=3000
SALT_ROUNDS=10
BASE_CURRENCY=INR
EXCHANGE_API_URL=https://open.er-api.com/v6/latest/INR
```

4. **Start the server:**
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

5. **Verify server is running:**
```bash
curl http://localhost:3000/api/test
```

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. Register User

**POST** `/users/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "alice",
  "password": "alice123"
}
```

**Response (201):**
```json
{
  "username": "alice",
  "passwordHash": "$2b$10$...",
  "balance": 0,
  "transactions": []
}
```

**Errors:**
- `400` - Username and Password required
- `400` - User already exists

**Example:**
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"alice123"}'
```

---

#### 2. Fund Account

**POST** `/payments/fund`

Add funds to your account.

**Authentication:** Required

**Request Body:**
```json
{
  "amt": 1000
}
```

**Response (200):**
```json
{
  "balance": 1000
}
```

**Errors:**
- `400` - Amount is required
- `400` - Amount must be positive
- `401` - Missing authentication header
- `401` - Invalid credentials

**Example:**
```bash
curl -X POST http://localhost:3000/api/payments/fund \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'alice:alice123' | base64)" \
  -d '{"amt":1000}'
```

---

#### 3. Make Payment

**POST** `/payments/pay`

Transfer money to another user.

**Authentication:** Required

**Request Body:**
```json
{
  "to": "bob",
  "amt": 200
}
```

**Response (200):**
```json
{
  "balance": 800
}
```

**Errors:**
- `400` - Recipient username (to) is required
- `400` - Amount is required
- `400` - Amount must be positive
- `400` - Insufficient funds
- `400` - Recipient does not exist
- `401` - Authentication errors

**Example:**
```bash
curl -X POST http://localhost:3000/api/payments/pay \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'alice:alice123' | base64)" \
  -d '{"to":"bob","amt":200}'
```

---

#### 4. Get Balance

**GET** `/payments/bal?currency=USD`

Get current account balance with optional currency conversion.

**Authentication:** Required

**Query Parameters:**
- `currency` (optional) - Target currency code (INR, USD, EUR, GBP, etc.)
  - Default: `INR`

**Response (200):**
```json
{
  "balance": 850,
  "currency": "INR"
}
```

**With Currency Conversion:**
```json
{
  "balance": 10.2,
  "currency": "USD"
}
```

**Errors:**
- `400` - Unsupported Currency
- `400` - Currency conversion failed
- `401` - Authentication errors

**Examples:**
```bash
# Balance in INR (default)
curl -X GET http://localhost:3000/api/payments/bal \
  -H "Authorization: Basic $(echo -n 'alice:alice123' | base64)"

# Balance in USD
curl -X GET "http://localhost:3000/api/payments/bal?currency=USD" \
  -H "Authorization: Basic $(echo -n 'alice:alice123' | base64)"
```

---

#### 5. Get Transaction Statement

**GET** `/payments/stmt`

Get complete transaction history.

**Authentication:** Required

**Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "kind": "debit",
    "amt": 200,
    "updated_bal": 800,
    "timestamp": "2026-01-15T10:30:00.000Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "kind": "credit",
    "amt": 1000,
    "updated_bal": 1000,
    "timestamp": "2026-01-15T10:25:00.000Z"
  }
]
```

**Transaction Types:**
- `credit` - Money added to account (funding or received payment)
- `debit` - Money removed from account (sent payment)

**Example:**
```bash
curl -X GET http://localhost:3000/api/payments/stmt \
  -H "Authorization: Basic $(echo -n 'alice:alice123' | base64)"
```

## Authentication

This API uses **HTTP Basic Authentication**.

### How to Authenticate

1. **Create credentials string:**
   ```
   username:password
   ```

2. **Base64 encode the string:**
   ```bash
   echo -n 'alice:alice123' | base64
   # Output: YWxpY2U6YWxpY2UxMjM=
   ```

3. **Add to request header:**
   ```
   Authorization: Basic YWxpY2U6YWxpY2UxMjM=
   ```


## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

- **Unit Tests:** Services (userService, paymentService, currencyService)
- **Integration Tests:** Full API endpoints with authentication

### Test Structure

```
test/
├── setup.js                    # Test configuration
├── services/
│   ├── userService.test.js    # 28 tests
│   ├── paymentService.test.js # 35 tests
│   └── currencyService.test.js# 15 tests
└── integration/
    └── api.test.js            # 45 tests
```

## Docker Deployment

### Using Docker

```bash
# Build image
docker build -t payment-api .

# Run container
docker run -p 3000:3000 --name payment-api payment-api
```

### Using Docker Compose (Recommended)

```bash
# Start application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop application
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

### Docker Environment Variables

Configure in `docker-compose.yml`:
```yaml
environment:
  - PORT=3000
  - SALT_ROUNDS=10
  - BASE_CURRENCY=INR
  - EXCHANGE_API_URL=https://open.er-api.com/v6/latest/INR
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `SALT_ROUNDS` | Bcrypt salt rounds | `10` |
| `BASE_CURRENCY` | Base currency code | `INR` |
| `EXCHANGE_API_URL` | Currency API endpoint | `https://open.er-api.com/v6/latest/INR` |


## Error Handling

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created (user registration) |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (authentication failed) |
| `404` | Not Found (invalid endpoint) |
| `500` | Internal Server Error |

### Error Response Format

```json
{
  "error": "Error message description"
}
```

### Common Errors

**Authentication Errors:**
```json
{ "error": "Missing authentication header" }
{ "error": "Invalid credentials" }
```

**Validation Errors:**
```json
{ "error": "Username and Password required" }
{ "error": "Amount is required" }
{ "error": "Amount must be positive" }
{ "error": "Recipient username (to) is required" }
```

**Business Logic Errors:**
```json
{ "error": "User already exists" }
{ "error": "Insufficient funds" }
{ "error": "Recipient does not exist" }
{ "error": "Unsupported Currency" }
```

## API Usage Examples

### Complete Workflow Example

```bash
# 1. Register two users
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"alice123"}'

curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"bob","password":"bob456"}'

# 2. Fund Alice's account
curl -X POST http://localhost:3000/api/payments/fund \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'alice:alice123' | base64)" \
  -d '{"amt":1000}'

# 3. Alice pays Bob
curl -X POST http://localhost:3000/api/payments/pay \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'alice:alice123' | base64)" \
  -d '{"to":"bob","amt":200}'

# 4. Check Alice's balance in USD
curl -X GET "http://localhost:3000/api/payments/bal?currency=USD" \
  -H "Authorization: Basic $(echo -n 'alice:alice123' | base64)"

# 5. View transaction history
curl -X GET http://localhost:3000/api/payments/stmt \
  -H "Authorization: Basic $(echo -n 'alice:alice123' | base64)"
```

## Troubleshooting

### Server won't start

**Issue:** Port already in use
```bash
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 npm start
```
