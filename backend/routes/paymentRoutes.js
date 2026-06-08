const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
}

// @desc    Create a Stripe PaymentIntent
// @route   POST /api/payment/create-payment-intent
// @access  Private
router.post('/create-payment-intent', protect, async (req, res) => {
    try {
        const { amount, currency = 'inr', orderId } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid payment amount' });
        }

        if (!stripe) {
            return res.status(500).json({ message: 'Stripe is not configured on the server. Please add STRIPE_SECRET_KEY.' });
        }

        // Stripe expects amount in the smallest currency unit (paise for INR)
        const amountInSmallestUnit = Math.round(amount * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInSmallestUnit,
            currency,
            metadata: {
                orderId: orderId || '',
                userId: req.user._id.toString(),
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });
    } catch (error) {
        console.error('Stripe PaymentIntent error:', error.message);
        res.status(500).json({ message: 'Failed to create payment intent', error: error.message });
    }
});

// @desc    Confirm a Stripe payment and update order
// @route   POST /api/payment/confirm
// @access  Private
router.post('/confirm', protect, async (req, res) => {
    try {
        const { paymentIntentId, orderId } = req.body;

        if (!paymentIntentId || !orderId) {
            return res.status(400).json({ message: 'Missing paymentIntentId or orderId' });
        }

        if (!stripe) {
            return res.status(500).json({ message: 'Stripe is not configured on the server. Please add STRIPE_SECRET_KEY.' });
        }

        // Verify the payment intent status with Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({
                message: 'Payment not completed',
                status: paymentIntent.status,
            });
        }

        // Update the order
        const Order = require('../models/Order');
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Ensure user owns the order
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        order.paymentStatus = 'Paid';
        order.orderStatus = 'Placed';
        order.transactionId = paymentIntentId;
        order.isPaid = true;
        order.paidAt = Date.now();
        order.status = 'processing';

        const updatedOrder = await order.save();

        // Emit Real-Time Notification for Payment Success
        if (req.app.locals.io) {
            req.app.locals.io.to(req.user._id.toString()).emit('notification', {
                title: 'Payment Successful! 🎉',
                message: `Your Stripe payment of ₹${order.totalPrice} was successful.`,
                type: 'success'
            });
        }

        res.json({
            success: true,
            transactionId: paymentIntentId,
            order: updatedOrder,
        });
    } catch (error) {
        console.error('Stripe confirm error:', error.message);
        res.status(500).json({ message: 'Failed to confirm payment', error: error.message });
    }
});

module.exports = router;
