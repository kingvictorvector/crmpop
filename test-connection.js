const sql = require('mssql');

const config = {
    server: process.env.REACT_APP_SQL_SERVER || 'KFG_Server',
    database: process.env.REACT_APP_SQL_DATABASE || 'KingVVApp',
    options: {
        instanceName: process.env.REACT_APP_SQL_INSTANCE || 'SQLEXPRESS',
        trustServerCertificate: true,
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    // Using Windows Authentication
    trustedConnection: true
};

async function testConnection() {
    try {
        console.log('Attempting to connect to SQL Server...');
        console.log('Connection config:', {
            server: config.server,
            database: config.database,
            instance: config.options.instanceName
        });
        
        await sql.connect(config);
        const result = await sql.query('SELECT @@VERSION as version');
        console.log('\nConnection successful!');
        console.log('SQL Server version:', result.recordset[0].version);
    } catch (err) {
        console.error('\nError connecting to SQL Server:', err);
    } finally {
        await sql.close();
    }
}

testConnection(); 