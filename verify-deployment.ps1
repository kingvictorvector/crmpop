# Verify Node.js installation
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
$nodeVersion = node -v
$npmVersion = npm -v
Write-Host "Node.js version: $nodeVersion"
Write-Host "npm version: $npmVersion"

# Verify NSSM installation
Write-Host "`nChecking NSSM installation..." -ForegroundColor Yellow
$nssmPath = (Get-Command nssm -ErrorAction SilentlyContinue).Path
if ($nssmPath) {
    Write-Host "NSSM is installed at: $nssmPath"
} else {
    Write-Host "NSSM is not installed!" -ForegroundColor Red
    Write-Host "Please run: choco install nssm -y"
    exit 1
}

# Check if service exists
Write-Host "`nChecking CRMPopService..." -ForegroundColor Yellow
$service = Get-Service -Name "CRMPopService" -ErrorAction SilentlyContinue
if ($service) {
    Write-Host "Service Status: $($service.Status)"
    Write-Host "Start Type: $($service.StartType)"
} else {
    Write-Host "CRMPopService not found!" -ForegroundColor Red
    exit 1
}

# Check if port 3001 is listening
Write-Host "`nChecking port 3001..." -ForegroundColor Yellow
$portCheck = netstat -ano | findstr :3001 | findstr LISTENING
if ($portCheck) {
    Write-Host "Port 3001 is active and listening"
} else {
    Write-Host "Port 3001 is not listening!" -ForegroundColor Red
    Write-Host "Checking service logs..."
    $logs = nssm get CRMPopService AppStderr
    if ($logs) {
        Write-Host "Recent error logs:"
        Get-Content $logs -Tail 10
    }
}

# Test database connection
Write-Host "`nTesting database connection..." -ForegroundColor Yellow
$testDbScript = Join-Path $PSScriptRoot "dist\test-db.js"
if (Test-Path $testDbScript) {
    node $testDbScript
} else {
    Write-Host "Database test script not found!" -ForegroundColor Red
}

# Test web server
Write-Host "`nTesting web server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing
    Write-Host "Web server responded with status code: $($response.StatusCode)"
} catch {
    Write-Host "Could not connect to web server!" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "`nVerification complete!" -ForegroundColor Green
Write-Host "If all checks passed, the application should be available at: http://KFG_Server:3001" 