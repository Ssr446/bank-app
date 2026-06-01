# Bank Application

A full-stack banking application built with React, Node.js, Express, and SQLite.

## Project Structure

The project consists of two main parts:
- `bank-frontend/`: The React-based frontend web application.
- `backend/`: The Node.js Express backend API and SQLite database.

## Prerequisites

- Node.js (v14 or higher recommended)
- npm (comes with Node.js)

## Getting Started Locally

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm start
   ```
   The backend will run on `http://localhost:3001`. The SQLite database (`bank.db`) will be created automatically in the backend folder.

### 2. Frontend Setup

1. Open a new terminal and navigate to the `bank-frontend` folder:
   ```bash
   cd bank-frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
   The frontend will automatically open in your default browser at `http://localhost:3000`.

## Features

- **User Authentication:** Secure registration and login using JWT and bcrypt.
- **Dashboard:** View accounts, balances, and recent transactions.
- **Transactions:** Deposit, withdraw, and transfer money between accounts or to other users.
- **Account Management:** Create new banking accounts.
- **Profile:** Manage user profile details.
- **Appointments:** Schedule and manage appointments.

## Deployment Guide

You can easily deploy this application to cloud providers like Render, Heroku, or Vercel.

### Backend Deployment (e.g., Render Web Service)
1. Push your code to GitHub.
2. In your hosting provider, create a new "Web Service" and connect it to your repository.
3. Set the Root Directory to `backend`.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add Environment Variables:
   - `JWT_SECRET`: A strong random string for your tokens.

*(Note: Since this uses a local SQLite database file, it will reset on deployment platforms that use ephemeral storage, which is fine for demo purposes. For production, consider using PostgreSQL or MySQL.)*

### Frontend Deployment (e.g., Render Static Site or Vercel)
1. Create a new "Static Site" (Render) or "Project" (Vercel) connected to your repository.
2. Set the Root Directory to `bank-frontend` (or specify in settings).
3. Build Command: `npm run build`
4. Publish Directory: `bank-frontend/build` (for Render)
5. Add Environment Variables:
   - `REACT_APP_API_URL`: Set this to the deployed URL of your backend (e.g., `https://your-backend-url.onrender.com`).

## Built With

- **Frontend:** React, Material UI, Axios, React Router.
- **Backend:** Node.js, Express, SQLite, jsonwebtoken, bcryptjs.
