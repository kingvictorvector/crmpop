const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_API_URL 
    : 'http://localhost:3001/api';

async function testAPIEndpoints() {
    try {
        console.log('Step 1: Testing API server availability...');
        const healthCheck = await axios.get(`${API_BASE_URL}/entries`);
        console.log('✅ API server is responding');
        console.log(`ℹ️ Status: ${healthCheck.status}`);

        console.log('\nStep 2: Testing entry creation...');
        const testEntry = {
            phone: '9876543210',
            url: 'https://test-api.com/contact'
        };
        
        const createResponse = await axios.post(`${API_BASE_URL}/entries`, testEntry);
        console.log('✅ Successfully created test entry');
        console.log(`ℹ️ Response status: ${createResponse.status}`);

        console.log('\nStep 3: Testing entry retrieval...');
        const getResponse = await axios.get(`${API_BASE_URL}/entries/${testEntry.phone}`);
        console.log('✅ Successfully retrieved test entry');
        console.log('ℹ️ Retrieved data:', getResponse.data);

        console.log('\nStep 4: Testing entry cleanup...');
        const deleteResponse = await axios.delete(`${API_BASE_URL}/entries/${testEntry.phone}`);
        console.log('✅ Successfully deleted test entry');
        console.log(`ℹ️ Response status: ${deleteResponse.status}`);

        console.log('\nStep 5: Testing static file serving...');
        const staticResponse = await axios.get('http://localhost:3001/');
        console.log('✅ Successfully accessed static files');
        console.log(`ℹ️ Response status: ${staticResponse.status}`);

        console.log('\n✅ ALL API TESTS PASSED! ✅');

    } catch (err) {
        console.error('\n❌ API test failed!');
        if (axios.isAxiosError(err)) {
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
        } else if (err instanceof Error) {
            console.error('Error details:', {
                message: err.message,
                stack: err.stack
            });
        }

        console.log('\n🔍 Troubleshooting steps:');
        console.log('1. Verify server is running:');
        console.log('   - Check if npm run server is running');
        console.log('   - Verify port 3001 is not in use');
        console.log('2. Check environment variables:');
        console.log('   - Verify REACT_APP_API_URL in .env');
        console.log('3. Check network:');
        console.log('   - Try accessing http://localhost:3001 in browser');
        console.log('   - Check for firewall blocking');
        process.exit(1);
    }
}

testAPIEndpoints(); 