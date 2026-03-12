const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc Create new order
// @route POST /api/orders
router.post('/', protect, async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        paymentStatus,
        orderStatus,
        transactionId,
        totalPrice,
        couponCode,
        discountAmount,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400).json({ message: 'No order items' });
        return;
    } else {
        const order = new Order({
            orderItems: orderItems.map((x) => ({
                ...x,
                product: x._id || x.product,
                _id: undefined
            })),
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            paymentStatus: paymentStatus || 'Pending',
            orderStatus: orderStatus || 'Placed',
            transactionId: transactionId || null,
            totalPrice,
            isPaid: paymentStatus === 'Paid',
            paidAt: paymentStatus === 'Paid' ? Date.now() : undefined,
            status: paymentMethod === 'COD' ? 'pending' : 'pending',
            couponCode,
            discountAmount,
            rewardPointsEarned: Math.floor(totalPrice / 100),
        });

        const createdOrder = await order.save();

        // Update User Reward Points
        const user = await require('../models/User').findById(req.user._id);
        if (user) {
            user.rewardPoints += createdOrder.rewardPointsEarned;
            await user.save();
        }

        // Emit Real-Time Notification for Order Placed
        if (req.app.locals.io) {
            req.app.locals.io.to(req.user._id.toString()).emit('notification', {
                title: 'Order Placed!',
                message: `Your order has been placed successfully.`,
                type: 'success'
            });
        }

        res.status(201).json(createdOrder);
    }
});

// @desc Simulate payment for an order (Demo)
// @route PUT /api/orders/:id/simulate-payment
router.put('/:id/simulate-payment', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Ensure user owns the order
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (order.status === 'cancelled') {
            return res.status(400).json({ message: 'Cannot pay a cancelled order' });
        }

        // Simulate 80% success rate
        const isSuccess = Math.random() < 0.8;

        if (isSuccess) {
            const transactionId = 'TXN' + Date.now() + Math.floor(Math.random() * 10000);
            order.paymentStatus = 'Paid';
            order.orderStatus = 'Placed';
            order.transactionId = transactionId;
            order.isPaid = true;
            order.paidAt = Date.now();
            order.status = 'processing';

            const updatedOrder = await order.save();

            // Emit Real-Time Notification for Payment Success
            if (req.app.locals.io) {
                req.app.locals.io.to(req.user._id.toString()).emit('notification', {
                    title: 'Payment Successful! 🎉',
                    message: `Your payment of ₹${order.totalPrice} was successful. Transaction ID: ${transactionId}`,
                    type: 'success'
                });
            }

            return res.json({
                success: true,
                transactionId,
                order: updatedOrder,
            });
        } else {
            order.paymentStatus = 'Failed';
            order.orderStatus = 'Placed';
            const updatedOrder = await order.save();

            return res.json({
                success: false,
                order: updatedOrder,
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error simulating payment', error: error.message });
    }
});

// @desc Get logged in user orders
// @route GET /api/orders/myorders
router.get('/myorders', protect, async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
});

// @desc Get order by ID
// @route GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
});

// @desc Pay an order
// @route PUT /api/orders/:id/pay
router.put('/:id/pay', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Ensure user owns the order or is admin
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (order.status === 'cancelled') {
            return res.status(400).json({ message: 'Cannot pay a cancelled order' });
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.status = 'processing';
        order.paymentStatus = 'Paid';
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            update_time: req.body.update_time,
            email_address: req.body.email_address,
            paymentMethod: req.body.paymentMethod,
        };

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error updating order payment', error: error.message });
    }
});

// @desc Cancel an order (User)
// @route PATCH /api/orders/:id/cancel
router.patch('/:id/cancel', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Ensure user owns the order or is admin
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (order.status === 'delivered' || order.status === 'shipped') {
            return res.status(400).json({ message: 'Cannot cancel an order that is shipped or delivered' });
        }

        if (order.status === 'cancelled') {
            return res.status(400).json({ message: 'Order is already cancelled' });
        }

        order.status = 'cancelled';
        order.orderStatus = 'Cancelled';
        order.cancelledAt = Date.now();
        order.cancellationReason = req.body.reason || 'No reason provided';

        const updatedOrder = await order.save();

        // Emit Real-Time Notification for Order Cancelled
        if (req.app.locals.io) {
            req.app.locals.io.to(req.user._id.toString()).emit('notification', {
                title: 'Order Cancelled',
                message: `Your order #${order._id.toString().slice(-8).toUpperCase()} has been cancelled.`,
                type: 'warning'
            });
        }

        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling order', error: error.message });
    }
});

// @desc Get all orders (Admin)
// @route GET /api/orders
router.get('/', protect, admin, async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
});

module.exports = router;
