const { google } = require('googleapis');
require('dotenv').config();

const testGoogleSheets = async () => {
    try {
        console.log('Testing Google Sheets connection...');
        
        // Check environment variables
        console.log('GOOGLE_SHEETS_ID:', process.env.GOOGLE_SHEETS_ID ? 'Set' : 'Missing');
        console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? 'Set' : 'Missing');
        console.log('GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? 'Set' : 'Missing');

        if (!process.env.GOOGLE_SHEETS_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
            console.log('❌ Missing Google Sheets configuration');
            return;
        }

        // Create auth
        const auth = new google.auth.JWT(
            process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            null,
            process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            ['https://www.googleapis.com/auth/spreadsheets']
        );

        const sheets = google.sheets({ version: 'v4', auth });

        // Test connection by getting sheet info
        console.log('Testing sheet access...');
        const sheetInfo = await sheets.spreadsheets.get({
            spreadsheetId: process.env.GOOGLE_SHEETS_ID
        });

        console.log('✅ Successfully connected to Google Sheets');
        console.log('Sheet title:', sheetInfo.data.properties.title);
        console.log('Sheet URL:', `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEETS_ID}`);

        // Test writing data
        console.log('Testing data write...');
        const testData = [
            new Date().toISOString().split('T')[0], // Date
            'Test User',                            // Name
            'test@example.com',                     // Email
            'IN',                                   // Type
            new Date().toLocaleTimeString('en-IN'), // Time
            '0 mins'                                // Duration
        ];

        const result = await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEETS_ID,
            range: 'Sheet1!A:F',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [testData]
            }
        });

        console.log('✅ Successfully wrote test data to Google Sheets');
        console.log('Updated range:', result.data.updates.updatedRange);

    } catch (error) {
        console.error('❌ Google Sheets test failed:', error.message);
        
        if (error.message.includes('403')) {
            console.log('💡 This might be a permissions issue. Make sure:');
            console.log('   1. The service account email has edit access to the sheet');
            console.log('   2. The sheet ID is correct');
        }
        
        if (error.message.includes('404')) {
            console.log('💡 Sheet not found. Check the GOOGLE_SHEETS_ID in .env');
        }
    }
};

testGoogleSheets();