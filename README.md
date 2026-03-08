# SuperCart - Cashier-less Shopping System

A modern, cashier-less shopping solution that enables customers to scan products, pay digitally, and exit seamlessly without traditional checkout lines.

## 🚀 Features

- **QR-Based Store Entry**: Customers scan a QR code to enter the store and start a shopping session
- **Product Scanning**: Scan product barcodes to add items to cart
- **Real-time Cart Management**: View and manage items before checkout
- **Integrated Payment**: Razorpay integration for secure digital payments
- **Exit Verification**: QR-based exit token verified by store guards
- **PDF Bill Generation**: Automatic bill generation after payment
- **Admin Dashboard**: Manage products, transactions, and monitor store activity
- **Guard App**: Verify customer exit tokens and flag suspicious activity

## 📁 Project Structure

```
SuperCart/
├── backend/              # Node.js + Express API server
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── routes/       # API endpoints
│   │   ├── models/       # Sequelize models
│   │   └── config/       # Database configuration
│   └── package.json
├── customer-app/         # React Native (Expo) mobile app
│   ├── src/
│   │   ├── ShopScanScreen.js
│   │   ├── ScanningScreen.js
│   │   ├── CartContext.js
│   │   └── ...
│   └── package.json
├── guard-app/            # React Native (Expo) guard verification app
│   └── src/
├── admin-dashboard/      # React + Vite web dashboard
│   ├── src/
│   │   ├── pages/
│   │   └── api/
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API server
- **PostgreSQL** - Database (via Sequelize ORM)
- **Razorpay** - Payment gateway integration
- **PDFKit** - Bill generation
- **JWT** - Authentication

### Mobile Apps (Customer & Guard)
- **React Native** - Cross-platform mobile framework
- **Expo** - Development and build tooling
- **Expo Camera** - QR/Barcode scanning
- **Axios** - API communication

### Admin Dashboard
- **React** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety

## Local Setup

### Prerequisites
- Node.js v18+
- PostgreSQL
- Razorpay account

### Backend
```bash
cd backend
npm install
```

Create `.env` (see `.env.example`):
```env
PORT=5001
NODE_ENV=development
DB_NAME=supercart_db
DB_USER=your_db_user
DB_PASS=your_db_password
DB_HOST=localhost
JWT_SECRET=minimum_32_character_secret_key_here
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
ADMIN_USERNAME=supercart_admin
ADMIN_PASSWORD=your_admin_password
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```
```bash
node src/seed.js   # Creates test store: shopId=supermart01, password=admin123
npm start          # Starts server on port 5001
npm test           # Run 62 tests
```

### Admin Dashboard
```bash
cd admin-dashboard
npm install
npm run dev        # http://localhost:5173
```

---

## Deployment

| Service | Platform |
|---------|----------|
| Backend + PostgreSQL | Railway |
| Admin Dashboard | Vercel |
| SuperCart Website | Vercel |
| Customer + Guard Apps | EAS Build → Play Store / App Store |

---

## Current Status

| Component | Status |
|-----------|--------|
| Backend | ✅ Production ready, 62 tests passing |
| Admin Dashboard | 🔧 Demo data — needs live backend connection |
| Customer App | 🔧 Working on Expo Go — needs EAS Build |
| Guard App | 🔧 Working on Expo Go — needs EAS Build |
| SuperCart Website | ⬜ Not built yet |
| Deployment | ⬜ Not deployed yet |

---

## Built By

**Ashutosh Sharma** — [github.com/AshutoshSharma-pixel](https://github.com/AshutoshSharma-pixel)
