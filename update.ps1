# Update script for CRM Pop service
$ErrorActionPreference = "Stop"

Write-Host "Starting CRM Pop service update..."

# Define paths
$serverPath = "C:\CRMPop"

# Verify we're in a Git repository
if (-not (Test-Path .git)) {
    Write-Host "Error: Not in a Git repository!" -ForegroundColor Red
    exit 1
}

# Pull latest changes
Write-Host "Pulling latest changes from Git..."
git fetch
git reset --hard origin/main

# Stop the service if it's running
$service = Get-Service -Name "CRMPopService" -ErrorAction SilentlyContinue
if ($service -and $service.Status -eq "Running") {
    Write-Host "Stopping CRMPopService..."
    Stop-Service -Name "CRMPopService" -Force
    Start-Sleep -Seconds 2
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

# Stop any existing node processes on port 3001
$existing = Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*node.exe" }
if ($existing) {
    $existing | Stop-Process -Force
}

# Start the Node.js server in the background
Start-Process "node" "server.cjs" -WorkingDirectory "C:\CRMPop"
Write-Host "Node.js server started."

# Start the service
if ($service) {
    Write-Host "Starting CRMPopService..."
    Start-Service -Name "CRMPopService"
    Start-Sleep -Seconds 2
    
    # Verify service status
    $service = Get-Service -Name "CRMPopService"
    Write-Host "Service Status: $($service.Status)"
}

Write-Host "`nUpdate complete!"
Write-Host "You can access the service at:"
Write-Host "HTTPS: https://kfg_server:3001"
Write-Host "HTTP:  http://kfg_server:3001"
Write-Host "Example redirect: https://kfg_server:3001/client/`$2065550199"