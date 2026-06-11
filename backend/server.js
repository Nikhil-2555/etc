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

// ── CORS origin whitelist (shared by Express & Socket.io) ──
const allowedOrigins = [
    'http://localhost:5100',
    'http://127.0.0.1:5100',
    'http://localhost:5101',
    'http://127.0.0.1:5101',
    'https://localhost:5100',
    'https://127.0.0.1:5100',
    'https://shopflow-kappa-three.vercel.app',
    'https://etc-production-89ba.up.railway.app',
];
// Add the production CLIENT_URL if it exists (strip trailing slash)
if (process.env.CLIENT_URL) {
    const clientUrl = process.env.CLIENT_URL.replace(/\/+$/, '');
    if (!allowedOrigins.includes(clientUrl)) {
        allowedOrigins.push(clientUrl);
    }
}

// Shared CORS origin checker — also allows Vercel preview URLs
function checkOrigin(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
        return callback(null, true);
    }
    // Allow any Vercel preview deployment of the same project
    if (/^https:\/\/shopflow.*\.vercel\.app$/.test(origin)) {
        return callback(null, true);
    }
    console.warn(`CORS blocked origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
}

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: checkOrigin,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    },
    // Mobile browsers may close connections more aggressively
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
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

// ── Explicit preflight handler for mobile browser compatibility ──
// Some mobile browsers (especially older Android WebViews) require an
// explicit OPTIONS response before CORS middleware runs.
app.options('(.*)', (req, res) => {
    const origin = req.headers.origin;
    checkOrigin(origin, (err, allowed) => {
        if (allowed) {
            res.header('Access-Control-Allow-Origin', origin);
            res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
            res.header('Access-Control-Allow-Credentials', 'true');
            res.header('Access-Control-Max-Age', '86400');
            return res.sendStatus(204);
        }
        return res.sendStatus(403);
    });
});

// ── CORS middleware (MUST be before body parsers for mobile preflight) ──
const corsOptions = {
    origin: checkOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Length', 'X-Request-Id'],
    maxAge: 86400, // Cache preflight for 24 hours to reduce mobile overhead
};

// Handle CORS for all routes
app.use(cors(corsOptions));

// Body parsers AFTER CORS so mobile preflight OPTIONS never hits JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/cluster', clusterRoutes);
// Quick seeding endpoint for production initialization
app.get('/api/seed-database', (req, res) => {
    const { exec } = require('child_process');
    const path = require('path');
    console.log('Seeding database from API...');
    
    exec(`node ${path.join(__dirname, 'scripts', 'seeder.js')}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Seed error: ${error}`);
            return res.status(500).json({ success: false, message: 'Seeding failed', error: error.message });
        }
        res.json({ success: true, message: 'Database successfully seeded!', output: stdout });
    });
});

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
