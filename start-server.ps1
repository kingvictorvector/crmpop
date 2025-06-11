$env:NODE_OPTIONS = "--experimental-specifier-resolution=node"
Write-Host "Starting server with NODE_OPTIONS: $env:NODE_OPTIONS"
npx ts-node-dev --transpile-only src/server.ts 