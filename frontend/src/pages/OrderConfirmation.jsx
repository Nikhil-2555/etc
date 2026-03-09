import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchOrderById } from '../services/api';
import { FiCheckCircle, FiPackage, FiTruck, FiShoppingBag, FiArrowRight, FiCopy } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const OrderConfirmation = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadOrder = async () => {
            try {
                const data = await fetchOrderById(orderId);
                setOrder(data);
            } catch (error) {
                toast.error('Failed to load order details');
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        loadOrder();
    }, [orderId, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) return null;

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    const copyOrderId = () => {
        navigator.clipboard.writeText(order._id);
        toast.success('Order ID copied!');
    };

    const getPaymentBadge = () => {
        if (order.paymentMethod === 'COD') {
            return (
                <div className="flex items-center gap-1.5 bg-amber-100 px-3 py-1.5 rounded-full">
                    <FiTruck size={12} className="text-amber-600" />
                    <span className="text-xs font-bold text-amber-700">Cash on Delivery</span>
                </div>
            );
        }
        if (order.paymentStatus === 'Paid' || order.isPaid) {
            return (
                <div className="flex items-center gap-1.5 bg-green-100 px-3 py-1.5 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs font-bold text-green-700">Paid Online</span>
                </div>
            );
        }
        return (
            <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <span className="text-xs font-bold text-gray-600">Pending</span>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-green-200/40">
                        <FiCheckCircle className="text-white" size={36} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Order Confirmed!</h1>
                    <p className="text-gray-500 text-base">
                        Thank you for your order. {order.paymentMethod === 'COD' ? 'Pay when your order arrives.' : 'Your payment has been processed.'}
                    </p>
                </div>

                {/* Order Details Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
                    {/* Order Header */}
                    <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Order ID</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-base font-mono font-black text-gray-900">#{order._id.slice(-8).toUpperCase()}</p>
                                    <button onClick={copyOrderId} className="text-gray-400 hover:text-primary-600 transition-colors" title="Copy">
                                        <FiCopy size={14} />
                                    </button>
                                </div>
                            </div>
                            {getPaymentBadge()}
                        </div>
                    </div>

                    {/* Order Info Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-b border-gray-100">
                        {[
                            { label: 'Date', value: new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                            { label: 'Payment', value: order.paymentMethod },
                            { label: 'Status', value: order.orderStatus || (order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Placed') },
                            { label: 'Total', value: formatCurrency(order.totalPrice), highlight: true },
                        ].map((item, i) => (
                            <div key={i} className={`px-6 py-4 ${i < 3 ? 'border-r border-gray-100' : ''}`}>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{item.label}</p>
                                <p className={`text-sm font-bold ${item.highlight ? 'text-primary-600' : 'text-gray-900'}`}>{item.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Transaction ID (for online payments) */}
                    {order.transactionId && (
                        <div className="px-6 py-4 bg-green-50/50 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Transaction ID</p>
                                    <p className="text-sm font-mono font-bold text-gray-900">{order.transactionId}</p>
                                </div>
                                <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                                    <FiCheckCircle className="text-green-600" size={12} />
                                    <span className="text-[10px] font-bold text-green-700">Verified</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Items */}
                    <div className="px-6 py-5">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Items Ordered</h3>
                        <div className="space-y-4">
                            {order.orderItems.map((item, i) => (
                                <div key={i} className="flex gap-4 items-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-100 p-1.5 flex-shrink-0">
                                        <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                            {item.size && (
                                                <>
                                                    <span className="text-gray-300 text-[10px]">•</span>
                                                    <p className="text-xs font-bold text-primary-600">Size: {item.size}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm font-black text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                        <div className="px-6 py-5 border-t border-gray-100 bg-gray-50/50">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <FiTruck className="text-gray-400" size={14} /> Shipping Address
                            </h3>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {order.shippingAddress.address}<br />
                                {order.shippingAddress.city} — {order.shippingAddress.postalCode}<br />
                                {order.shippingAddress.country}
                            </p>
                        </div>
                    )}

                    {/* Price Breakdown */}
                    <div className="px-6 py-5 border-t border-gray-100">
                        <div className="space-y-2">
                            {order.discountAmount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-600 font-medium">Coupon Discount ({order.couponCode})</span>
                                    <span className="text-green-600 font-bold">-{formatCurrency(order.discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Shipping</span>
                                <span>₹100</span>
                            </div>
                            <div className="flex justify-between font-black text-lg text-gray-900 pt-2 border-t border-gray-200">
                                <span>Total Paid</span>
                                <span className="text-primary-600">{formatCurrency(order.totalPrice)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/products')}
                        className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold text-base shadow-lg hover:shadow-primary-600/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        <FiShoppingBag size={18} /> Continue Shopping
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-white border-2 border-gray-200 hover:border-primary-300 text-gray-700 hover:text-primary-700 py-4 rounded-xl font-bold text-base hover:bg-primary-50 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        <FiPackage size={18} /> View My Orders <FiArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
