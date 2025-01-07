Write-Host "Pushing Categories to Airtable..." -ForegroundColor Cyan

# Define the categories
$categories = @(
    @{
        Name = "Serial Bars"
        Description = "Serial Bars Category"
        "Display Order" = 1
        "Is Active" = $true
    },
    @{
        Name = "Chocolate"
        Description = "Chocolate Category"
        "Display Order" = 2
        "Is Active" = $true
    },
    @{
        Name = "Flower"
        Description = "Flower Category"
        "Display Order" = 3
        "Is Active" = $true
    },
    @{
        Name = "Vapes"
        Description = "Vapes Category"
        "Display Order" = 4
        "Is Active" = $true
    },
    @{
        Name = "Pre-roll"
        Description = "Pre-roll Category"
        "Display Order" = 5
        "Is Active" = $true
    }
)

foreach ($category in $categories) {
    Write-Host "`nPushing category: $($category.Name)"
    
    # Convert to JSON
    $body = $category | ConvertTo-Json -Depth 10

    try {
        Write-Host "Sending request to http://localhost:3000/api/categories..."
        
        # Send POST request
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/categories" -Method Post -Body $body -ContentType "application/json"
        
        Write-Host "Response Status Code: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Response Content:"
        Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10)
        
    } catch {
        Write-Host "`nError occurred while pushing category: $($category.Name)" -ForegroundColor Red
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
    
    # Sleep for a bit to avoid rate limiting
    Start-Sleep -Seconds 1
}
