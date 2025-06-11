# CRM Screen Pop Tool

## Project Overview
Internal tool for employees within company firewall that redirects phone numbers to corresponding CRM URLs.

### Key Features
- Visit `/redirect/{phone_number}` to get redirected to corresponding CRM URL
- Web interface for managing phone-to-URL mappings
- SQL Server database for storage
- All components run on internal network

## Current Status

### What's Working
- ✅ Database connection to KFG_Server\SQLEXPRESS confirmed
- ✅ Table structure: entries(phone VARCHAR(20), url VARCHAR(500))
- ✅ Test data verified: phone=2065550199, url=https://test-crm.com/contact/test123
- ✅ CRUD operations tested successfully
- ✅ Project structure and files set up
- ✅ Configuration files created

### Current Issues
- ⚠️ Server startup issues with module system (ES Modules vs CommonJS conflict)
- ⚠️ TypeScript type checking errors in server code
- ⚠️ Need to resolve path and directory issues

## Next Steps
1. Restart Cursor using the workspace configuration file:
   - Open `crmpop/crmpop.code-workspace`
   - This will ensure correct directory and TypeScript settings

2. Fix server startup issues:
   - Resolve module system conflicts
   - Address TypeScript configuration
   - Test server connectivity

3. Implement remaining features:
   - Complete phone number redirect endpoint
   - Build management interface
   - Add authentication
   - Set up logging

## Development Setup

### Prerequisites
- Node.js 18.x LTS
- SQL Server Express 2019
- Access to internal network

### Configuration Files
- `.vscode/settings.json` - Editor and TypeScript settings
- `crmpop.code-workspace` - Workspace configuration
- `tsconfig.json` - TypeScript configuration for client
- `tsconfig.server.json` - TypeScript configuration for server
- `.npmrc` - NPM configuration

### Environment Variables
```env
DB_HOST=KFG_Server\SQLEXPRESS
DB_NAME=KingVVApp
DB_USER=KingVictorVector
DB_PASSWORD=your_password_here
PORT=3001
NODE_ENV=development
```

### Running the Project
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start server only
npm run server

# Start client only
npm run start
```

## Database Schema
```sql
CREATE TABLE entries (
    id INT PRIMARY KEY IDENTITY(1,1),
    phone VARCHAR(20) NOT NULL,
    url VARCHAR(500) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT UQ_phone_number UNIQUE (phone)
);
```

## Features

- Manage phone number to CRM URL mappings
- Batch upload via CSV
- Automatic redirection based on phone number
- Modern Material-UI interface
- SQL Server backend integration

## Prerequisites

- Node.js 18+ installed on the server
- SQL Server Express installed and running
- Git for deployment
- Windows PowerShell or Command Prompt
- Visual Studio Code (recommended) or Cursor IDE

## Installation

1. Clone this repository on KFG_Server (PowerShell):
```powershell
git clone [repository-url]
cd crmpop
```

2. Install dependencies:
```powershell
npm install
```

3. Create a `.env` file in the root directory with the following content:
```env
DB_SERVER=KFG_Server\\SQLEXPRESS
DB_NAME=KingVVApp
DB_USER=KingVictorVector
DB_PASSWORD=your_password_here
PORT=3001
NODE_ENV=development  # Change to 'production' for deployment
```

4. Build the production version:
```powershell
npm run win-build
```

5. Start the server:
```powershell
npm run win-start-prod
```

The application will be available at `http://KFG_Server:3001`

## Usage

- Access the management interface at `http://KFG_Server:3001`
- Redirect URLs follow the pattern: `http://KFG_Server:3001/redirect/{phone_number}`
- Use the interface to:
  - Add individual entries
  - Upload batch entries
  - Manage existing entries
  - Test redirects

## Database Setup

The application requires a SQL Server database with the following table:

```sql
CREATE TABLE entries (
    phone VARCHAR(20) PRIMARY KEY,
    url VARCHAR(500) NOT NULL
);
```

## Maintenance

- Logs are stored in the `logs` directory
- Regular database backups are recommended
- Monitor server resources and SQL Server performance

## Support

For internal support, contact the IT department.

## Development

### Windows Development Commands

1. Clean build directories:
```powershell
npm run win-clean
```

2. Start development environment (starts both frontend and backend):
```powershell
npm run win-start-dev
```

3. Start servers separately if needed:
   
   Backend server:
   ```powershell
   npm run server
   ```
   The backend will run on http://localhost:3001

   Frontend development server:
   ```powershell
   npm start
   ```
   The frontend will run on http://localhost:3000

### Testing Database Connection

Test the database connection:
```powershell
npm run test-db
```

### PowerShell Command Notes
- Use semicolons (;) instead of && for command chaining
- Use backslashes (\\) for file paths
- Use $env:VAR_NAME for environment variables

## Troubleshooting

### Port Issues
- If port 3000 is in use, React will prompt to use a different port
- If port 3001 is in use, modify the PORT in .env file

### Process Management
Kill existing Node.js processes (Windows PowerShell):
```powershell
taskkill /F /IM node.exe
```

Check if ports are in use:
```powershell
netstat -ano | findstr "3000"
netstat -ano | findstr "3001"
```

### Database Connection Issues
1. Verify SQL Server is running:
```powershell
Get-Service -Name "MSSQL$SQLEXPRESS"
```

2. Check SQL Server Configuration Manager for:
   - TCP/IP protocol enabled
   - SQL Server Browser service running
   ```powershell
   Get-Service -Name "SQLBrowser"
   ```

3. Test database connection:
```powershell
npm run test-db
```

### Common Error Solutions
- "Module not found" errors: Run `npm install` again
- TypeScript errors: Clear the dist folder with `npm run win-clean`
- Port in use: Use the netstat command above to find and kill the process

## Development

1. Start the backend server:
   ```bash
   npm run server
   ```
   The backend will run on http://localhost:3001

2. In a separate terminal, start the frontend:
   ```bash
   npm start
   ```
   The frontend will run on http://localhost:3000

## Troubleshooting

### Port Issues
- If port 3000 is in use, React will prompt to use a different port
- If port 3001 is in use, modify the PORT environment variable

### Process Management
- To kill existing Node.js processes (Windows):
  ```powershell
  taskkill /F /IM node.exe
  ```

### Database Connection
- Verify SQL Server is running
- Check SQL Server Configuration Manager for:
  - TCP/IP protocol enabled
  - SQL Server Browser service running
- Test connection using the test script:
  ```bash
  npm run test-db
  ``` 