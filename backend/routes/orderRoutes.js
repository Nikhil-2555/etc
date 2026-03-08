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
        totalPrice,
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
            totalPrice,
            status: 'pending',
        });

        const createdOrder = await order.save();

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
        order.cancelledAt = Date.now();

        const updatedOrder = await order.save();
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
