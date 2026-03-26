# ⚗️ ChemLab Management System

A full-stack web application for managing chemical inventory, borrowing, and tracking in a college laboratory environment.

---

## 🚀 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React.js + Tailwind CSS + Recharts  |
| Backend    | Node.js + Express.js                |
| Database   | MongoDB (Mongoose ODM)              |
| Auth       | JWT (JSON Web Tokens)               |
| QR Codes   | qrcode (backend) + qrcode.react     |

---

## 📁 Project Structure

```
chemlab/
├── backend/
│   ├── controllers/
│   │   ├── authController.js        # Login, register, profile
│   │   ├── chemicalController.js    # CRUD + QR + restock
│   │   ├── transactionController.js # Borrow/return logic
│   │   ├── labController.js         # Lab CRUD
│   │   ├── userController.js        # Admin user management
│   │   └── reportController.js      # Analytics + CSV export
│   ├── middleware/
│   │   └── auth.js                  # JWT protect + authorize + generateToken
│   ├── models/
│   │   ├── User.js                  # User schema (student/admin)
│   │   ├── Lab.js                   # Lab schema
│   │   ├── Chemical.js              # Chemical schema with virtuals
│   │   └── Transaction.js           # Borrow/return log schema
│   ├── routes/
│   │   ├── auth.js
│   │   ├── labs.js
│   │   ├── chemicals.js
│   │   ├── transactions.js
│   │   ├── users.js
│   │   └── reports.js
│   ├── seeds/
│   │   └── seedData.js              # Sample data seeder
│   ├── .env.example
│   ├── package.json
│   └── server.js                    # Express app entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── admin/
    │   │   │   └── AdminLayout.js
    │   │   ├── user/
    │   │   │   └── UserLayout.js
    │   │   └── shared/
    │   │       ├── Badges.js
    │   │       ├── LoadingScreen.js
    │   │       ├── Modal.js
    │   │       ├── NotFound.js
    │   │       └── StatsCard.js
    │   ├── context/
    │   │   ├── AuthContext.js
    │   │   └── ThemeContext.js
    │   ├── pages/
    │   │   ├── auth/
    │   │   │   ├── Login.js
    │   │   │   └── Register.js
    │   │   ├── user/
    │   │   │   ├── UserDashboard.js
    │   │   │   ├── ChemicalList.js
    │   │   │   ├── BorrowChemical.js
    │   │   │   ├── MyHistory.js
    │   │   │   └── UserProfile.js
    │   │   └── admin/
    │   │       ├── AdminDashboard.js
    │   │       ├── ManageLabs.js
    │   │       ├── ManageChemicals.js
    │   │       ├── ManageUsers.js
    │   │       ├── Transactions.js
    │   │       └── Analytics.js
    │   ├── services/
    │   │   └── api.js               # Axios instance + all API calls
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── tailwind.config.js
    └── package.json
```

---

## ⚙️ Local Setup Instructions

