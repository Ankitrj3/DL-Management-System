# DL Management System - Duty Leave Tracker

A modern attendance management system for tracking duty leaves of the core tech team using QR codes.

## 🌟 Features

- **Daily QR Codes**: Auto-generated unique QR codes for each day
- **Secure Login**: Role-based authentication for students and admins
- **QR Scanner**: In-app scanner for punching attendance
- **Real-time Tracking**: Instant attendance updates
- **Admin Dashboard**: View all attendance records
- **CSV Export**: Download attendance data as CSV
- **Google Sheets Integration**: Optional sync to Google Sheets

## 🛠️ Tech Stack

- **Frontend**: React.js + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT

## 📁 Project Structure

```
DL-Management-System/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── server.js        # Entry point
│   └── seed.js          # Database seeder
└── frontend/
    ├── src/
    │   ├── components/  # React components
    │   ├── context/     # Auth context
    │   ├── pages/       # Page components
    │   └── services/    # API services
    └── index.html
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the Repository

```bash
cd /Users/ankitrj3/Desktop/DL-Management-System
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Configure `.env` file (already created with defaults):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dl-management
JWT_SECRET=dl-management-super-secret-key-2024
```

### 3. Seed the Database

This creates all student accounts and admin accounts:

```bash
npm run seed
# OR
node seed.js
```

### 4. Start Backend Server

```bash
npm run dev
# Server runs on http://localhost:5000
```

### 5. Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

## 👥 User Credentials

### Admin Accounts

| Email | Password |
|-------|----------|
| tech.smani@gmail.com | 15aGG15@ |
| ankitrobinranjan@gmail.com | 15aGG15@ |

### Student Accounts

Password format: `firstname + regNo + @`

| Name | Reg No | Password |
|------|--------|----------|
| Paramjit Singh | 12311061 | paramjit12311061@ |
| Parth Narula | 12500362 | parth12500362@ |
| Ashish Kumar Singh | 12300608 | ashish12300608@ |
| Yash Yadav | 12309583 | yash12309583@ |
| Prabal | 12512197 | prabal12512197@ |
| Aryan Kumar | 12218679 | aryan12218679@ |
| Kumar Ayush | 12310661 | kumar12310661@ |
| Shaun Beniel Edwin | 12218394 | shaun12218394@ |
| Md Arfaa Taj | 12313447 | md12313447@ |
| Anubhav Jaiswal | 12302387 | anubhav12302387@ |
| Anshul Choudhary | 12205969 | anshul12205969@ |
| Gagandeep Singh | 12322960 | gagandeep12322960@ |
| Shashank Pandey | 12317758 | shashank12317758@ |
| Priya Jantwal | 12320951 | priya12320951@ |
| Aditya Raj | 12307796 | aditya12307796@ |
| Ankit Ranjan | 12000777 | ankit12000777@ |
| Rajvardhan Singh | 12303815 | rajvardhan12303815@ |
| Guddu Kumar Das | 12309867 | guddu12309867@ |
| Shashi Mani Kumar | 12313181 | shashi12313181@ |

## 📱 Usage

### For Admins

1. Login with admin credentials
2. Navigate to "QR Code" to generate today's QR
3. Display the QR on a screen for students to scan
4. View attendance in "Attendance" tab
5. Download CSV reports as needed

### For Students

1. Login with your registration number and password
2. Go to "Scan QR" page
3. Point camera at the displayed QR code
4. Attendance is automatically recorded!

## 🔧 API Endpoints

### Auth
- `POST /api/auth/login` - Student login
- `POST /api/auth/admin/login` - Admin login
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/students` - Get all students (admin only)

### QR Code
- `POST /api/qr/generate` - Generate daily QR (admin only)
- `GET /api/qr/today` - Get today's QR
- `POST /api/qr/validate` - Validate QR code

### Attendance
- `POST /api/attendance/punch` - Punch attendance
- `GET /api/attendance/my` - Get user's attendance
- `GET /api/attendance/status` - Get today's status
- `GET /api/attendance/all` - Get all attendance (admin)
- `GET /api/attendance/today` - Get today's attendance (admin)
- `GET /api/attendance/download` - Download CSV (admin)
- `GET /api/attendance/stats` - Get statistics (admin)

## 📊 Google Sheets Integration (Optional)

1. Create a Google Cloud project
2. Enable Google Sheets API
3. Create a service account
4. Share your Google Sheet with the service account email
5. Update `.env` with credentials:
   - `GOOGLE_SHEETS_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`

## 📝 License

MIT License - feel free to use this project for your organization!

## 🤝 Support

For issues or questions, contact the development team.
