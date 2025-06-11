# Update script
$ErrorActionPreference = "Stop"

Write-Host "Stopping CRMPopService..."
Stop-Service CRMPopService -Force

Write-Host "Pulling latest changes from Git..."
git fetch
if ($LASTEXITCODE -ne 0) {
    Write-Error "Git fetch failed"
    exit 1
}

git reset --hard origin/main
if ($LASTEXITCODE -ne 0) {
    Write-Error "Git reset failed"
    exit 1
}

Write-Host "Installing dependencies..."
# Force TypeScript to version 4.9.5 for react-scripts compatibility
npm install typescript@4.9.5 --save-exact
npm install --verbose
if ($LASTEXITCODE -ne 0) {
    Write-Error "npm install failed"
    exit 1
}

Write-Host "Cleaning previous build..."
if (Test-Path "dist") {
    Remove-Item -Recurse -Force dist
}
if (Test-Path "build") {
    Remove-Item -Recurse -Force build
}

Write-Host "Building client..."
$env:CI = "false"  # Prevents treating warnings as errors
$env:SKIP_PREFLIGHT_CHECK = "true"  # Skip TypeScript version check
npm run build:client --verbose
if ($LASTEXITCODE -ne 0) {
    Write-Error "Client build failed"
    exit 1
}

Write-Host "Building server..."
npm run build:server --verbose
if ($LASTEXITCODE -ne 0) {
    Write-Error "Server build failed"
    exit 1
}

Write-Host "Verifying build output..."
if (-not (Test-Path "dist/server/server.js")) {
    Write-Error "Build failed: server.js not found in dist/server folder"
    exit 1
}

Write-Host "Starting service..."
Start-Service CRMPopService
Start-Sleep -Seconds 5  # Give the service time to start
$service = Get-Service CRMPopService
if ($service.Status -ne "Running") {
    Write-Error "Service failed to start. Status: $($service.Status)"
    Write-Host "Checking Windows Event Log for errors..."
    Get-EventLog -LogName Application -Source "CRMPopService" -Newest 10
    exit 1
}

Write-Host "Update complete! Service is running."