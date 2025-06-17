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
Write-Host "http://KFG_Server:3001"
Write-Host "Example redirect: http://KFG_Server:3001/client/`$2065550199"