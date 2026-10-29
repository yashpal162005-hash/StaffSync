# StaffSync — MERN HR Management System

A working college-project starter built with MongoDB, Express, React and Node.js.

## Features
- JWT login/register, bcrypt password hashing, role-based authorization (`employee`, `manager`, `hr`)
- Role-specific dashboard
- Employee directory (HR can add/list employees)
- Attendance check-in/check-out and attendance history
- Leave request creation and manager/HR approval or rejection
- HR announcements
- Training program listing and HR creation
- Responsive Bootstrap UI

## Requirements
- Node.js 18+
- MongoDB local instance or MongoDB Atlas connection string

## 1. Backend setup
```bash
cd server
cp .env.example .env
# Set MONGO_URI and JWT_SECRET in .env
npm install
npm run dev
```
Backend: `http://localhost:5000`

To create an HR user, first register through the app as an employee, then promote the user directly in MongoDB:
```js
db.users.updateOne({ email: "your-email@example.com" }, { $set: { role: "hr" } })
```
For a manager, set role to `manager`. Public registration intentionally only permits the employee role.

## 2. Frontend setup
In another terminal:
```bash
cd client
npm install
npm run dev
```
Open the Vite URL printed in the terminal (normally `http://localhost:5173`).

## API overview
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/employees`, `POST /api/employees` (HR)
- `POST /api/attendance/check-in`, `POST /api/attendance/check-out`, `GET /api/attendance`
- `POST /api/leaves`, `GET /api/leaves`, `PATCH /api/leaves/:id/status` (manager/HR)
- `GET /api/announcements`, `POST /api/announcements` (HR)
- `GET /api/trainings`, `POST /api/trainings` (manager/HR)

This is a practical educational starter, not a production-ready HR platform. Before production, add audit logs, rate limiting, email verification, password reset, stricter validation, tests, and deployment secrets management.
