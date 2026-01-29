const { google } = require('googleapis');

const getGoogleSheetsClient = async () => {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
        console.log('Google Sheets credentials not configured');
        return null;
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    return sheets;
};

const appendToSheet = async (data) => {
    try {
        const sheets = await getGoogleSheetsClient();
        if (!sheets || !process.env.GOOGLE_SHEETS_ID) {
            console.log('Google Sheets not configured, skipping...');
            return false;
        }

        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEETS_ID,
            range: 'Sheet1!A:E',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[
                    data.regNo,
                    data.name,
                    data.date,
                    data.punchTime,
                    data.status
                ]]
            }
        });

        return true;
    } catch (error) {
        console.error('Google Sheets error:', error.message);
        return false;
    }
};

module.exports = { appendToSheet, getGoogleSheetsClient };
