const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc Get all orders (Admin)
// @route GET /api/admin/orders
router.get('/orders', protect, admin, async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// @desc Get all customers with real-time stats (Admin)
// @route GET /api/admin/customers
router.get('/customers', protect, admin, async (req, res) => {
    try {
        const customers = await User.aggregate([
            { $match: { role: 'user' } },
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
                    lastOrderDate: { $max: '$orders.createdAt' }
                }
            },
            {
                $addFields: {
                    status: {
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
            {
                $project: {
                    password: 0,
                    orders: 0,
                    __v: 0
                }
            },
            { $sort: { totalSpent: -1 } }
        ]);

        res.json(customers);
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({ message: 'Error fetching customers' });
    }
});


// @desc Create a new customer (Admin)
// @route POST /api/admin/customers
router.post('/customers', protect, admin, async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: 'user'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error creating customer', error: error.message });
    }
});

// @desc Get dashboard stats (Admin)
// @route GET /api/admin/stats
router.get('/stats', protect, admin, async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalCustomers = await User.countDocuments({ role: 'user' });
        const totalProducts = await Product.countDocuments();

        // Only count revenue from non-cancelled orders
        const orders = await Order.find({ status: { $ne: 'cancelled' } });
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
        const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;

        res.json({
            totalRevenue,
            totalOrders,
            totalCustomers,
            totalProducts,
            avgOrder
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

// @desc Get analytics data (Admin)
// @route GET /api/admin/analytics
router.get('/analytics', protect, admin, async (req, res) => {
    try {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const now = new Date();

        // 1. Monthly Revenue & Growth — always fill all 6 slots
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const monthlyRevenue = await Order.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                    revenue: { $sum: "$totalPrice" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // Build a map of year-month → revenue
        const monthMap = new Map();
        monthlyRevenue.forEach(item => {
            monthMap.set(`${item._id.year}-${item._id.month}`, { revenue: item.revenue, orders: item.orders });
        });

        // Fill all 6 months (including zeros) and calculate growth
        const formattedMonthlyData = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now);
            d.setMonth(d.getMonth() - i);
            const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
            const entry = monthMap.get(key) || { revenue: 0, orders: 0 };
            formattedMonthlyData.push({
                month: monthNames[d.getMonth()],
                revenue: entry.revenue,
                orders: entry.orders,
                growth: 0 // filled below
            });
        }
        // Calculate growth after filling gaps
        for (let i = 1; i < formattedMonthlyData.length; i++) {
            const prev = formattedMonthlyData[i - 1].revenue;
            const curr = formattedMonthlyData[i].revenue;
            formattedMonthlyData[i].growth = prev > 0
                ? Math.round(((curr - prev) / prev) * 1000) / 10
                : curr > 0 ? 100 : 0;
        }

        // 1c. Daily Revenue for current month (Growth Tracker detail view)
        const currentMonthStartDaily = new Date(now.getFullYear(), now.getMonth(), 1);
        const dailyOrdersRaw = await Order.aggregate([
            { $match: { createdAt: { $gte: currentMonthStartDaily } } },
            {
                $group: {
                    _id: { $dayOfMonth: "$createdAt" },
                    revenue: { $sum: "$totalPrice" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Fill in every day of the month up to today
        const todayDay = now.getDate();
        const dailyMap = new Map();
        dailyOrdersRaw.forEach(d => dailyMap.set(d._id, { revenue: d.revenue, orders: d.orders }));

        const formattedDailyGrowthData = [];
        for (let day = 1; day <= todayDay; day++) {
            const entry = dailyMap.get(day) || { revenue: 0, orders: 0 };
            const prev = formattedDailyGrowthData[formattedDailyGrowthData.length - 1];
            let growth = 0;
            if (prev) {
                const prevRev = prev.revenue;
                growth = prevRev > 0
                    ? Math.round(((entry.revenue - prevRev) / prevRev) * 1000) / 10
                    : entry.revenue > 0 ? 100 : 0;
            }
            formattedDailyGrowthData.push({
                day: `${monthNames[now.getMonth()]} ${day}`,
                revenue: entry.revenue,
                orders: entry.orders,
                growth
            });
        }

        // 1b. Weekly Revenue (Last 8 weeks)
        // Generate all 8 weeks upfront to ensure we have data for all weeks
        const weeks = [];
        const weeklyDataMap = new Map();

        // Generate week labels for the last 8 weeks (starting from 8 weeks ago)
        for (let i = 7; i >= 0; i--) {
            const weekStart = new Date(now);
            weekStart.setDate(weekStart.getDate() - (i * 7));
            weekStart.setHours(0, 0, 0, 0);

            // Get Monday of the week (ISO week starts on Monday)
            const dayOfWeek = weekStart.getDay();
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            weekStart.setDate(weekStart.getDate() - daysToMonday);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);

            // Use a simple week number (1-8) for labeling
            const weekNumber = 8 - i;
            const weekKey = `week-${weekNumber}`;

            weeks.push({
                weekStart,
                weekEnd,
                weekLabel: `W${weekNumber}`,
                weekKey
            });
        }

        // Get all orders from the last 8 weeks
        const eightWeeksAgo = new Date();
        eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
        eightWeeksAgo.setHours(0, 0, 0, 0);

        const allOrders = await Order.find({
            createdAt: { $gte: eightWeeksAgo }
        }).select('createdAt totalPrice');

        // Initialize all weeks with 0 revenue
        weeks.forEach(week => {
            weeklyDataMap.set(week.weekKey, {
                week: week.weekLabel,
                revenue: 0,
                orders: 0,
                growth: 0
            });
        });

        // Map orders to their respective weeks
        allOrders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            for (let i = 0; i < weeks.length; i++) {
                const week = weeks[i];
                if (orderDate >= week.weekStart && orderDate <= week.weekEnd) {
                    const weekData = weeklyDataMap.get(week.weekKey);
                    weekData.revenue += order.totalPrice;
                    weekData.orders += 1;
                    break;
                }
            }
        });

        // Calculate growth percentages
        const formattedWeeklyData = weeks.map((week, index) => {
            const weekData = weeklyDataMap.get(week.weekKey);
            let growth = 0;

            if (index > 0) {
                const prevWeekData = weeklyDataMap.get(weeks[index - 1].weekKey);
                const prevRevenue = prevWeekData.revenue;
                if (prevRevenue > 0) {
                    growth = ((weekData.revenue - prevRevenue) / prevRevenue) * 100;
                } else if (weekData.revenue > 0) {
                    growth = 100; // 100% growth if previous week had 0 revenue
                }
            }

            return {
                week: weekData.week,
                revenue: weekData.revenue,
                orders: weekData.orders,
                growth: Math.round(growth * 10) / 10
            };
        });

        // 2. Sales by Category
        const categorySales = await Order.aggregate([
            { $unwind: "$orderItems" },
            {
                $lookup: {
                    from: "products",
                    localField: "orderItems.product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $group: {
                    _id: "$productDetails.category",
                    value: { $sum: 1 },
                    revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
                }
            },
            {
                $project: {
                    name: "$_id",
                    value: 1,
                    revenue: 1
                }
            }
        ]);

        // 3. Daily Sales (Last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

        const dailyOrders = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dayOfWeek: "$createdAt" },
                    sales: { $sum: "$totalPrice" },
                    orders: { $sum: 1 }
                }
            }
        ]);

        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const formattedDailyData = dailyOrders.map(item => ({
            name: days[item._id - 1],
            sales: item.sales,
            orders: item.orders
        }));

        // 4. Top Selling Products
        const topProducts = await Order.aggregate([
            { $unwind: "$orderItems" },
            {
                $group: {
                    _id: "$orderItems.product",
                    title: { $first: "$orderItems.title" },
                    price: { $first: "$orderItems.price" },
                    image: { $first: "$orderItems.image" },
                    totalSold: { $sum: "$orderItems.quantity" },
                    totalRevenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 4 }
        ]);

        // 5. Recent Orders
        const recentOrders = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name')
            .select('user totalPrice createdAt status isPaid isDelivered orderItems');

        // 6. Low Stock Items (Stock < 2) - Critically Low
        const lowStockProducts = await Product.find({ stock: { $lt: 2 } })
            .select('title stock image category')
            .limit(10);

        // 7. Business Metrics
        const totalOrders = await Order.countDocuments();
        const totalRevenue = await Order.aggregate([
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);

        const currentMonthStart = new Date();
        currentMonthStart.setDate(1);
        currentMonthStart.setHours(0, 0, 0, 0);

        const currentMonthRevenue = await Order.aggregate([
            { $match: { createdAt: { $gte: currentMonthStart } } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);

        const lastMonthStart = new Date();
        lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
        lastMonthStart.setDate(1);
        lastMonthStart.setHours(0, 0, 0, 0);

        const lastMonthEnd = new Date(currentMonthStart);
        lastMonthEnd.setMilliseconds(-1);

        const lastMonthRevenue = await Order.aggregate([
            { $match: { createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);

        // Projected Revenue (based on current month trend)
        const currentRev = currentMonthRevenue[0]?.total || 0;
        const lastRev = lastMonthRevenue[0]?.total || 0;
        const projectedRevenue = currentRev > 0 ? Math.round(currentRev * 1.15) : lastRev;
        const revenueGrowth = lastRev > 0 ? ((currentRev - lastRev) / lastRev) * 100 : 0;

        // Conversion Rate (orders / total users)
        const totalUsers = await User.countDocuments({ role: 'user' });
        const conversionRate = totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0;

        // Cart Abandonment (mock calculation - would need cart tracking in real app)
        // For now, we'll estimate based on product views vs orders
        const totalProducts = await Product.countDocuments();
        const cartAbandonment = totalProducts > 0 ? Math.max(0, 100 - (totalOrders / totalProducts) * 10) : 24.5;

        res.json({
            monthlyData: formattedMonthlyData,
            weeklyData: formattedWeeklyData,
            dailyData: formattedDailyGrowthData,
            categoryData: categorySales,
            salesData: formattedDailyData,
            topProducts,
            recentOrders,
            lowStockProducts,
            metrics: {
                projectedRevenue,
                revenueGrowth: Math.round(revenueGrowth * 10) / 10,
                conversionRate: Math.round(conversionRate * 100) / 100,
                cartAbandonment: Math.round(cartAbandonment * 10) / 10
            }
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
});

// @desc Update user role (Admin)
// @route PUT /api/admin/users/:id
router.put('/users/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.role = req.body.role || user.role;
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
});

// @desc Delete user (Admin)
// @route DELETE /api/admin/users/:id
router.delete('/users/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            if (user.role === 'admin') {
                return res.status(400).json({ message: 'Cannot delete admin user' });
            }
            await User.deleteOne({ _id: user._id });
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// @desc Update order status (Admin)
// @route PATCH /api/admin/orders/:id/status
router.patch('/orders/:id/status', protect, admin, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;

        // Sync legacy flags
        if (status === 'delivered') {
            order.isDelivered = true;
            order.deliveredAt = new Date();
            order.isPaid = true;
            order.paidAt = order.paidAt || new Date();
        } else if (status === 'processing' || status === 'shipped') {
            order.isPaid = true;
            order.paidAt = order.paidAt || new Date();
            order.isDelivered = false;
        } else if (status === 'cancelled') {
            order.cancelledAt = new Date();
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error updating order status' });
    }
});

module.exports = router;

