# Fix Google Sheets Integration

## Issue
The Google Sheets API is not enabled for your project, which is why attendance data is not being synced to Google Sheets.

## Solution Steps

### 1. Enable Google Sheets API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `attendancectf`
3. Go to **APIs & Services** > **Library**
4. Search for "Google Sheets API"
5. Click on it and press **Enable**

### 2. Verify Service Account Permissions
1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1dP_nCefeXfha3RtDW5lGh_FhubKGW8w5-D27-GadM1k
2. Click **Share** button
3. Add the service account email: `firebase-adminsdk-fbsvc@attendancectf.iam.gserviceaccount.com`
4. Give it **Editor** permissions
5. Click **Send**

### 3. Test the Connection
Run this command to test if Google Sheets is working:
```bash
cd backend
node test-google-sheets.js
```

### 4. Check Server Logs
When users scan QR codes, you should see these logs in the server console:
- `🔄 Attempting to sync to Google Sheets:`
- `📊 Data to write to sheets:`
- `✅ Successfully synced to Google Sheets`

## Expected Google Sheets Format
The dat