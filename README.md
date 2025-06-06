# CRM Screen Pop Tool

A tool for managing phone number to CRM URL mappings and handling automatic redirects.

## Current Status (Last Updated: Current Session)

### What Works
- ✅ SQL Server connection established and tested
- ✅ Database table 'entries' created successfully
- ✅ React TypeScript frontend with Material-UI
- ✅ Form for individual entries implemented
- ✅ CSV batch upload functionality implemented
- ✅ TypeScript type definitions configured
- ✅ API routes implemented and tested

### Pending
- Testing of individual entry functionality
- Testing of batch upload functionality
- Testing of redirect functionality
- Production deployment configuration

## Features

- Manage phone number to CRM URL mappings
- Batch upload via CSV
- Automatic redirection based on phone number
- Modern Material-UI interface
- SQL Server backend integration

## Prerequisites

- Node.js 14+
- SQL Server (tested with SQL Server Express)
- A database named 'KingVVApp'
- SQL Server credentials (KingVictorVector user)

## Setup

### Database Setup
1. Ensure SQL Server is running (KFG_Server\SQLEXPRESS instance)
2. Verify KingVVApp database exists
3. Create the entries table:
   ```sql
   CREATE TABLE entries (
     phone VARCHAR(20) PRIMARY KEY,
     url VARCHAR(500) NOT NULL
   );
   ```

### Application Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   DB_HOST=KFG_Server\\SQLEXPRESS
   DB_NAME=KingVVApp
   DB_USER=KingVictorVector
   DB_PASSWORD=your_password_here
   PORT=3001
   NODE_ENV=development
   ```

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

## Usage

### 1. Individual Entry Management
- Add new entries with phone numbers and CRM URLs
- Delete existing entries
- View all current entries

### 2. Batch Upload
- Upload CSV files with phone numbers and CRM URLs
- Format: `phone_number,crm_url` (one entry per line)
- Example: `2065550123,https://crm.example.com/contact/123`

### 3. Redirect Functionality
- Use the format: http://localhost:3000/redirect/{phone_number}
- The tool will automatically redirect to the corresponding CRM URL

## Production Deployment

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Set the following environment variables:
   ```
   NODE_ENV=production
   FRONTEND_URL=your_frontend_url
   ```

3. Deploy the built files and start the server:
   ```bash
   npm run server
   ```

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