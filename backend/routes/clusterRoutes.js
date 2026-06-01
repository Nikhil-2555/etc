const express = require('express');
const router = express.Router();
const cluster = require('cluster');
const os = require('os');
const User = require('../models/User');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/authMiddleware');

// ── Track per-worker request counts ──
let requestsHandled = 0;

// Middleware to count requests for this worker
router.use((req, res, next) => {
    requestsHandled++;
    next();
});

// Report metrics to primary process periodically
if (cluster.isWorker) {
    setInterval(() => {
        try {
            process.send({
                type: 'worker:metrics',
                requestsHandled,
                memoryUsage: process.memoryUsage().heapUsed,
            });
        } catch (_) { /* primary may have disconnected */ }
    }, 5000);
}

// ─────────────────────────────────────────────────
// @desc    Get cluster health & worker status
// @route   GET /api/cluster/status
// @access  Admin
// ─────────────────────────────────────────────────
router.get('/status', protect, admin, async (req, res) => {
    try {
        if (cluster.isWorker) {
            // Ask the primary for full cluster info via IPC
            const clusterData = await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Cluster status request timed out'));
                }, 5000);

                process.once('message', (msg) => {
                    if (msg.type === 'cluster:status:response') {
                        clearTimeout(timeout);
                        resolve(msg.data);
                    }
                });

                process.send({ type: 'cluster:status' });
            });

            res.json({
                mode: 'cluster',
                currentWorker: {
                    id: cluster.worker.id,
                    pid: process.pid,
                    requestsHandled,
                    memoryUsage: process.memoryUsage(),
                },
                cluster: clusterData,
            });
        } else {
            // Running in single-process mode (no cluster)
            res.json({
                mode: 'single',
                currentWorker: {
                    pid: process.pid,
                    requestsHandled,
                    memoryUsage: process.memoryUsage(),
                },
                system: {
                    cpuCores: os.cpus().length,
                    platform: os.platform(),
                    arch: os.arch(),
                    totalMemory: os.totalmem(),
                    freeMemory: os.freemem(),
                    loadAverage: os.loadavg(),
                    uptime: process.uptime(),
                },
            });
        }
    } catch (error) {
        console.error('Cluster status error:', error.message);
        // Fallback to single-process mode info
        res.json({
            mode: 'single',
            currentWorker: {
                pid: process.pid,
                requestsHandled,
                memoryUsage: process.memoryUsage(),
            },
            system: {
                cpuCores: os.cpus().length,
                platform: os.platform(),
                arch: os.arch(),
                totalMemory: os.totalmem(),
                freeMemory: os.freemem(),
                loadAverage: os.loadavg(),
                uptime: process.uptime(),
            },
        });
    }
});

