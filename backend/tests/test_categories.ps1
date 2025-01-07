Write-Host "Testing Categories API..." -ForegroundColor Cyan

# Test 1: Create a new category
Write-Host "`n1. Testing POST /api/categories"
$categoryData = @{
    name = "Test Category"
    description = "Test Category Description"
    displayOrder = 1
    'Is Active' = $true
} | ConvertTo-Json

try {
    Write-Host "Creating new category..."
    $newCategory = Invoke-RestMethod -Uri "http://localhost:3000/api/categories" -Method Post -Body $categoryData -ContentType "application/json"
    Write-Host "Category created successfully" -ForegroundColor Green
    Write-Host "Category ID: $($newCategory.id)"
    $categoryId = $newCategory.id
} catch {
    Write-Host "Failed to create category" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Test 2: Get all categories
Write-Host "`n2. Testing GET /api/categories"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/categories" -Method Get
    Write-Host "Categories retrieved successfully" -ForegroundColor Green
    Write-Host "Number of categories: $($response.categories.Count)"
    Write-Host "Categories:"
    $response.categories | ForEach-Object {
        Write-Host "- $($_.name) (ID: $($_.id))"
    }
} catch {
    Write-Host "Failed to get categories" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Test 3: Create a product with the new category
Write-Host "`n3. Testing POST /api/products with category"
$productData = @{
    name = "Test Product"
    description = "Test Product Description"
    category = @($categoryId)  # Category should be an array with the category ID
    stock = 10
    price = 9.99
    'Is Active' = $true
    variations = @()
} | ConvertTo-Json

try {
    Write-Host "Creating new product..."
    $newProduct = Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method Post -Body $productData -ContentType "application/json"
    Write-Host "Product created successfully" -ForegroundColor Green
    Write-Host "Product ID: $($newProduct.id)"
    $productId = $newProduct.id
} catch {
    Write-Host "Failed to create product" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Test 4: Get products with categories
Write-Host "`n4. Testing GET /api/products"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method Get
    Write-Host "Products with categories retrieved successfully" -ForegroundColor Green
    Write-Host "Number of products: $($response.products.Count)"
    Write-Host "Products with categories:"
    $response.products | ForEach-Object {
        Write-Host "- $($_.name) (Category: $($_.category.name))"
    }
} catch {
    Write-Host "Failed to get products" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

# Test 5: Get products by category
Write-Host "`n5. Testing GET /api/products/category/$categoryId"
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/products/category/$categoryId" -Method Get
    Write-Host "Products by category retrieved successfully" -ForegroundColor Green
    Write-Host "Number of products in category: $($response.products.Count)"
    Write-Host "Products in category:"
    $response.products | ForEach-Object {
        Write-Host "- $($_.name)"
    }
} catch {
    Write-Host "Failed to get products by category" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "`nAll tests completed."
