# ShopFlow - Architecture & Documentation

This document serves as the foundational architecture and documentation guide for the **ShopFlow** e-commerce application. It is designed to be easily digestible for AI models to generate flow diagrams, system architecture diagrams, and presentations.

## 1. Project Overview

**ShopFlow** is a modern, full-stack e-commerce platform offering a seamless shopping experience with AI-powered recommendations, real-time socket-based notifications, secure payments, and a dedicated admin dashboard for store management.

## 2. Tech Stack Overview

- **Frontend**: React (via Vite), React Router, Context API (State Management), Formik (Forms), Tailwind CSS (Styling), Axios.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (via Mongoose).
- **Authentication**: JWT (JSON Web Tokens) with Bcrypt for password hashing.
- **Real-Time Communication**: Socket.io.
- **Third-Party Integrations**:
  - **Stripe**: Payment gateway processing.
  - **Groq API**: AI-powered features (smart recommendations, chat/voice parsing).

## 3. High-Level System Architecture (Client-Server Model)

### **Frontend (Client)**

- **User Interface**: Renders pages for browsing products, managing cart/wishlists, checkout, and user dashboards.
- **Context API Providers**: Manages global application state (`AuthContext`, `CartContext`, `WishlistContext`, `CompareContext`, `ThemeContext`).
- **API Service Layer (`api.js`)**: Axios interceptors attached to handle JWT injection, error handling, retries, and network routing to the backend.

### **Backend (Server)**

- **Express Server (`server.js`)**: Handles CORS, routing, and middleware.
- **Middleware**: `authMiddleware.js` (JWT validation, Role-based access control).
- **Routes**: Modular routes for `/users`, `/products`, `/orders`, `/admin`, `/payment`, `/ai`, `/coupons`, `/cluster`.
- **Controllers/Logic**: Handles specific business logic for endpoints.
- **Database Connection (`db.js`)**: Maintains connection pool to MongoDB.
- **Socket.io**: Pushes real-time updates (e.g., payment success notifications, order status changes) to clients.

## 4. Core Data Models (MongoDB Schema)

### **User Model (`User.js`)**

- `name`, `email` (unique), `password` (hashed).
- `role`: enum `['user', 'admin', 'manager']` (default: `'user'`).
- `rewardPoints`: Tracks user loyalty points.
- `claimedCoupons`: Array of ObjectIds linking to used coupons.

### **Product Model (`Product.js`)**

- `title`, `description`, `category`, `image`, `sizes`, `features`.
- `price`, `originalPrice`, `stock`.
- `rating`: Nested object containing `rate` and `count`.

### **Order Model (`Order.js`)**

- `user`: Reference to the `User` who made the order.
- `orderItems`: Array containing product references, quantity, size, and price.
- `shippingAddress`: Object with address, city, postal code, and country.
- `paymentMethod`, `transactionId`.
- `paymentStatus`: enum `['Pending', 'Paid', 'Failed']`.
- `orderStatus`: enum `['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']`.
- `totalPrice`, `discountAmount`, `rewardPointsEarned`, `couponCode`.

### **Coupon Model (`Coupon.js`)**

- `code` (unique), `discountType` (percentage or flat), `discountValue`.
- `minOrderValue`, `maxDiscount`, `validUntil`, `isActive`.

## 5. System Workflows (For Flow Diagrams)

### **1. User Authentication Flow**

1. User submits login form on Frontend (`Login.jsx`).
2. Frontend trims inputs and posts to `/api/users/login`.
3. Backend finds user by email, compares hashed password with `bcrypt`.
4. If successful, Backend generates a JWT token and returns user details.
5. Frontend stores user data in `localStorage` and updates `AuthContext`.
6. Subsequent API requests attach the JWT token in the `Authorization` header via Axios interceptors.

### **2. Order & Payment Flow (Stripe)**

1. User adds items to cart and proceeds to checkout.
2. User provides shipping details and confirms order.
3. Frontend calls `/api/orders` to create a `Pending` order in MongoDB.
4. Frontend calls `/api/payment/create-payment-intent` with the Order ID.
5. Backend uses Stripe SDK to create a Payment Intent and returns the `client_secret`.
6. Frontend securely captures payment details using Stripe Elements and confirms payment.
7. Stripe processes payment. On success, Frontend calls `/api/payment/confirm`.
8. Backend updates Order status to `Paid` and `Processing`.
9. Socket.io emits a real-time "payment_success" event to the user's room.

### **3. AI Recommendations Flow**

1. User views a product or uses the AI chat interface.
2. Frontend sends product context/chat message to `/api/ai/recommendations` or `/api/ai/chat`.
3. Backend securely forwards the prompt + context to the Groq AI API.
4. Groq processes the prompt and returns structured JSON or text.
5. Backend parses the response and sends it to the Frontend to display.

## 6. Directory Structure Overview

- `/backend`: Node.js server.
  - `/models`: Mongoose schemas.
  - `/routes`: Express route definitions.
  - `/middleware`: Authentication and error handling.
  - `/scripts`: Database seeders.
- `/frontend`: React client.
  - `/src/pages`: UI Views (Home, Login, Dashboard, Admin).
  - `/src/components`: Reusable UI elements (Navbar, Footer).
  - `/src/context`: React Context providers.
  - `/src/services`: Axios API wrapper.
