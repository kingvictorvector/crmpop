# CRM Screen Pop Tool

## Overview
This tool provides a simple Node.js/HTML interface for mapping phone numbers to CRM URLs (Redtail CRM), supporting batch upload, search, and redirect functionality. It connects to a SQL Server database and can be run locally or deployed on a LAN server.

## Features
- Add, update, and delete phone-to-CRM URL entries
- Batch upload via CSV
- Test redirect for a phone number
- Multi-select delete
- Supports direct URL requests: `/client/$PHONENUMBER` for CRM pop

## Local Development Setup

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd <your-repo-directory>
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up your `.env` file:**
   Create a `.env` file in the project root with:
   ```env
   DB_HOST=localhost
   DB_PORT=1433
   DB_NAME=KingVVApp
   DB_USER=KingVictorVector
   DB_PASSWORD=your_password_here
   PORT=3001
   NODE_ENV=development
   ```

4. **Set up SQL Server:**
   - Install SQL Server Express (if not already installed)
   - Create the `KingVVApp` database
   - Ensure the `entries` table exists:
     ```sql
     CREATE TABLE entries (
         phone VARCHAR(20) PRIMARY KEY,
         url VARCHAR(500) NOT NULL
     );
     ```
   - Create the SQL login `KingVictorVector` and grant access.

5. **Run the server:**
   ```sh
   node server.cjs
   ```
   The app will be available at [http://localhost:3001](http://localhost:3001)

## Usage
- **Web UI:** Add, batch upload, delete, and test entries via the browser.
- **Direct URL pop:**
  - Use `http://localhost:3001/client/$PHONENUMBER` to trigger a CRM redirect for a given phone number.

## Deployment on LAN Server

When ready to deploy on your LAN server:

1. **Pull the latest code:**
   ```sh
   git pull origin main
   ```
2. **Update the `.env` file** with your server's SQL Server settings:
   ```env
   DB_HOST=KFG_Server
   DB_INSTANCE=SQLEXPRESS  # or DB_PORT=1433 if using a static port
   DB_NAME=KingVVApp
   DB_USER=KingVictorVector
   DB_PASSWORD=your_server_password
   PORT=3001
   NODE_ENV=production
   ```
3. **Ensure SQL Server is running and accessible**
   - Enable TCP/IP in SQL Server Configuration Manager
   - Start SQL Server Browser if using named instances
   - Confirm firewall allows traffic on the SQL port

4. **Run the server:**
   ```sh
   node server.cjs
   ```

5. **Access the app from LAN:**
   - Use the server's IP address, e.g. `http://<server-ip>:3001`
   - Use `/client/$PHONENUMBER` for direct CRM pop

## Notes
- All phone numbers should be 10 digits, no spaces or special characters.
- CRM URLs should be in the format: `https://crm.redtailtechnology.com/contacts/2726`
- For batch upload, use a CSV with lines like: `2063246789,https://crm.redtailtechnology.com/contacts/2726`

## Troubleshooting
- If you get a login error, double-check your `.env` credentials and SQL login permissions.
- If delete or batch upload fails, check for spaces or formatting issues in phone numbers.
- Use browser dev tools and backend logs for debugging.

---

**Ready to deploy!** 