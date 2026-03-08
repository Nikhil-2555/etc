const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');

connectDB();

const app = express();
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5100', 'http://127.0.0.1:5100', 'http://localhost:5101', 'http://127.0.0.1:5101'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});

// Attach io to the req object or app locals so we can use it in routes
app.locals.io = io;

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // User joins their own room to receive private notifications
    socket.on('join_user_room', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their notification room.`);
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
    });
});

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());

// CORS — whitelist frontend origin
const allowedOrigins = [
    'http://localhost:5100',
    'http://127.0.0.1:5100',
    'http://localhost:5101',
    'http://127.0.0.1:5101',
];
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
