# 🥛 Dairy Management System

A full-stack, enterprise-grade Dairy Management & Daily Milk Delivery Platform built with Node.js, Express, MySQL, React, Vite, and Tailwind CSS.

---

## ✨ Features

### 👤 Role-Based Access Control (RBAC)
- **Admin**: Full administrative control over inventory, customer subscriptions, delivery routes, financial billing, performance analytics, and audit logs.
- **Delivery Partner**: Mobile-first dashboard for morning delivery runs, interactive GPS Leaflet route map, turn-by-turn Google Maps navigation, dynamic quantity adjustment, and live status marking (Delivered, Customer Skipped, Failed).
- **Customer**: Manage daily milk subscriptions, request one-time addons, pause/resume deliveries, top up digital wallet balance, view monthly statements, and download PDF invoices.

### 🗺️ Delivery Partner Route Map & GPS
- Integrated interactive **Leaflet / OpenStreetMap** with custom color-coded status pins:
  - 🟢 **Delivered**
  - 🔴 **Pending**
  - ⚪ **Customer Skipped**
- One-click Google Maps deep-link navigation directly to customer doorsteps.
- Actual vs. expected milk quantity counter with automatic discrepancy tracking and inventory reconciliation.

### 💰 Billing, Wallet & Subscriptions
- Automated monthly invoice calculation and billing ledger.
- Digital wallet system with transactional ledger and low-balance warnings.
- Vacation/skip management for customers with automated schedule updates.
- PDF invoice generation and download support.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Recharts, React-Leaflet, Leaflet
- **Backend**: Node.js, Express.js, MySQL (mysql2 with connection pooling), JWT Authentication, bcryptjs
- **Database**: MySQL relational schema with foreign key constraints, indexing, and transactional integrity

---

## 📁 Project Structure

```
Dairy-management-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Business logic & route handlers
│   │   ├── middleware/      # Auth & RBAC verification
│   │   ├── routes/          # Express API route declarations
│   │   └── server.js        # Server entry point
│   ├── seed_kothrud.js      # Seeding 20 real locations in Kothrud, Pune
│   ├── seed_load_test.js    # Load testing seed script (10 drivers, 200 customers)
│   ├── qa_test_full.js      # Automated backend test suite
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Admin, Delivery Partner, and Customer portals
│   │   ├── context/         # Auth and state management
│   │   ├── api/             # Axios API client
│   │   └── App.jsx
│   ├── package.json
│   └── .env.example
├── database/
│   ├── schema.sql           # Complete MySQL database schema
│   └── seed.sql             # Initial seed data
└── README.md
```

---

## 🚀 Getting Started

### 1. Database Setup
1. Ensure MySQL server is running locally.
2. Create the database and import schema:
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS dairy_db;"
   mysql -u root -p dairy_db < database/schema.sql
   ```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Update `.env` with your MySQL credentials and JWT secret.
5. (Optional) Seed test data:
   ```bash
   node seed_kothrud.js
   ```
6. Start the backend server:
   ```bash
   npm start
   ```
   Backend will run on `http://localhost:5000`.

### 3. Frontend Setup
1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`.

---

## 🧪 Testing & Verification
- Run backend automated test suite:
  ```bash
  cd backend
  node qa_test_full.js
  ```
- Build frontend for production:
  ```bash
  cd frontend
  npm run build
  ```
