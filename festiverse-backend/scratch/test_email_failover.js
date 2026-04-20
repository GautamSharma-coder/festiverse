require('dotenv').config();
const { sendEmail } = require('../src/config/emailClient');

async function testFailover() {
    console.log('--- Testing Email Failover Logic ---');
    
    const testTo = 'gautamksharma45@gmail.com'; // Use a test email
    const subject = 'Test Dual Email Service - Festiverse 26';
    const body = '<h1>Test</h1><p>If you see this, the failover logic was at least executed.</p>';

    try {
        console.log('\nCase 1: Attempting send (will try Resend first)...');
        await sendEmail(testTo, subject, body);
        console.log('Success (one of the services worked)');
    } catch (err) {
        console.error('All services failed as expected if no keys are set:', err.message);
    }
}

testFailover();
