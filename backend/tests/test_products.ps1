Write-Host "Testing Products API..." -ForegroundColor Cyan

# Test GET /api/products
Write-Host "`nTesting GET /api/products"
try {
    Write-Host "Sending request to http://localhost:3000/api/products..."
    
    # First try to get the raw response
    $rawResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method Get
    Write-Host "`nRaw Response Status Code: $($rawResponse.StatusCode)"
    Write-Host "Raw Response Headers:"
    $rawResponse.Headers | Format-Table -AutoSize
    Write-Host "Raw Response Content:"
    Write-Host $rawResponse.Content
    
    # Now parse as JSON
    Write-Host "`nParsing response as JSON..."
    $response = $rawResponse.Content | ConvertFrom-Json
    Write-Host "Parsed Response:"
    Write-Host ($response | ConvertTo-Json -Depth 10)
    
    # Validate response structure
    Write-Host "`nValidating response structure..."
    if ($response.PSObject.Properties.Name -contains "products") {
        Write-Host " Response contains 'products' field" -ForegroundColor Green
        Write-Host "Number of products: $($response.products.Count)"
        if ($response.products.Count -gt 0) {
            Write-Host "First product:"
            Write-Host ($response.products[0] | ConvertTo-Json)
        }
    } else {
        Write-Host " Response missing 'products' field" -ForegroundColor Red
    }
    
    if ($response.PSObject.Properties.Name -contains "categories") {
        Write-Host " Response contains 'categories' field" -ForegroundColor Green
        Write-Host "Categories: $($response.categories -join ', ')"
    } else {
        Write-Host " Response missing 'categories' field" -ForegroundColor Red
    }
} catch {
    Write-Host "`nError occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    
    if ($_.Exception.Response) {
        Write-Host "`nResponse Status Code: $($_.Exception.Response.StatusCode.value__)"
        Write-Host "Response Status Description: $($_.Exception.Response.StatusDescription)"
        
        # Try to get response body
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "`nResponse Body:"
        Write-Host $responseBody
    }
    
    Write-Host "`nStack Trace:"
    Write-Host $_.ScriptStackTrace
}
