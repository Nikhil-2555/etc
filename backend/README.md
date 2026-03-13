# ShopFlow Backend

This is the Node.js/Express backend for the ShopFlow e-commerce platform.

## Features
- **Authentication**: JWT-based login and signup.
- **Role-Based Access**: User, Admin, and Manager roles.
- **Product Management**: CRUD for products (Admin/Manager only).
- **Order Management**: Checkout and order history.
- **Database**: MongoDB with Mongoose.

## Getting Started

### Prerequisites
- Node.js installed.
- MongoDB running locally on `mongodb://localhost:27017/shopflow` or update `.env`.

### Installation
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Seeding Data
To populate the database with initial products:
```bash
node seeder.js
```

### Running the Server
```bash
npm start
```
By default, the server runs on `http://localhost:5000`.

## API Endpoints

### Users
- `POST /api/users/login` - Login user
- `POST /api/users` - Register user
- `GET /api/users/profile` - Get user profile (Protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Orders
- `POST /api/orders` - Place new order (Protected)
- `GET /api/orders/myorders` - Get user's orders (Protected)
- `GET /api/orders` - Get all orders (Admin only)
