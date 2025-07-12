const fetch = require('node-fetch');

async function testSimpleAPI() {
    try {
        console.log('Testing simple questions API...');
        
        // Test the base questions endpoint without any parameters
        const response = await fetch('http://localhost:5000/api/questions');
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Response data:', JSON.stringify(data, null, 2));
            
            if (data.success && data.data) {
                console.log(`Found ${data.data.length} questions`);
                if (data.data.length > 0) {
                    console.log('First question:', data.data[0]);
                }
            }
        } else {
            const errorText = await response.text();
            console.error('Error response:', errorText);
        }
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testSimpleAPI(); 