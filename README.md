# 🛠️ Essential Services Hub

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://mongodb.com)
[![React](https://img.shields.io/badge/Frontend-React%20v18-cyan.svg)](https://react.dev)
[![Node](https://img.shields.io/badge/Backend-Node%20Express-green.svg)](https://nodejs.org)
[![MUI](https://img.shields.io/badge/UI-Material--UI%20v5-blue.svg)](https://mui.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](#)

A modern, high-fidelity Full Stack Web Application that consolidates scattered daily essential household services (e.g. LPG Gas cylinders, milk delivery subscriptions, water cans, laundry, housekeeping, electricians, plumbers, and carpenters) under a single platform.

---

## 🌟 Core Modules & Features

### 👤 User Roles
1.  **Customer:** Search for local services, filter by pincode/price, book slots, subscribe to daily items (milk/water), track orders, complete mock payments, post reviews, and file disputes/complaints.
2.  **Service Provider:** Register a business profile, configure pricing & experience, define available slots, accept/reject requests, transition job workflow stages (Accepted ➔ Assigned ➔ Out for Delivery ➔ Completed), and reply to customer feedback.
3.  **Administrator:** Access a system analytics dashboard (users metrics, revenue logs, category counts), toggle provider verification approval states, block/unblock users, and resolve customer complaints.

### ⚙️ Main Modules
*   **Authentication:** Dual role-based registration & logins using secure password hashing (`bcryptjs`) and persistent sessions (`JWT`).
*   **Smart Search & Filters:** Query providers by name or category, constrained by price range, rating threshold, and pincode location.
*   **Booking Stepper:** A streamlined Multi-step checkout wizard (Details ➔ Address ➔ Prepaid/COD Payment ➔ Success Receipt).
*   **Subscription Module:** Enables customers to schedule daily, weekly, or monthly repeating deliveries.
*   **Order Tracker Stepper:** A visual timeline displaying live progress (Requested ➔ Accepted ➔ Assigned ➔ Out for Delivery ➔ In Progress ➔ Completed).
*   **Printable Invoice:** Print-friendly page generating clean, standard billing layouts.
*   **Dispute System:** Customers can lodge support complaints for overcharging, delay, or poor quality, which admins can mark resolved.

---

## 📁 Project Architecture

```text
essential-services-hub/
├── client/              # React Frontend (Vite)
│   ├── src/
│   │   ├── components/  # Layout elements (Navbar, Footer, RouteGuard, Skeletons)
│   │   ├── context/     # Auth (JWT) and Light/Dark Theme contexts
│   │   ├── pages/       # Home, Service Browsing, Checkout, Dashboards, Invoice
│   │   ├── services/    # Pre-configured Axios API utility
│   │   ├── App.jsx      # Router configuration
│   │   └── main.jsx     # App entry point
│   ├── vite.config.js   # Vite server settings & backend proxy
│   └── package.json
│
└── server/              # Express Backend Server
    ├── config/          # MongoDB connectivity config
    ├── controllers/     # API request handler functions (role-based logic)
    ├── middleware/      # Token decoders & role check gatekeepers
    ├── models/          # Mongoose collections schemas
    ├── routes/          # Express route endpoints mapping
    ├── seed.js          # DB populator script
    └── index.js         # Backend launch entrypoint
```

---

## 🗄️ Database Schemas (Mongoose)

### `Users`
*   `name` (String, required)
*   `email` (String, unique, required)
*   `password` (String, encrypted, required)
*   `phone` (String, required)
*   `role` (String: `'customer'`, `'provider'`, `'admin'`)
*   `address` (Object: `street`, `area`, `city`, `pincode`)
*   `isBlocked` (Boolean, default `false`)

### `Providers`
*   `userId` (ref User, unique)
*   `businessName` (String, required)
*   `ownerName` (String, required)
*   `category` (String, enum category tags)
*   `location` (String, required)
*   `pincode` (String, required)
*   `experience` (Number, required)
*   `rating` (Number, default `5.0`)
*   `ratingCount` (Number, default `0`)
*   `availability` (Array of Strings, e.g. time slots)
*   `pricing` (Number, starting price)
*   `approved` (Boolean, default `false` - approval flow)

### `Services`
*   `serviceName` (String, required)
*   `category` (String, required)
*   `description` (String)
*   `price` (Number, required)
*   `duration` (Number, duration in minutes)
*   `providerId` (ref User)

---

## 📡 REST API Reference

| Endpoint | Method | Access | Description |
| :--- | :---: | :---: | :--- |
| `/api/register` | `POST` | Public | Register customer or provider |
| `/api/login` | `POST` | Public | Authenticate user, return JWT |
| `/api/profile` | `GET` | Private | Get user profile & business details |
| `/api/profile` | `PUT` | Private | Update user profile & business details |
| `/api/providers` | `GET` | Public | Query approved service providers list |
| `/api/provider` | `POST` | Private | Setup provider business profile |
| `/api/provider/:id` | `PUT` | Private | Edit provider business profile |
| `/api/services` | `GET` | Public | List offered catalog services |
| `/api/services` | `POST` | Private | Add service to catalog (Provider) |
| `/api/services/:id` | `PUT` | Private | Edit catalog service (Provider) |
| `/api/services/:id` | `DELETE` | Private | Delete catalog service (Provider) |
| `/api/booking` | `POST` | Private | Create new service booking (Customer) |
| `/api/booking` | `GET` | Private | Retrieve user-role bookings list |
| `/api/booking/:id` | `PUT` | Private | Update booking status stepper |
| `/api/subscription` | `POST` | Private | Create recurring subscription schedule |
| `/api/subscription` | `GET` | Private | List recurring subscription plans |
| `/api/subscription/:id` | `PUT` | Private | Toggle subscription status (Pause/Resume) |
| `/api/payment` | `POST` | Private | Simulate UPI/Card payments |
| `/api/invoice/:bookingId`| `GET` | Private | Fetch print receipt details |
| `/api/review` | `POST` | Private | Post service review feedback |
| `/api/reviews` | `GET` | Public | Fetch provider reviews list |
| `/api/reviews/:id/reply` | `PUT` | Private | Submit review reply text (Provider) |
| `/api/complaint` | `POST` | Private | Raise customer service dispute |
| `/api/complaints` | `GET` | Private | Query support complaints catalog |
| `/api/complaints/:id` | `PUT` | Admin | Resolve support complaints |
| `/api/analytics` | `GET` | Admin | Fetch system performance metrics |
| `/api/users` | `GET` | Admin | View user directory accounts |
| `/api/users/:id/block` | `PUT` | Admin | Block or unblock a user |
| `/api/providers/:id/approve`| `PUT` | Admin | Approve or block provider profile |

---

## 🛠️ Installation & Setup Guide

### 1. Database Prerequisite
Ensure that a local instance of **MongoDB** is running:
*   Default connection string: `mongodb://127.0.0.1:27017/essential_services_hub`
*   *(Optional)* Define custom connections by setting `MONGODB_URI` in `server/.env`.

### 2. Startup Backend Server
```bash
cd server
npm install
node seed.js    # Seeds mock accounts & data
npm start       # Launches server on port 5000
```

### 3. Startup Frontend Client
```bash
cd client
npm install
npm run dev     # Launches Vite server on port 3000
```
Navigate to **[http://localhost:3000](http://localhost:3000)** to verify.

---

## 👥 Seed Profiles for Testing

| Account Role | Email Address | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@esh.com` | `admin123` | Control panel, complaints, user blocks, verification |
| **Customer 1** | `customer1@gmail.com` | `customer123` | Booking checkout, tracking, subscriptions, payments |
| **Customer 2** | `customer2@gmail.com` | `customer2@gmail.com` | Additional customer reviews and bookings testing |
| **Approved Provider (Gas)** | `gas@esh.com` | `provider123` | Accepting LPG cylinder refills, tracking timeline |
| **Approved Provider (Milk)** | `milk@esh.com` | `provider123` | Recurring milk plans, managing active calendar |
| **Pending Provider (Plumber)**| `plumb@esh.com` | `provider123` | Requires admin verification before services list is active |