### Prerequisites
- **Node.js** v18+ (https://nodejs.org)
- **MongoDB** v6+ running locally OR a MongoDB Atlas URI
- **npm** v9+

---

### 1️⃣ Clone / Extract the Project

```bash
# If using git:
git clone <repo-url>
cd chemlab

# Or just extract the zip and cd into it
```

---

### 2️⃣ Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create your .env file from the example
cp .env.example .env
```

Edit `.env` with your values:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/chemlab
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

> For **MongoDB Atlas**, replace MONGODB_URI with:
> `mongodb+srv://<user>:<password>@cluster.mongodb.net/chemlab?retryWrites=true&w=majority`

**Seed sample data:**
```bash
npm run seed
```

This creates 4 labs, 16+ chemicals, 8 users, and 60 days of transaction history.

**Start the backend server:**
```bash
npm run dev     # Development (auto-restart with nodemon)
# OR
npm start       # Production
```

Backend runs at: `http://localhost:5000`

---

### 3️⃣ Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env (optional - defaults to http://localhost:5000/api)
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Start the React dev server
npm start
```

Frontend runs at: `http://localhost:3000`

---

### 4️⃣ Login Credentials (after seeding)

| Role        | Email                        | Password      |
|-------------|------------------------------|---------------|
| Super Admin | superadmin@chemlab.com       | password123   |
| Admin       | admin@chemlab.com            | password123   |
| Admin 2     | admin2@chemlab.com           | password123   |
| Student 1   | student1@chemlab.com         | password123   |
| Student 2   | student2@chemlab.com         | password123   |
| Student 3   | student3@chemlab.com         | password123   |

---

## 🌐 API Endpoints Reference

### Auth
```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login
GET    /api/auth/me                Get current user (protected)
PUT    /api/auth/profile           Update profile (protected)
PUT    /api/auth/change-password   Change password (protected)
```

### Labs
```
GET    /api/labs                   Get all labs
GET    /api/labs/:id               Get single lab
POST   /api/labs                   Create lab (admin)
PUT    /api/labs/:id               Update lab (admin)
DELETE /api/labs/:id               Delete lab (admin)
```

### Chemicals
```
GET    /api/chemicals              Get all (with filters: lab, category, search, lowStock)
GET    /api/chemicals/low-stock    Get low stock chemicals (admin)
GET    /api/chemicals/:id          Get single chemical
POST   /api/chemicals              Create chemical (admin)
PUT    /api/chemicals/:id          Update chemical (admin)
PATCH  /api/chemicals/:id/restock  Restock chemical (admin)
DELETE /api/chemicals/:id          Soft delete (admin)
```

### Transactions
```
POST   /api/transactions/borrow       Borrow chemical
POST   /api/transactions/return       Return chemical
GET    /api/transactions/my-history   My own history
GET    /api/transactions              All transactions (admin, with filters)
GET    /api/transactions/:id          Single transaction
```

### Reports (Admin only)
```
GET    /api/reports/dashboard-stats   Summary stats
GET    /api/reports/most-borrowed     Top borrowed chemicals
GET    /api/reports/daily-trend       Daily borrow/return counts
GET    /api/reports/lab-usage         Per-lab statistics
GET    /api/reports/student-stats     Per-student statistics
GET    /api/reports/category-breakdown Chemical category breakdown
GET    /api/reports/export/csv        Download CSV report
```

### Users (Admin only)
```
GET    /api/users               List all users
GET    /api/users/:id           Get single user
PATCH  /api/users/:id/role      Change user role (superadmin)
PATCH  /api/users/:id/toggle-status  Toggle active/inactive
```

---

## 🎯 Features Checklist

### Student (User) Side
- [x] Register / Login with JWT
- [x] Browse chemicals by lab with search & filters
- [x] View chemical details: quantity, limit, hazard, formula
- [x] Borrow chemical with validation
- [x] Return borrowed chemicals
- [x] View personal borrow history
- [x] Stock level progress bars
- [x] Profile management + password change

### Admin Side
- [x] Admin dashboard with real-time stats
- [x] Manage labs: add / edit / delete
- [x] Manage chemicals: full CRUD + restock
- [x] QR code generation for each chemical
- [x] Low stock alerts on dashboard
- [x] Transaction management with advanced filters
- [x] Analytics: daily trend, most borrowed, lab usage, student stats
- [x] Recharts-powered interactive charts
- [x] Export transactions to CSV
- [x] User management: activate/deactivate, role change

### Security
- [x] JWT-based authentication
- [x] Role-based authorization (user / admin / superadmin)
- [x] Route protection (frontend + backend)
- [x] Input validation with express-validator
- [x] Rate limiting with express-rate-limit
- [x] Helmet security headers
- [x] Password hashing with bcryptjs

### UI/UX
- [x] Dark mode (system preference + manual toggle)
- [x] Fully responsive (mobile-first)
- [x] Sidebar navigation
- [x] Real-time stock percentage bars
- [x] Hazard level badges
- [x] Status badges (Approved / Returned / Pending)
- [x] Loading states throughout

---

## ☁️ Deployment Guide

### Backend → Render.com

1. Push backend to a GitHub repo
2. Create new **Web Service** on [render.com](https://render.com)
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Add Environment Variables:
   - `MONGODB_URI` = your Atlas URI
   - `JWT_SECRET` = a strong random string
   - `CLIENT_URL` = your Vercel frontend URL
   - `NODE_ENV` = production

### Frontend → Vercel

1. Push frontend to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add Environment Variable:
   - `REACT_APP_API_URL` = `https://your-backend.onrender.com/api`
4. Deploy

### Database → MongoDB Atlas

1. Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user
3. Whitelist all IPs (0.0.0.0/0) for cloud deployment
4. Copy the connection string as your `MONGODB_URI`

---

## 🔒 Security Notes

- Never commit `.env` to version control
- Use a strong, long `JWT_SECRET` in production
- Set `NODE_ENV=production` in deployment
- Restrict MongoDB Atlas IP whitelist in production if possible

---

## 📸 Screenshots Guide

After running locally, explore:
1. `http://localhost:3000/login` — Login screen
2. `http://localhost:3000/dashboard` — Student dashboard
3. `http://localhost:3000/admin` — Admin dashboard with charts
4. `http://localhost:3000/admin/analytics` — Full analytics page

---

## 🎓 College Project Notes

This project demonstrates:
- **Full-stack MERN architecture** with RESTful API design
- **JWT authentication** with role-based access control
- **Real-time inventory management** with atomic updates
- **Data visualization** with Recharts (line, bar, pie, area charts)
- **Responsive UI** with Tailwind CSS and dark mode
- **QR code integration** for chemical tracking
- **CSV export** for offline reporting
- **MongoDB aggregation pipelines** for analytics

---

Built with ❤️ for college chemistry lab management.
