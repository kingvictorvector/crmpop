# Update script for CRM Pop service
$ErrorActionPreference = "Stop"

# Define paths
$serverPath = "C:\CRMPop"  # The path where the service runs from

# Create server directory if it doesn't exist
if (-not (Test-Path $serverPath)) {
    New-Item -ItemType Directory -Path $serverPath -Force
}

# Copy files to server location
Write-Host "Copying files to server location..."
Copy-Item "test-redirect.cjs" -Destination $serverPath -Force
Copy-Item "index.html" -Destination $serverPath -Force
Copy-Item "package.json" -Destination $serverPath -Force
Copy-Item ".env" -Destination $serverPath -Force

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "$serverPath\node_modules")) {
    Write-Host "Installing dependencies..."
    Set-Location $serverPath
    npm install
}

Write-Host "Update complete!"
Write-Host "You can access the application at:"
Write-Host "http://localhost:3001/crmpop/redirect/`$PHONENUMBER"
Write-Host "Example: http://localhost:3001/crmpop/redirect/`$2065550199"