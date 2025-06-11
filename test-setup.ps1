# Test setup script for CRMPop
$ErrorActionPreference = "Stop"

Write-Host "Step 1: Checking .env file..." -ForegroundColor Cyan
$envPath = ".\.env"
if (-not (Test-Path $envPath)) {
    Write-Host ".env file not found. Creating it..." -ForegroundColor Yellow
    @"
DB_USER=KingVictorVector
DB_PASSWORD=your_password_here
DB_NAME=KingVVApp
REACT_APP_API_URL=http://localhost:3001/api
PORT=3001
"@ | Out-File -FilePath $envPath -Encoding UTF8
    Write-Host ".env file created. Please edit it with your actual database password." -ForegroundColor Green
} else {
    Write-Host ".env file exists" -ForegroundColor Green
}

Write-Host "`nStep 2: Checking SQL Server connection..." -ForegroundColor Cyan
try {
    $sqlInstance = "KFG_Server\SQLEXPRESS"
    $query = "SELECT @@VERSION as Version"
    $result = Invoke-Sqlcmd -ServerInstance $sqlInstance -Query $query -ErrorAction Stop
    Write-Host "Successfully connected to SQL Server!" -ForegroundColor Green
    Write-Host "SQL Server Version: $($result.Version)"
} catch {
    Write-Host "Failed to connect to SQL Server" -ForegroundColor Red
    Write-Host "Error: $_"
    Write-Host "`nTroubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Verify SQL Server is running:"
    Write-Host "   Get-Service 'MSSQL$SQLEXPRESS' | Select Status"
    Write-Host "2. Check if you can ping the server:"
    Write-Host "   ping KFG_Server"
    Write-Host "3. Verify SQL Server Browser service is running:"
    Write-Host "   Get-Service 'SQLBrowser' | Select Status"
}

Write-Host "`nStep 3: Testing Node.js installation..." -ForegroundColor Cyan
try {
    $nodeVersion = node -v
    $npmVersion = npm -v
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js or npm not found!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/"
}

Write-Host "`nStep 4: Checking required ports..." -ForegroundColor Cyan
$port = 3001
$testConnection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
if ($testConnection.TcpTestSucceeded) {
    Write-Host "Warning: Port $port is already in use!" -ForegroundColor Yellow
    Write-Host "To find what's using it, run:" -ForegroundColor Yellow
    Write-Host "netstat -ano | findstr :$port"
} else {
    Write-Host "Port $port is available" -ForegroundColor Green
}

Write-Host "`nStep 5: Testing npm dependencies..." -ForegroundColor Cyan
if (Test-Path ".\node_modules") {
    Write-Host "node_modules exists" -ForegroundColor Green
} else {
    Write-Host "node_modules not found. Running npm install..." -ForegroundColor Yellow
    npm install
}

Write-Host "`nSetup test complete!" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit the .env file with your actual database password"
Write-Host "2. Run 'npm run test-db' to test database connection"
Write-Host "3. Run 'npm run test-api' to test API endpoints" 