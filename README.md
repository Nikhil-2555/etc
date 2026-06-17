# ShopFlow 🛒

A full-stack e-commerce application built with React (Frontend) and Node.js/Express (Backend) featuring AI recommendations and secure payments.

---

### 🚀 Features

- **User Authentication**: JWT-based Login/Register.
- **AI Recommendations**: Smart product suggestions powered by Groq AI.
- **Secure Payments**: Integrated with Stripe for checkout processing.
- **Real-Time Notifications**: Socket.io for instant order/payment updates.
- **Admin Dashboard**: Dedicated portal for store management.
- **Beautiful UI**: Built with Tailwind CSS and Framer Motion.
- **Role-Based Access**: User, Manager, and Admin roles.
- **MongoDB Database**: Scalable NoSQL database with Mongoose.

---

### 📸 Screenshots

<details>
<summary>Click to view screenshots</summary>

#### 1. Admin Dashboard Overview
![Admin Dashboard Overview](screenshots/1_overview.png)

#### 2. Analytics Panel
![Analytics Panel](screenshots/2_analytics.png)

#### 3. Order Management
![Order Management](screenshots/3_orders.png)

#### 4. Customer List
![Customer List](screenshots/4_customers.png)

#### 5. User Landing Page
![User Landing Page](screenshots/5_landing_page.png)

#### 6. ShopFlow AI Assistant
![ShopFlow AI Assistant](screenshots/6_ai_assistant.png)

#### 7. Compare Products
![Compare Products](screenshots/7_compare.png)

#### 8. My Wishlist
![My Wishlist](screenshots/8_wishlist.png)

#### 9. Product Overview
![Product Overview](screenshots/9_product_overview.png)

#### 10. Smart AI Suggestions
![Smart AI Suggestions](screenshots/10_smart_suggestions.png)

#### 11. Shopping Cart
![Shopping Cart](screenshots/11_shopping_cart.png)

#### 12. Secure Checkout
![Secure Checkout](screenshots/12_secure_checkout.png)

#### 13. Select Payment Method
![Select Payment Method](screenshots/13_payment_method.png)

#### 14. Stripe Payment Processing
![Stripe Payment](screenshots/14_stripe_payment.png)

#### 15. Order Confirmation
![Order Confirmation](screenshots/15_order_confirmation.png)

#### 16. Invoice Generation
![Invoice Generation](screenshots/16_invoice.png)

#### 17. User Account Details
![User Account Details](screenshots/17_user_account.png)

#### 18. Order Cancellation
![Order Cancellation](screenshots/18_order_cancellation.png)

#### 19. Sale Page
![Sale Page](screenshots/19_sale_page.png)

</details>

---

### 📁 Project Structure

```text
ShopFlow/
├── backend/            # Node.js/Express backend
│   ├── config/         # Database and connection settings
│   ├── controllers/    # Request handlers
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API routes
│   ├── middleware/     # Auth and error middleware
│   └── server.js       # Main entry point
│
├── frontend/           # React frontend (Vite)
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Global state management
│   │   ├── pages/      # Application views
│   │   └── services/   # API logic
│   └── vite.config.js  # Vite configuration
└── README.md
```

---

### ⚙️ Installation

#### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shopflow
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret
GROQ_API_KEY=your_groq_api_key
```

Start the backend server:

```bash
npm run dev
```

#### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=/api
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

Start the frontend development server:

```bash
npm run dev
```

---

### 🌐 Access the Application

- **Frontend**: [http://localhost:5100](http://localhost:5100)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

### 🔑 Environment Variables

#### Backend
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `STRIPE_SECRET_KEY` - Stripe API secret key
- `GROQ_API_KEY` - Groq API key for AI features

#### Frontend
- `VITE_API_URL` - Backend API base URL
- `VITE_STRIPE_PUBLIC_KEY` - Stripe publishable key

---

### 🛠️ Technologies Used

#### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT (jsonwebtoken)
- bcryptjs
- Stripe
- Socket.io
- CORS

#### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Framer Motion
- React Hot Toast
- React Icons

#### 🎨 UI Features
- Responsive design
- Clean, modern aesthetic
- Smooth animations and transitions
- Loading states and skeletons
- Elegant error handling

---

### 🔌 Key API Endpoints

- `POST /api/users/login` - User login
- `POST /api/users` - User registration
- `GET /api/products` - Fetch all products
- `POST /api/orders` - Create a new order
- `POST /api/payment/create-payment-intent` - Initialize Stripe payment
- `POST /api/ai/recommendations` - Get AI product recommendations
