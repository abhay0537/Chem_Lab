# ⚗️ ChemLab Management System

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![Status](https://img.shields.io/badge/Status-Active-success)

A **full-stack MERN web application** designed to streamline **chemical inventory, borrowing, and lab management** in academic environments.

> Built for real-world college lab workflows with admin approvals, analytics, and secure access control.

---

## 🌟 Key Highlights

* 🔐 Secure JWT Authentication & Role-Based Access
* 🧪 Chemical Inventory with Real-Time Stock Tracking
* 📊 Advanced Analytics Dashboard (Recharts)
* 📦 Borrow / Return Workflow with Status Tracking
* 🔔 Admin Approval System *(Pending → Approved/Rejected)*
* 📱 Fully Responsive UI + Dark Mode
* 📷 QR Code Integration for Chemicals
* 📤 CSV Export for Reports

---

## 🧠 Problem Solved

Traditional lab systems are:

* ❌ Manual & error-prone
* ❌ Lack transparency in borrowing
* ❌ No real-time stock visibility

✅ **ChemLab solves this with automation, tracking, and analytics.**

---

## 🛠️ Tech Stack

| Layer    | Technology                       |
| -------- | -------------------------------- |
| Frontend | React.js, Tailwind CSS, Recharts |
| Backend  | Node.js, Express.js              |
| Database | MongoDB (Mongoose ODM)           |
| Auth     | JWT (JSON Web Tokens)            |
| Extras   | QR Codes, CSV Export             |

---

## 📁 Project Structure

```bash
chemlab/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── seeds/
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── context/
    │   └── services/
```

---

## ⚙️ Installation & Setup

### 🔧 Prerequisites

* Node.js (v18+)
* MongoDB (local or Atlas)
* npm

---

### 🚀 Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chemlab
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000
```

Run:

```bash
npm run seed
npm run dev
```

---

### 💻 Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## 🔐 Demo Credentials

| Role    | Email                                               | Password    |
| ------- | --------------------------------------------------- | ----------- |
| Admin   | [admin@chemlab.com](mailto:admin@chemlab.com)       | password123 |
| Student | [student1@chemlab.com](mailto:student1@chemlab.com) | password123 |

---

## 🔄 Workflow (Core Feature)

1. User requests chemical 📩
2. Status = **Pending**
3. Admin reviews request
4. Admin approves/rejects
5. User receives notification ✅

---

## 📡 API Overview

### Auth

* `POST /api/auth/login`
* `POST /api/auth/register`

### Chemicals

* `GET /api/chemicals`
* `POST /api/chemicals`

### Transactions

* `POST /api/transactions/borrow`
* `POST /api/transactions/return`

### Reports

* `GET /api/reports/dashboard-stats`
* `GET /api/reports/export/csv`

---

## 🎯 Features

### 👨‍🎓 User

* Browse chemicals
* Borrow / return system
* Track history
* Profile management

### 👨‍💼 Admin

* Manage labs & chemicals
* Approve/reject requests
* Analytics dashboard
* User management

---

## 🔒 Security

* JWT Authentication
* Role-based Authorization
* Password hashing (bcrypt)
* Rate limiting & Helmet

---

## 🎓 Project Value

This project demonstrates:

* Full MERN stack development
* REST API design
* Authentication & authorization
* Real-world workflow automation
* Data visualization
* Scalable architecture

---

## 🚀 Future Improvements

* 🔔 Real-time notifications (WebSockets)
* 📱 Mobile app version
* 🧠 AI-based chemical usage prediction
* 📦 Barcode scanning support

---

