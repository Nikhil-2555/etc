/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchOrderById, cancelOrder } from '../services/api';
import { FiCheckCircle, FiPackage, FiTruck, FiShoppingBag, FiArrowRight, FiCopy, FiX, FiAlertTriangle, FiMessageSquare, FiDownload, FiFileText } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import generateInvoice from '../utils/generateInvoice';

const CANCEL_REASONS = [
    { id: 'changed_mind', label: 'Changed my mind', icon: '🤔' },
    { id: 'found_cheaper', label: 'Found a better price elsewhere', icon: '💰' },
    { id: 'ordered_mistake', label: 'Ordered by mistake', icon: '❌' },
    { id: 'delivery_time', label: 'Delivery time is too long', icon: '⏳' },
    { id: 'wrong_item', label: 'Ordered wrong item / size', icon: '📦' },
    { id: 'payment_issue', label: 'Payment or pricing issue', icon: '💳' },
];


const OrderConfirmation = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

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

    const openCancelModal = () => {
        setShowCancelModal(true);
        setSelectedReason('');
        setCustomReason('');
    };

    const closeCancelModal = () => {
        setShowCancelModal(false);
        setSelectedReason('');
        setCustomReason('');
        setIsCancelling(false);
    };

    const handleConfirmCancel = async () => {
        const reason = selectedReason === 'other'
            ? customReason.trim()
            : CANCEL_REASONS.find(r => r.id === selectedReason)?.label || '';

        if (!reason) {
            toast.error('Please select or enter a reason for cancellation');
            return;
        }

        setIsCancelling(true);
        try {
            await cancelOrder(order._id, reason);
            toast.success('Order cancelled successfully');
            setOrder(prev => ({ ...prev, status: 'cancelled', orderStatus: 'Cancelled', cancellationReason: reason, cancelledAt: new Date().toISOString() }));
            closeCancelModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel order');
            setIsCancelling(false);
        }
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

    const isCancelled = order.status === 'cancelled' || order.orderStatus === 'Cancelled';
    const canCancel = !isCancelled && (order.status === 'pending' || order.status === 'processing');

    return (
        <div className="w-full bg-[#fafafc] dark:bg-gray-950 py-4 lg:py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300 flex items-center min-h-[calc(100vh-300px)]">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/40 dark:bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/40 dark:bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
            {/* Cancel Reason Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeCancelModal} />
                    <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-lg overflow-hidden">
                        <div className="bg-red-500 px-6 py-5 text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <FiAlertTriangle size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">Cancel Order</h3>
                                    <p className="text-red-100 text-sm">Order #{order._id.slice(-8).toUpperCase()} • {formatCurrency(order.totalPrice)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-5">
                            <p className="text-sm text-gray-600 mb-5 font-medium">Please tell us why you'd like to cancel:</p>
                            <div className="space-y-2 mb-4">
                                {CANCEL_REASONS.map((reason) => (
                                    <button key={reason.id} type="button" onClick={() => { setSelectedReason(reason.id); setCustomReason(''); }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 ${selectedReason === reason.id ? 'border-red-400 bg-red-50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'}`}>
                                        <span className="text-lg flex-shrink-0">{reason.icon}</span>
                                        <span className={`text-sm font-medium ${selectedReason === reason.id ? 'text-red-700' : 'text-gray-700'}`}>{reason.label}</span>
                                        {selectedReason === reason.id && (
                                            <div className="ml-auto w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                        )}
                                    </button>
                                ))}
                                <button type="button" onClick={() => setSelectedReason('other')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 ${selectedReason === 'other' ? 'border-red-400 bg-red-50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'}`}>
                                    <span className="text-lg flex-shrink-0"><FiMessageSquare /></span>
                                    <span className={`text-sm font-medium ${selectedReason === 'other' ? 'text-red-700' : 'text-gray-700'}`}>Other reason</span>
                                    {selectedReason === 'other' && (
                                        <div className="ml-auto w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                    )}
                                </button>
                            </div>
                            {selectedReason === 'other' && (
                                <div>
                                    <textarea value={customReason} onChange={(e) => setCustomReason(e.target.value)} placeholder="Please describe your reason..." maxLength={300} rows={3}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-900 text-sm focus:outline-none focus:border-red-400 resize-none transition-colors" />
                                    <p className="text-xs text-gray-400 mt-1 text-right">{customReason.length}/300</p>
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                            <button onClick={closeCancelModal} className="flex-1 bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all active:scale-[0.98]">Keep Order</button>
                            <button onClick={handleConfirmCancel} disabled={isCancelling || !selectedReason || (selectedReason === 'other' && !customReason.trim())}
                                className={`flex-1 py-3 rounded-xl font-bold text-sm text-white transition-colors flex items-center justify-center gap-2 ${isCancelling || !selectedReason || (selectedReason === 'other' && !customReason.trim()) ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}>
                                {isCancelling ? (<><svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Cancelling...</>) : (<><FiX size={16} /> Cancel Order</>)}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-[2000px] mx-auto relative z-10 w-full">
                <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-3xl rounded-[2rem] border border-white/80 dark:border-gray-800/50 shadow-[0_8px_40px_rgb(0,0,0,0.06)] p-5 md:p-8">
                    {/* Header — Full Width */}
                    <div className="text-center mb-6 border-b border-gray-100 dark:border-gray-700/50/50 dark:border-gray-800/50 pb-5">
                    {isCancelled ? (
                        <div className="flex items-center justify-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                                <FiX className="text-red-500" size={24} />
                            </div>
                            <div className="text-left">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Order Cancelled</h1>
                                <p className="text-gray-500 text-sm">This order has been cancelled.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
                                <FiCheckCircle className="text-green-500" size={24} />
                            </div>
                            <div className="text-left">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white dark:text-white">Order Confirmed!</h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    {order.paymentMethod === 'COD' ? 'Pay when your order arrives.' : 'Your payment has been processed.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Cancellation Reason Banner — Full Width */}
                {isCancelled && order.cancellationReason && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                            <FiAlertTriangle className="text-red-500" size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-red-700 uppercase tracking-wider mb-1">Cancellation Reason</p>
                            <p className="text-sm text-red-600 font-medium">{order.cancellationReason}</p>
                            {order.cancelledAt && (
                                <p className="text-xs text-red-400 mt-1">
                                    Cancelled on {new Date(order.cancelledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* ═══════ THREE COLUMN LAYOUT ═══════ */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-stretch">

                    {/* ══ PROMOTIONAL BANNER (Left Space) ══ */}
                    <div className="hidden lg:block lg:col-span-3 xl:col-span-3">
                        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm overflow-hidden h-full relative group cursor-pointer min-h-[300px]">
                            <img 
                                src="/images/promo_banner.png" 
                                alt="Exclusive Offers" 
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent flex flex-col justify-end p-6 md:p-8">
                                <div className="bg-white/20 backdrop-blur-md w-fit px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-widest mb-3 border border-white/30">
                                    Special Offer
                                </div>
                                <h3 className="text-white font-bold text-2xl md:text-3xl mb-2 leading-tight">Thank You!</h3>
                                <p className="text-white/80 text-sm mb-6 leading-relaxed">Unlock exclusive discounts on your next purchase. Join our VIP club today and get 20% off.</p>
                                <button className="bg-white/20 backdrop-blur-md text-white border border-white/30 py-3.5 px-4 rounded-xl font-semibold text-sm hover:bg-white hover:text-gray-900 dark:text-white transition-all duration-300 w-full shadow-lg">
                                    Join VIP Club
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ══ CENTER COLUMN — Order Items ══ */}
                    <div className="lg:col-span-5 xl:col-span-5 space-y-4">
                        {/* Order ID + Payment Badge Bar */}
                        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/80">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Order ID</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-base font-mono font-bold text-gray-900 dark:text-white">#{order._id.slice(-8).toUpperCase()}</p>
                                            <button onClick={copyOrderId} className="text-gray-400 hover:text-primary-600 transition-colors" title="Copy full ID">
                                                <FiCopy size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    {getPaymentBadge()}
                                </div>
                            </div>

                            {/* Transaction ID (for online payments) */}
                            {order.transactionId && (
                                <div className="px-6 py-3 bg-green-50/50 border-b border-gray-100 dark:border-gray-700/50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Transaction ID</p>
                                            <p className="text-sm font-mono font-bold text-gray-900 dark:text-white">{order.transactionId}</p>
                                        </div>
                                        <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full">
                                            <FiCheckCircle className="text-green-600" size={12} />
                                            <span className="text-[10px] font-bold text-green-700">Verified</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Items Ordered */}
                            <div className="px-6 py-5 flex flex-col">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 flex-shrink-0">
                                    <FiPackage size={14} className="text-gray-400" /> Items Ordered
                                    <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-[10px] font-bold">{order.orderItems.length}</span>
                                </h3>
                                <div className="space-y-0 divide-y divide-gray-50 dark:divide-gray-700/50 overflow-y-auto max-h-[160px] scrollbar-thin pr-2">
                                    {order.orderItems.map((item, i) => (
                                        <div key={i} className="flex gap-4 items-center py-3 first:pt-0 last:pb-0">
                                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-700/50 p-2 flex-shrink-0 group hover:border-primary-200 transition-colors">
                                                <img src={item.image} alt={item.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug">{item.title}</p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">Qty: {item.quantity}</span>
                                                    {item.size && (
                                                        <span className="bg-primary-50 text-primary-600 px-2 py-0.5 rounded text-xs font-bold">Size: {item.size}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-base font-bold text-gray-900 dark:text-white flex-shrink-0">{formatCurrency(item.price * item.quantity)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ══ RIGHT COLUMN — Order Summary & Actions ══ */}
                    <div className="lg:col-span-4 xl:col-span-4 space-y-3 lg:pl-2 xl:pl-4 lg:border-l border-gray-100 dark:border-gray-700/50/50 flex flex-col justify-between">
                        {/* Order Info Cards */}
                        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/80">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Order Summary</h3>
                            </div>
                            <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {[
                                    { label: 'Date', value: new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                                    { label: 'Payment', value: order.paymentMethod },
                                    { label: 'Status', value: order.orderStatus || (order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Placed'), status: true },
                                ].map((item, i) => (
                                    <div key={i} className="px-5 py-3 flex items-center justify-between">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
                                        <p className={`text-sm font-bold ${item.status ? (
                                            isCancelled ? 'text-red-600' :
                                            order.status === 'delivered' ? 'text-green-600' :
                                            order.status === 'shipped' ? 'text-blue-600' :
                                            order.status === 'processing' ? 'text-indigo-600' :
                                            'text-amber-600'
                                        ) : 'text-gray-900 dark:text-white'}`}>{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping Address */}
                        {order.shippingAddress && (
                            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/80">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <FiTruck size={14} className="text-gray-400" /> Shipping Address
                                    </h3>
                                </div>
                                <div className="px-5 py-4">
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                        {order.shippingAddress.address}<br />
                                        {order.shippingAddress.city} — {order.shippingAddress.postalCode}<br />
                                        <span className="text-gray-500">{order.shippingAddress.country}</span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Price Breakdown */}
                        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/80">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Price Details</h3>
                            </div>
                            <div className="px-5 py-4">
                                <div className="space-y-3">
                                    {order.discountAmount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-600 font-medium">Coupon ({order.couponCode})</span>
                                            <span className="text-green-600 font-bold">-{formatCurrency(order.discountAmount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Shipping</span>
                                        <span>₹100</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <span>Total Paid</span>
                                        <span className="text-primary-600">{formatCurrency(order.totalPrice)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 gap-2 mt-1">
                            <button onClick={() => navigate(`/receipt/${order._id}`)} className="col-span-3 bg-gray-900 text-white py-2.5 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-1.5 shadow-md hover:bg-gray-800 transition-colors">
                                <FiFileText size={14} /> View Receipt
                            </button>
                            <button onClick={() => navigate('/products')} className="col-span-1 bg-primary-600 text-white py-2.5 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-1.5 shadow-sm hover:bg-primary-700 transition-colors">
                                <FiShoppingBag size={14} /> Shop
                            </button>
                            <button onClick={() => navigate('/dashboard')} className="col-span-1 bg-white border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-sm hover:bg-primary-50 transition-colors">
                                <FiPackage size={14} /> Orders
                            </button>
                            {canCancel ? (
                                <button onClick={openCancelModal} className="col-span-1 bg-white border border-red-200 text-red-600 py-2.5 rounded-xl font-bold text-[13px] flex items-center justify-center gap-1.5 shadow-sm hover:bg-red-50 transition-colors">
                                    <FiX size={14} /> Cancel
                                </button>
                            ) : (
                                <div className="col-span-1"></div>
                            )}
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
