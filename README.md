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

## 📦 Installation

### Prerequisites
- Node.js (v18+)
- PostgreSQL database
- Expo Go app (for mobile testing)
- Razorpay account (for payments)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
npm install
```

2. Create `.env` file:
```env
PORT=5001
DB_NAME=supercart_db
DB_USER=your_username
DB_PASS=your_password
DB_HOST=localhost
JWT_SECRET=your_secret_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

3. Initialize database:
```bash
node src/sync.js
node src/seed.js
```

4. Start server:
```bash
npm start
```

### Customer App Setup

1. Navigate to customer-app:
```bash
cd customer-app
npm install
```

2. Update API URL in `src/api.js`:
```javascript
const DEV_API_URL = 'http://YOUR_LOCAL_IP:5001/api';
```

3. Start Expo:
```bash
npm start
```

4. Scan QR code with Expo Go app

### Guard App Setup

Same as Customer App:
```bash
cd guard-app
npm install
npm start
```

### Admin Dashboard Setup

```bash
cd admin-dashboard
npm install
npm run dev
```

Access at `http://localhost:5173`

## 🎯 Usage Flow

### Customer Journey

1. **Enter Store**: Scan shop QR code at entrance
2. **Shop**: Scan product barcodes to add to cart
3. **Review**: Check cart and total amount
4. **Pay**: Complete payment via Razorpay
5. **Exit**: Show exit QR to guard for verification
6. **Download Bill**: Get PDF receipt

### Guard Workflow

1. Open Guard App
2. Scan customer's exit QR code
3. Verify payment status
4. Allow/flag customer exit

### Admin Tasks

1. Add/edit products
2. Monitor transactions
3. View flagged users
4. Manage store inventory

## 🔧 Configuration

### Network Setup

For local development, ensure all devices are on the same WiFi network. Update API URLs in:
- `customer-app/src/api.js`
- `guard-app/src/api.js`
- `admin-dashboard/src/api/client.ts`

### Database Schema

Key tables:
- `users` - Customer information
- `stores` - Store details
- `products` - Product catalog
- `sessions` - Shopping sessions
- `cart_items` - Session cart items

## 🐛 Troubleshooting

### Camera Black Screen
- Ensure camera permissions are granted
- Clear Expo cache: `expo start -c`
- Restart app completely

### Network Errors
- Verify backend is running on correct port
- Check firewall settings
- Ensure devices are on same network
- For production, use tunneling service (ngrok, serveo)

### Database Connection Issues
- Verify PostgreSQL is running
- Check `.env` credentials
- Run `node src/sync.js` to recreate tables

## 📝 API Endpoints

### Cart
- `POST /api/cart/start` - Start shopping session
- `POST /api/cart/add` - Add item to cart

### Payment
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment

### Verification
- `POST /api/verification/verify-exit` - Verify exit token

### Bills
- `GET /api/bill/:sessionId` - Download PDF bill

## 🔐 Security

- JWT-based authentication
- Razorpay signature verification
- Exit token validation
- Trust score system for fraud detection

## 👥 Contributors

- Ashutosh Sharma

## 🙏 Acknowledgments

- Razorpay for payment integration
- Expo team for mobile development tools
- PostgreSQL community
