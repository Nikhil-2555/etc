const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all active coupons
// @route   GET /api/coupons
// @access  Public or Protect
router.get('/', async (req, res) => {
    try {
        const coupons = await Coupon.find({ isActive: true });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching coupons', error: error.message });
    }
});

// @desc    Create a new coupon
// @route   POST /api/coupons
// @access  Admin
router.post('/', protect, admin, async (req, res) => {
    const {
        code,
        discountType,
        discountValue,
        minOrderAmount,
        buyQuantity,
        getQuantity,
        expiryDate,
        usageLimit,
        description
    } = req.body;

    const couponExists = await Coupon.findOne({ code });

    if (couponExists) {
        return res.status(400).json({ message: 'Coupon with this code already exists' });
    }

    const coupon = new Coupon({
        code,
        discountType,
        discountValue,
        minOrderAmount,
        buyQuantity,
        getQuantity,
        expiryDate,
        usageLimit,
        description
    });

    try {
        const createdCoupon = await coupon.save();
        res.status(201).json(createdCoupon);
    } catch (error) {
        res.status(500).json({ message: 'Error creating coupon', error: error.message });
    }
});

// @desc    Validate and apply a coupon
// @route   POST /api/coupons/apply
// @access  Protect
router.post('/apply', protect, async (req, res) => {
    const { code, orderAmount, items } = req.body;

    try {
        const coupon = await Coupon.findOne({ code });

        if (!coupon) {
            return res.status(404).json({ message: 'Invalid coupon code' });
        }

        if (!coupon.isActive) {
            return res.status(400).json({ message: 'Coupon is no longer active' });
        }

        if (new Date(coupon.expiryDate) < new Date()) {
            return res.status(400).json({ message: 'Coupon has expired' });
        }

        if (coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: 'Coupon usage limit reached' });
        }

        if (coupon.minOrderAmount > 0 && orderAmount < coupon.minOrderAmount) {
            return res.status(400).json({ message: `Minimum order amount of ₹${coupon.minOrderAmount} required` });
        }

        let discountAmount = 0;

        if (coupon.discountType === 'percentage') {
            discountAmount = (orderAmount * coupon.discountValue) / 100;
        } else if (coupon.discountType === 'fixed') {
            discountAmount = coupon.discountValue;
        } else if (coupon.discountType === 'bogo') {
            // Check if there are qualifying items (this is basic BOGO logic, can be improved)
            if (items && items.length > 0) {
                // Simplified BOGO: if they buy X, they get Y free (based on the cheapest item or a fixed mechanism)
                // We'll calculate BOGO dynamically in frontend for simplicity, just validating it here.
                res.json({ message: 'Coupon applied successfully', coupon });
                return;
            } else {
                return res.status(400).json({ message: `Not enough items for BOGO offer` });
            }
        }

        // Ensuring we don't have a discount bigger than the order itself
        if (discountAmount > orderAmount) {
            discountAmount = orderAmount;
        }

        res.json({ message: 'Coupon applied successfully', discountAmount, coupon });
    } catch (error) {
        res.status(500).json({ message: 'Error applying coupon', error: error.message });
    }
});

module.exports = router;
