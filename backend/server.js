const cluster = require('cluster');
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
const couponRoutes = require('./routes/couponRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const clusterRoutes = require('./routes/clusterRoutes');

connectDB();

const app = express();
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
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
app.use(express.urlencoded({ extended: true }));

// CORS — whitelist frontend origin
const allowedOrigins = [
    'http://localhost:5100',
    'http://127.0.0.1:5100',
    'http://localhost:5101',
    'http://127.0.0.1:5101',
    'https://localhost:5100',
    'https://127.0.0.1:5100'
];
app.use(cors({
    origin: function (origin, callback) {
        // Reflect the exact origin back to allow all origins with credentials
        callback(null, true);
    },
    credentials: true,
}));

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/cluster', clusterRoutes);
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

server.listen(PORT, () => {
    const workerLabel = cluster.isWorker ? `Worker #${process.env.WORKER_INDEX} (PID: ${process.pid})` : `PID: ${process.pid}`;
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT} [${workerLabel}]`);

    // Notify primary process that this worker is ready
    if (cluster.isWorker) {
        try {
            process.send({ type: 'worker:ready' });
        } catch (_) { /* not running in cluster mode */ }
    }
});

// Handle graceful shutdown from cluster primary
if (cluster.isWorker) {
    process.on('message', (msg) => {
        if (msg.type === 'shutdown') {
            console.log(`Worker ${process.pid} shutting down gracefully...`);
            server.close(() => process.exit(0));
        }
    });
}