// ─────────────────────────────────────────────────
// @desc    Get paginated users with search, filter, sort
// @route   GET /api/cluster/users
// @access  Admin
// ─────────────────────────────────────────────────
router.get('/users', protect, admin, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search = '',
            role = '',
            status = '',
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = req.query;

        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        // Build filter
        const filter = {};
        if (role && role !== 'all') filter.role = role;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        // Build sort
        const sortDir = sortOrder === 'asc' ? 1 : -1;
        const sortObj = { [sortBy]: sortDir };

        // Execute query with aggregation for enriched data
        const [users, totalCount] = await Promise.all([
            User.aggregate([
                { $match: filter },
                {
                    $lookup: {
                        from: 'orders',
                        localField: '_id',
                        foreignField: 'user',
                        as: 'orders'
                    }
                },
                {
                    $addFields: {
                        totalOrders: { $size: '$orders' },
                        totalSpent: {
                            $sum: {
                                $map: {
                                    input: {
                                        $filter: {
                                            input: '$orders',
                                            as: 'o',
                                            cond: { $ne: ['$$o.status', 'cancelled'] }
                                        }
                                    },
                                    as: 'o',
                                    in: '$$o.totalPrice'
                                }
                            }
                        },
                        lastOrderDate: { $max: '$orders.createdAt' },
                        lastLogin: '$updatedAt',
                    }
                },
                {
                    $addFields: {
                        activityStatus: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gt: ['$totalOrders', 0] },
                                        {
                                            $gte: [
                                                '$lastOrderDate',
                                                { $dateSubtract: { startDate: '$$NOW', unit: 'day', amount: 30 } }
                                            ]
                                        }
                                    ]
                                },
                                then: 'active',
                                else: {
                                    $cond: {
                                        if: { $gt: ['$totalOrders', 0] },
                                        then: 'inactive',
                                        else: 'new'
                                    }
                                }
                            }
                        }
                    }
                },
                // Apply status filter after computation
                ...(status && status !== 'all' ? [{ $match: { activityStatus: status } }] : []),
                { $project: { password: 0, orders: 0, __v: 0 } },
                { $sort: sortObj },
                { $skip: skip },
                { $limit: limitNum },
            ]),
            User.countDocuments(filter),
        ]);

        // Summary stats
        const [roleCounts, statusCounts] = await Promise.all([
            User.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } }
            ]),
            User.aggregate([
                {
                    $lookup: {
                        from: 'orders',
                        localField: '_id',
                        foreignField: 'user',
                        as: 'orders'
                    }
                },
                {
                    $addFields: {
                        totalOrders: { $size: '$orders' },
                        lastOrderDate: { $max: '$orders.createdAt' }
                    }
                },
                {
                    $addFields: {
                        activityStatus: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $gt: ['$totalOrders', 0] },
                                        { $gte: ['$lastOrderDate', { $dateSubtract: { startDate: '$$NOW', unit: 'day', amount: 30 } }] }
                                    ]
                                },
                                then: 'active',
                                else: { $cond: { if: { $gt: ['$totalOrders', 0] }, then: 'inactive', else: 'new' } }
                            }
                        }
                    }
                },
                { $group: { _id: '$activityStatus', count: { $sum: 1 } } }
            ]),
        ]);

        res.json({
            users,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitNum),
            },
            summary: {
                roles: Object.fromEntries(roleCounts.map(r => [r._id, r.count])),
                statuses: Object.fromEntries(statusCounts.map(s => [s._id, s.count])),
            },
            worker: {
                pid: process.pid,
                id: cluster.isWorker ? cluster.worker.id : 0,
            }
        });
    } catch (error) {
        console.error('Cluster users error:', error.message);
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// ─────────────────────────────────────────────────
// @desc    Batch update user roles
// @route   PUT /api/cluster/users/batch-role
// @access  Admin
// ─────────────────────────────────────────────────
router.put('/users/batch-role', protect, admin, async (req, res) => {
    try {
        const { userIds, role } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: 'Please provide an array of user IDs' });
        }
        if (!['user', 'admin', 'manager'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be user, admin, or manager' });
        }

        const result = await User.updateMany(
            { _id: { $in: userIds } },
            { $set: { role } }
        );

        res.json({
            message: `Updated ${result.modifiedCount} user(s) to role: ${role}`,
            modifiedCount: result.modifiedCount,
            worker: { pid: process.pid }
        });
    } catch (error) {
        console.error('Batch role update error:', error.message);
        res.status(500).json({ message: 'Error updating user roles' });
    }
});

// ─────────────────────────────────────────────────
// @desc    Batch delete users
// @route   DELETE /api/cluster/users/batch
// @access  Admin
// ─────────────────────────────────────────────────
router.delete('/users/batch', protect, admin, async (req, res) => {
    try {
        const { userIds } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: 'Please provide an array of user IDs' });
        }

        // Don't allow deleting admins
        const adminUsers = await User.find({ _id: { $in: userIds }, role: 'admin' });
        if (adminUsers.length > 0) {
            return res.status(400).json({
                message: `Cannot delete ${adminUsers.length} admin user(s). Remove them from selection.`
            });
        }

        const result = await User.deleteMany({ _id: { $in: userIds }, role: { $ne: 'admin' } });

        res.json({
            message: `Deleted ${result.deletedCount} user(s)`,
            deletedCount: result.deletedCount,
            worker: { pid: process.pid }
        });
    } catch (error) {
        console.error('Batch delete error:', error.message);
        res.status(500).json({ message: 'Error deleting users' });
    }
});

// ─────────────────────────────────────────────────
// @desc    Export users as JSON (for admin download)
// @route   GET /api/cluster/users/export
// @access  Admin
// ─────────────────────────────────────────────────
router.get('/users/export', protect, admin, async (req, res) => {
    try {
        const users = await User.aggregate([
            {
                $lookup: {
                    from: 'orders',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'orders'
                }
            },
            {
                $addFields: {
                    totalOrders: { $size: '$orders' },
                    totalSpent: {
                        $sum: {
                            $map: {
                                input: { $filter: { input: '$orders', as: 'o', cond: { $ne: ['$$o.status', 'cancelled'] } } },
                                as: 'o',
                                in: '$$o.totalPrice'
                            }
                        }
                    },
                    lastOrderDate: { $max: '$orders.createdAt' }
                }
            },
            { $project: { password: 0, orders: 0, __v: 0 } },
            { $sort: { createdAt: -1 } }
        ]);

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=users_export_${new Date().toISOString().split('T')[0]}.json`);
        res.json(users);
    } catch (error) {
        console.error('Export error:', error.message);
        res.status(500).json({ message: 'Error exporting users' });
    }
});

module.exports = router;
