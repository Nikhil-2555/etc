const mongoose = require('mongoose');

const couponSchema = mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discountType: { type: String, enum: ['percentage', 'fixed', 'bogo'], required: true },
    discountValue: { type: Number, required: true, default: 0 },
    minOrderAmount: { type: Number, default: 0 },
    buyQuantity: { type: Number, default: 0 }, // For BOGO
    getQuantity: { type: Number, default: 0 }, // For BOGO
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    description: { type: String }, // e.g. "Festival discount"
}, {
    timestamps: true,
});

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
