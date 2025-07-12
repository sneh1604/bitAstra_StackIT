const fetch = require('node-fetch');

async function testAPI() {
    try {
        console.log('Testing backend API...');
        
        // Test the questions endpoint
        const response = await fetch('http://localhost:5000/api/questions');
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Response data:', JSON.stringify(data, null, 2));
        } else {
            const errorText = await response.text();
            console.error('Error response:', errorText);
        }
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testAPI(); 