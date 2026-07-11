# 🏢 PG Food Board

An interactive, Apple-inspired liquid glass schedule board designed to catalog and view PG (Paying Guest) food routines. Users can view menus, toggle favorites, request changes, and submit new PGs. Admin moderators can review changes side-by-side with color-coded diff highlights before publishing them.

---

## ✨ Key Features

- **Liquid Glassmorphism UI:** Tailored neutral HSL color palettes for dark and light modes, frosted panels with double drop-shadows, and squircle border-radii.
- **Draggable Corkboard (Board View):** Drag and position cards freely on a virtual desktop workspace. Layout positions automatically persist in `localStorage` and recover on reload.
- **Intelligent Anti-Overlap Solver:** If card coordinates overlap on Board View, the self-healing layout algorithm automatically shifts them horizontally or vertically, ensuring cards never stack directly over one another.
- **Fluid Layouts:** Desktop uses a fluid 96% full-screen layout. Mobile viewports automatically switch to a clean Grid layout, collapsing header text buttons into compact, responsive icon buttons.
- **Submissions Wizard with Copy Utility:** Fill out menu schedules step-by-step. Includes a **"Copy Week 1"** button to instantly clone Week 1 daily meals into Week 2 fields.
- **Color-Coded Edit Diffs:** Admins see exactly what was edited on the moderation dashboard. Removed items are highlighted in **red with strikethrough**, and newly added items are highlighted in **green with a plus (+) prefix**.
- **Admin Moderation Controls:** Admins can view the full weekly proposed schedules in the row-based schedule dialog, and delete active PGs directly from the card header actions.
- **Stateless Serverless Ready:** MongoDB integration handles production persistence, with an automatic fallback to local `data/db.json` file storage if no MongoDB connection URI is provided.
- **Role-Based Security:** JSON Web Tokens (JWT) are cryptographically signed using a server secret. Role-based checks (`role === 'admin'`) are strictly validated against user records fetched directly from the database, preventing role-bypass exploits.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) (v14 or higher)
- [MongoDB](https://www.mongodb.com) (Optional, falls back to local JSON file storage if not specified)

### Installation
1. Clone this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
4. Update the values in `.env` to match your local setup:
   - `PORT`: Port to run the server on (defaults to `3000`).
   - `MONGODB_URI`: Connection string to your local or Atlas MongoDB. Leave blank to run via local JSON fallback.
   - `JWT_SECRET`: Random string to sign authorization tokens.

### Running Locally
To launch the Node/Express server and client frontend in development mode:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

---

## 🛠 Admin Setup in Production

Since the application contains no auto-seeded default admin users in production to avoid security leaks, admin access must be granted manually:

1. **Register User:** Visit the deployed site, click **Login** in the top-right, choose **Register**, and create your account.
2. **Atlas Promotion:** Log into your MongoDB Atlas console, navigate to the `users` collection, locate your newly created user, and edit the `role` property from `"user"` to `"admin"`.
3. **Moderator Access:** Log out and log back in on the site. The **Admin Panel** toggle button and card deletion controls will be fully unlocked.

---

## ☁️ Deploying to Vercel (Free Tier)

This project is fully optimized for Vercel's serverless free tier out-of-the-box using the [`vercel.json`](file:///home/devil/comp/pgfood/vercel.json) file:

1. **MongoDB Atlas:** Create a free M0 cluster database on MongoDB Atlas. Under **Network Access**, whitelist all IP addresses (`0.0.0.0/0`) so Vercel can connect, and create a database user.
2. **Import Repository:** Connect Vercel to your GitHub account and import this repository.
3. **Environment Variables:** In Vercel's project setup settings, add:
   - `MONGODB_URI`: *Your MongoDB connection string.*
   - `JWT_SECRET`: *Any secure random string.*
4. **Deploy:** Click **Deploy**. Vercel will bundle the Node Express server into serverless functions and host the application.
