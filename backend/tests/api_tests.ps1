Write-Host "Testing API endpoints..."

# Test 1: Get all products
Write-Host "`n1. Testing GET /api/products"
Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method Get -ContentType "application/json" -ErrorAction SilentlyContinue
if ($?) {
    Write-Host "GET /api/products successful" -ForegroundColor Green
} else {
    Write-Host "GET /api/products failed" -ForegroundColor Red
}

# Test 2: Get delivery fees
Write-Host "`n2. Testing GET /api/delivery-fees"
Invoke-RestMethod -Uri "http://localhost:3000/api/delivery-fees" -Method Get -ContentType "application/json" -ErrorAction SilentlyContinue
if ($?) {
    Write-Host "GET /api/delivery-fees successful" -ForegroundColor Green
} else {
    Write-Host "GET /api/delivery-fees failed" -ForegroundColor Red
}

# Test 3: Create a test product
Write-Host "`n3. Testing POST /api/products"
$productData = @{
    name = "Test Product"
    description = "Test Description"
    category = "Test Category"
    stock = 10
    variations = @()
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method Post -Body $productData -ContentType "application/json" -ErrorAction SilentlyContinue
if ($?) {
    Write-Host "POST /api/products successful" -ForegroundColor Green
} else {
    Write-Host "POST /api/products failed" -ForegroundColor Red
}

# Test 4: Get orders
Write-Host "`n4. Testing GET /api/orders"
Invoke-RestMethod -Uri "http://localhost:3000/api/orders" -Method Get -ContentType "application/json" -ErrorAction SilentlyContinue
if ($?) {
    Write-Host "GET /api/orders successful" -ForegroundColor Green
} else {
    Write-Host "GET /api/orders failed" -ForegroundColor Red
}

# Test 5: Create a test order
Write-Host "`n5. Testing POST /api/orders"
$orderData = @{
    customerName = "Test Customer"
    customerEmail = "test@example.com"
    customerPhone = "1234567890"
    items = @(
        @{
            id = "test_id"
            name = "Test Product"
            quantity = 1
            price = 10
        }
    )
    total = 10
    status = "pending"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/orders" -Method Post -Body $orderData -ContentType "application/json" -ErrorAction SilentlyContinue
if ($?) {
    Write-Host "POST /api/orders successful" -ForegroundColor Green
} else {
    Write-Host "POST /api/orders failed" -ForegroundColor Red
}

Write-Host "`nAll tests completed."
