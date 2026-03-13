const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    orderItems: [{
        title: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        size: { type: String },
        product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
    }],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
    orderStatus: { type: String, enum: ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Placed' },
    transactionId: { type: String },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
    couponCode: { type: String },
    discountAmount: { type: Number, default: 0 },
    rewardPointsEarned: { type: Number, default: 0 },
}, {
    timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
