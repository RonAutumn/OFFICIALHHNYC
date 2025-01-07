#!/bin/bash

echo "Testing API endpoints..."

# Test 1: Get all products
echo "\n1. Testing GET /api/products"
curl -v -X GET http://localhost:3000/api/products

# Test 2: Get delivery fees
echo "\n\n2. Testing GET /api/delivery-fees"
curl -v -X GET http://localhost:3000/api/delivery-fees

# Test 3: Create a test product
echo "\n\n3. Testing POST /api/products"
curl -v -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "Test Description",
    "category": "Test Category",
    "stock": 10,
    "variations": []
  }'

# Test 4: Get orders
echo "\n\n4. Testing GET /api/orders"
curl -v -X GET http://localhost:3000/api/orders

# Test 5: Create a test order
echo "\n\n5. Testing POST /api/orders"
curl -v -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test Customer",
    "customerEmail": "test@example.com",
    "customerPhone": "1234567890",
    "items": [
      {
        "id": "test_id",
        "name": "Test Product",
        "quantity": 1,
        "price": 10
      }
    ],
    "total": 10,
    "status": "pending"
  }'
