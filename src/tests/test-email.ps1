$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    orderId = "test-order-123"
    customerName = "Test Customer"
    customerEmail = "test@example.com"
    customerPhone = "123-456-7890"
    items = @(
        @{
            name = "Test Product 1"
            quantity = 2
            price = 2500
        }
    )
    delivery = @{
        method = "delivery"
        address = "123 Test St"
        borough = "Manhattan"
        zipCode = "10001"
        deliveryDate = "2024-01-20T10:00:00.000Z"
        instructions = "Test delivery instructions"
    }
    total = 5010
    fee = 10
}

$jsonBody = $body | ConvertTo-Json -Depth 10

Write-Host "Testing email notification endpoint..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/send-order-email" -Method Post -Headers $headers -Body $jsonBody
    Write-Host "Response Status Code: $($response.StatusCode)"
    Write-Host "Response Body: $($response.Content)"
} catch {
    Write-Host "Error occurred: $_"
    Write-Host "Response: $($_.Exception.Response)"
} 