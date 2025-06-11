# CRM Screen Pop Tool

A web-based tool for managing CRM redirects based on phone numbers. This application runs on a single server and provides browser-based access for all employees.

## Development Progress

✅ Completed:
- Database connection established and tested
- Basic CRUD operations implemented
- Frontend UI with Material-UI components
- Phone number to CRM URL mapping functionality
- Redirect endpoint functionality
- Git repository initialized
- Development environment tested
- Production build configuration
- TypeScript ESM configuration

🔄 In Progress:
- UI entry creation debugging
- Production environment testing
- Performance optimization

🔜 Next Steps:
- Load testing with multiple concurrent users
- Monitoring setup
- Backup procedures implementation

## Current Status (Last Updated: Current Session)

### What Works
- ✅ SQL Server connection established and tested
- ✅ Database table 'entries' created successfully
- ✅ React TypeScript frontend with Material-UI
- ✅ Production build configuration
- ✅ Server-side TypeScript compilation
- ✅ Static file serving
- ✅ API routes implemented
- ✅ Development environment

### Pending
- ⏳ Fix entry creation through UI
- Testing of batch upload functionality
- Testing of redirect functionality
- Production deployment testing

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