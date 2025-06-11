# Verify Git is installed
$gitVersion = git --version
if (-not $?) {
    Write-Host "Git is not installed. Installing with Chocolatey..."
    choco install git -y
}

# Verify if we're in a Git repository
if (-not (Test-Path .git)) {
    Write-Host "Initializing fresh Git clone..."
    git clone https://github.com/kingvictorvector/kingvv-app.git .
} else {
    Write-Host "Updating existing repository..."
    git fetch
    git reset --hard origin/main  # or whatever your main branch is named
}

# Stop any existing node processes on port 3001
$processId = netstat -ano | findstr :3001 | findstr LISTENING
if ($processId) {
    $processId = $processId.Split(' ')[-1]
    taskkill /PID $processId /F
}

# Install dependencies and build
npm install
npm run build

# Create a Windows service for the application
$serviceName = "CRMPopService"
$serviceDescription = "CRM Screen Pop Tool Service"
$workingDirectory = Get-Location
$nodePath = "C:\Program Files\nodejs\node.exe"
$scriptPath = Join-Path $workingDirectory "dist\server.js"

# Check if NSSM is installed
$nssmPath = (Get-Command nssm -ErrorAction SilentlyContinue).Path
if (-not $nssmPath) {
    Write-Host "NSSM is not installed. Installing with Chocolatey..."
    choco install nssm -y
}

# Check if the service already exists
$service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue

if ($service) {
    # Stop and remove existing service
    Stop-Service -Name $serviceName
    sc.exe delete $serviceName
}

# Create new service using NSSM
nssm install $serviceName $nodePath $scriptPath
nssm set $serviceName Description $serviceDescription
nssm set $serviceName AppDirectory $workingDirectory
nssm set $serviceName AppEnvironmentExtra "NODE_ENV=production"
nssm set $serviceName Start SERVICE_AUTO_START

# Start the service
Start-Service -Name $serviceName

Write-Host "Deployment complete. Service is running at http://KFG_Server:3001"
Write-Host "To check service status: Get-Service -Name $serviceName"

# Create an update script for future updates
@"
# Update script
Write-Host "Pulling latest changes from Git..."
git fetch
git reset --hard origin/main

Write-Host "Installing dependencies..."
npm install

Write-Host "Building application..."
npm run build

Write-Host "Restarting service..."
Restart-Service CRMPopService

Write-Host "Update complete!"
"@ | Out-File -FilePath "update.ps1" -Encoding UTF8

Write-Host "`nCreated update.ps1 script for future updates."
Write-Host "To update in the future, just run: .\update.ps1" 