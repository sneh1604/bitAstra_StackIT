const fetch = require('node-fetch');

async function testAdminAPI() {
    try {
        console.log('Testing admin API endpoints...');
        
        // Test admin stats endpoint
        console.log('\n1. Testing admin stats...');
        const statsResponse = await fetch('http://localhost:5000/api/admin/stats', {
            headers: {
                'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE'
            }
        });
        console.log('Stats response status:', statsResponse.status);
        
        if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            console.log('Stats data:', statsData);
        } else {
            const errorText = await statsResponse.text();
            console.error('Stats error:', errorText);
        }

        // Test admin users endpoint
        console.log('\n2. Testing admin users...');
        const usersResponse = await fetch('http://localhost:5000/api/admin/users', {
            headers: {
                'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE'
            }
        });
        console.log('Users response status:', usersResponse.status);
        
        if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            console.log('Users data:', usersData);
        } else {
            const errorText = await usersResponse.text();
            console.error('Users error:', errorText);
        }

        // Test admin reports endpoint
        console.log('\n3. Testing admin reports...');
        const reportsResponse = await fetch('http://localhost:5000/api/admin/reports', {
            headers: {
                'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE'
            }
        });
        console.log('Reports response status:', reportsResponse.status);
        
        if (reportsResponse.ok) {
            const reportsData = await reportsResponse.json();
            console.log('Reports data:', reportsData);
        } else {
            const errorText = await reportsResponse.text();
            console.error('Reports error:', errorText);
        }

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testAdminAPI(); 