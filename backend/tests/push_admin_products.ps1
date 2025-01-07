Write-Host "Pushing Products to Admin Products Tab..." -ForegroundColor Cyan

# Read the products.json file
$productsJson = Get-Content -Path "../products.json" -Raw | ConvertFrom-Json

foreach ($product in $productsJson) {
    Write-Host "`nPushing product: $($product.name)"
    
    # Get the first variation
    $variation = $product.variations[0]
    
    # Prepare the product data
    $productData = @{
        ID = $product.id
        Name = $product.name
        Description = $product.description
        Price = [double]$variation.price
        "Weight/Size" = [double]$variation.weight
        Stock = [int]$product.stock
        "Image URL" = $product.image
        Status = "active"
        Category = "Serial Bars"  # Category name as seen in Airtable
    }

    # Convert to JSON
    $body = $productData | ConvertTo-Json -Depth 10

    try {
        Write-Host "Sending request to http://localhost:3000/api/admin/products..."
        
        # Send POST request
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/products" -Method Post -Body $body -ContentType "application/json"
        
        Write-Host "Response Status Code: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Response Content:"
        Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)
        
    } catch {
        Write-Host "`nError occurred while pushing product: $($product.name)" -ForegroundColor Red
        Write-Host $_.Exception.Message
        
        if ($_.Exception.Response) {
            Write-Host "`nResponse Status Code: $($_.Exception.Response.StatusCode.value__)"
            Write-Host "Response Status Description: $($_.Exception.Response.StatusDescription)"
            
            # Try to get response body
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $reader.BaseStream.Position = 0
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response Body: $responseBody"
            $reader.Close()
        }
    }
    
    # Add a small delay between requests
    Start-Sleep -Milliseconds 500
}
