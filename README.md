# CRM Pop Service

A lightweight Node.js service that redirects phone numbers to their corresponding CRM URLs. This service is designed to run on an internal network and provide quick access to CRM records based on phone numbers.

## Current Status (Last Updated)

✅ **What's Working:**
- Basic Node.js server running on port 3001
- Database connection to KFG_Server\SQLEXPRESS confirmed
- Phone number to CRM URL redirection working
- Simple HTML interface added
- Deployment script (update.ps1) updated for simplified service

🔄 **Last Known State:**
- Server responds to URLs in format: `http://localhost:3001/crmpop/redirect/$PHONENUMBER`
- Test phone number (2065550199) redirects to https://test-crm.com/contact/test123
- All changes pushed to git repository

## Resuming Development

### 1. Local Development Machine
```powershell
# Clone repository if starting fresh, or pull if existing:
git pull

# Start the server:
node test-redirect.cjs

# Test the service:
http://localhost:3001/crmpop/redirect/$2065550199
```

### 2. Server Deployment
```powershell
# Pull latest changes:
git pull

# Run deployment script:
.\update.ps1
```

## Essential Files

- `test-redirect.cjs` - Main server file
- `index.html` - Simple interface
- `package.json` - Dependencies
- `.env` - Database configuration (not in git)
- `update.ps1` - Deployment script

## Database Configuration

The `.env` file should contain:
```env
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=KFG_Server\SQLEXPRESS
DB_NAME=KingVVApp
```

## URL Patterns

- Root interface: `http://localhost:3001/`
- Redirect format: `http://localhost:3001/crmpop/redirect/$PHONENUMBER`
- Example: `http://localhost:3001/crmpop/redirect/$2065550199`

## Next Steps

1. **Testing Needed:**
   - Verify redirects work on server machine
   - Test access from other machines on LAN
   - Confirm database queries with different phone numbers

2. **Potential Improvements:**
   - Add logging for troubleshooting
   - Implement error handling pages
   - Add Windows Service setup for automatic startup

## Troubleshooting

1. If server won't start:
   - Check if port 3001 is available
   - Verify database credentials in .env
   - Ensure SQL Server is running

2. If redirects aren't working:
   - Verify phone number exists in database
   - Check network connectivity
   - Review server logs

## Support

For internal support or questions, contact the development team. 