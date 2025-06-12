# Update script for CRM Pop service
$ErrorActionPreference = "Stop"

Write-Host "Starting CRM Pop service update..."

# Define paths
$sourceDir = $PSScriptRoot  # Gets the directory where this script is located
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
    $sourcePath = Join-Path $sourceDir $file
    $destPath = Join-Path $serverPath $file
    
    if (Test-Path $sourcePath) {
        try {
            if ($sourcePath -ne $destPath) {
                Copy-Item $sourcePath -Destination $destPath -Force
                Write-Host "Copied $file"
            } else {
                Write-Host "Skipping $file (source and destination are the same)"
            }
        } catch {
            Write-Host "Warning: Could not copy $file - $_"
        }
    } else {
        Write-Host "Warning: Source file $file not found"
    }
}

# Copy .env file if it exists, otherwise warn
$envSource = Join-Path $sourceDir ".env"
$envDest = Join-Path $serverPath ".env"
if (Test-Path $envSource) {
    if ($envSource -ne $envDest) {
        Copy-Item $envSource -Destination $envDest -Force
        Write-Host "Copied .env file"
    } else {
        Write-Host "Skipping .env (source and destination are the same)"
    }
} else {
    Write-Host "Warning: .env file not found. Make sure to create it in $serverPath with proper database credentials."
}

# Install dependencies
Write-Host "Installing dependencies..."
try {
    Push-Location $serverPath
    npm install --no-audit --no-fund
    Pop-Location
} catch {
    Write-Host "Warning: npm install failed - $_"
    Pop-Location
}

Write-Host "`nUpdate complete!"
Write-Host "You can access the service at:"
Write-Host "http://localhost:3001/crmpop/redirect/`$PHONENUMBER"
Write-Host "Example: http://localhost:3001/crmpop/redirect/`$2065550199"