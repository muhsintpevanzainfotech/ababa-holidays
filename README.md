# ABABA TRAVELS / HOLIDAYS

A full-stack travel and holiday management platform featuring an Express/MongoDB backend API, a React Admin Dashboard, a React Vendor Dashboard, and a customer-facing website.

---

## Project Architecture

```text
ABABA TRAVELS/
├── admin/            # Admin Control Panel (React 19, Vite, Tailwind CSS, Redux Toolkit)
├── backend/          # RESTful API Server (Node.js, Express, MongoDB, JWT, Stripe)
├── vendor-dashboard/ # Vendor Management Portal (React 19, Vite, Material UI, ApexCharts)
└── website/          # Customer-Facing Portal (Under Development)
```

---

## Technology Stack

### Backend (`/backend`)
- **Runtime & Framework:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JWT (JSON Web Tokens), bcryptjs
- **Security & Utilities:** Helmet, Express Rate Limit, CORS, Multer (File Uploads)
- **Services:** Nodemailer (Emails), Stripe (Payments)

### Admin Dashboard (`/admin`)
- **Framework:** React 19, Vite
- **Styling:** Tailwind CSS, PostCSS
- **State Management:** Redux Toolkit, Redux Saga
- **UI Libraries:** Lucide React, Framer Motion, Leaflet Maps, ReactFlow

### Vendor Dashboard (`/vendor-dashboard`)
- **Framework:** React 19, Vite
- **Styling:** Material UI (MUI v7), Emotion, SASS
- **State Management:** Redux Toolkit, Redux Saga, SWR
- **Analytics & Charts:** ApexCharts, React ApexCharts

---

## Getting Started

### 1. Prerequisites
- **Node.js**: `v18.x` or higher
- **npm** or **yarn**
- **MongoDB**: Local MongoDB server or MongoDB Atlas URI

---

### 2. Environment Configuration

Create a `.env` file in each relevant project folder:

#### Backend Configuration (`backend/.env`)
```env
PORT=9000
MONGO_URI=mongodb://localhost:27017/ababa_travels
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
```

#### Admin Dashboard Configuration (`admin/.env`)
```env
VITE_API_BASE_URL=http://localhost:9000/api
VITE_IMAGE_BASE_URL=http://localhost:9000
```

#### Vendor Dashboard Configuration (`vendor-dashboard/.env`)
```env
VITE_API_BASE_URL=http://localhost:9000/api
```

---

### 3. Installation & Running Services

#### 1. Backend API Server
```bash
cd backend
npm install
npm run dev
```
*API running at:* `http://localhost:9000`

#### 2. Admin Dashboard
```bash
cd admin
npm install
npm run dev
```
*Admin Panel running at:* `http://localhost:5173`

#### 3. Vendor Dashboard
```bash
cd vendor-dashboard
yarn install
yarn dev
```
*Vendor Dashboard running at:* `http://localhost:5173` / `http://localhost:9002`

---

## Service Commands Reference

| Service | Dev Command | Production Command | Description |
| :--- | :--- | :--- | :--- |
| **Backend** | `npm run dev` | `npm start` | Express API server (Nodemon watcher) |
| **Admin** | `npm run dev` | `npm run build` | Vite React Admin Panel |
| **Vendor** | `yarn dev` | `yarn build` | Vite React Vendor Dashboard |

---

## 🔒 Security Warning

Ensure `.env` files are ignored in [.gitignore](file:///e:/ABABA%20TRAVELS/.gitignore). Do **not** commit live secret keys (such as OpenAI keys, Stripe secret keys, or DB credentials) to public version control.
