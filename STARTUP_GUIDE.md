# SuperCart Startup Guide

This guide details how to start all components of the SuperCart system.

## Prerequisites
Ensure you have Node.js installed.
Before running any component for the first time, make sure to install dependencies in each directory:
```bash
cd <directory>
npm install
```

## 1. Backend
The backend serves as the core API for all other applications. **Start this first.**

- **Directory:** `backend`
- **Port:** `5001`
- **Command:**
  ```bash
  cd backend
  npm start
  ```
  *Note: You should see "Database connected..." in the terminal.*

## 2. Admin Dashboard
The web-based dashboard for store management.

- **Directory:** `admin-dashboard`
- **Default Port:** `5173` (usually)
- **Command:**
  ```bash
  cd admin-dashboard
  npm run dev
  ```
- **Access:** Open the URL shown in the terminal (e.g., `http://localhost:5173`) in your browser.

## 3. Customer App (Mobile)
The mobile application for shoppers.

- **Directory:** `customer-app`
- **Command:**
  ```bash
  cd customer-app
  npm start
  ```
- **Usage:** This will start the Expo Metro Bundler. Scan the QR code with your phone (using Expo Go) or press `i` to run in an iOS simulator / `a` for Android emulator.

## 4. Guard App (Mobile)
The mobile application for security guards to verify exits.

- **Directory:** `guard-app`
- **Command:**
  ```bash
  cd guard-app
  npm start
  ```
- **Usage:** Similar to the Customer App, scan the QR code with Expo Go or run on a simulator/emulator.

---

## Troubleshooting connection issues
If the mobile apps cannot connect to the backend:
1. Ensure your computer and mobile device are on the **same Wi-Fi network**.
2. Check the IP address configurated in the apps:
    - **Guard App:** `guard-app/src/api.js`
    - **Customer App:** `customer-app/src/api.js` (Check this file if you possess connection issues there too)
3. Ensure the IP matches your machine's local IP (currently `192.168.251.188`).
