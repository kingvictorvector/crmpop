# Update script for CRM Pop service
$ErrorActionPreference = "Stop"

Write-Host "Starting CRM Pop service update..."

# Define paths
$serverPath = "C:\CRMPop"

# Create server directory if it doesn't exist
if (-not (Test-Path $serverPath)) {
    Write-Host "Creating server directory..."
    New-Item -ItemType Directory -Path $serverPath -Force
}

# Copy files to server location
Write-Host "Copying files to server location..."
$filesToCopy = @(
    "test-redirect.cjs",
    "index.html",
    "package.json"
)

foreach ($file in $filesToCopy) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $serverPath -Force
        Write-Host "Copied $file"
    } else {
        Write-Host "Warning: $file not found"
    }
}

# Copy .env file if it exists, otherwise warn
if (Test-Path ".env") {
    Copy-Item ".env" -Destination $serverPath -Force
    Write-Host "Copied .env file"
} else {
    Write-Host "Warning: .env file not found. Make sure to create it in $serverPath with proper database credentials."
}

# Install dependencies
Write-Host "Installing dependencies..."
Set-Location $serverPath
npm install --no-audit --no-fund

Write-Host "`nUpdate complete!"
Write-Host "You can access the service at:"
Write-Host "http://localhost:3001/crmpop/redirect/`$PHONENUMBER"
Write-Host "Example: http://localhost:3001/crmpop/redirect/`$2065550199"