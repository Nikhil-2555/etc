
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiBox, FiUser, FiSettings, FiLogOut, FiCalendar, FiMail, FiMapPin, FiShoppingBag, FiInfo, FiEdit2, FiTrash2, FiSave, FiX, FiAlertTriangle, FiMessageSquare, FiFileText, FiEye } from 'react-icons/fi';
import { fetchMyOrders, updateProfile as updateUserProfileAPI, deleteAccount, cancelOrder, fetchActiveCoupons, fetchProfile } from '../../services/api';
import { toast } from 'react-hot-toast';

const CANCEL_REASONS = [
    { id: 'changed_mind', label: 'Changed my mind', icon: '🤔' },
    { id: 'found_cheaper', label: 'Found a better price elsewhere', icon: '💰' },
    { id: 'ordered_mistake', label: 'Ordered by mistake', icon: '❌' },
    { id: 'delivery_time', label: 'Delivery time is too long', icon: '⏳' },
    { id: 'wrong_item', label: 'Ordered wrong item / size', icon: '📦' },
    { id: 'payment_issue', label: 'Payment or pricing issue', icon: '💳' },
];

const UserDashboard = () => {
    const { user, logout, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rewardPoints, setRewardPoints] = useState(0);
    const [activeCoupons, setActiveCoupons] = useState([]);

    // Cancel Modal State
    const [cancelModal, setCancelModal] = useState({ open: false, orderId: null });
    const [selectedReason, setSelectedReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    // Profile Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        confirmPassword: ''
    });

    const { darkMode, toggleTheme } = useTheme();

    // Settings State
    const [settings, setSettings] = useState({
        notifications: true
    });

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const data = await fetchMyOrders();
                setOrders(data);
            } catch (error) {
                console.error("Failed to load orders", error);
            } finally {
                setLoading(false);
            }
        };

        const loadProfileAndCoupons = async () => {
            try {
                const profileData = await fetchProfile();
                setRewardPoints(profileData.rewardPoints || 0);

                const coupons = await fetchActiveCoupons();
                setActiveCoupons(coupons);
            } catch (error) {
                console.error("Failed to load profile details or coupons", error);
            }
        };

        if (activeTab === 'orders') {
            loadOrders();
        } else if (activeTab === 'profile') {
            loadProfileAndCoupons();
        }
    }, [activeTab]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            const updatedData = {
                name: formData.name,
                email: formData.email,
                ...(formData.password && { password: formData.password })
            };

            const data = await updateUserProfileAPI(updatedData);
            updateProfile(data);
            setIsEditing(false);
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await deleteAccount();
            toast.success("Account deleted successfully");
            logout();
        } catch (error) {
            toast.error("Failed to delete account");
        }
    };

    // Open cancel modal
    const openCancelModal = (orderId) => {
        setCancelModal({ open: true, orderId });
        setSelectedReason('');
        setCustomReason('');
    };

    // Close cancel modal
    const closeCancelModal = () => {
        setCancelModal({ open: false, orderId: null });
        setSelectedReason('');
        setCustomReason('');
        setIsCancelling(false);
    };

    // Handle actual cancellation with reason
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
            await cancelOrder(cancelModal.orderId, reason);
            toast.success('Order cancelled successfully');
            setOrders(prev => prev.map(o =>
                o._id === cancelModal.orderId
                    ? { ...o, status: 'cancelled', cancellationReason: reason, cancelledAt: new Date().toISOString() }
                    : o
            ));
            closeCancelModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel order');
            setIsCancelling(false);
        }
    };

    // Cancel Reason Modal Component
    const CancelModal = () => {
        if (!cancelModal.open) return null;

        const cancellingOrder = orders.find(o => o._id === cancelModal.orderId);

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeCancelModal} />

                {/* Modal */}
                <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-5 text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <FiAlertTriangle size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black">Cancel Order</h3>
                                <p className="text-red-100 text-sm">
                                    Order #{cancelModal.orderId?.slice(-8).toUpperCase()} • {cancellingOrder ? formatCurrency(cancellingOrder.totalPrice) : ''}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 font-medium">
                            Please tell us why you'd like to cancel this order:
                        </p>

                        {/* Preset Reasons */}
                        <div className="space-y-2 mb-4">
                            {CANCEL_REASONS.map((reason) => (
                                <button
                                    key={reason.id}
                                    type="button"
                                    onClick={() => { setSelectedReason(reason.id); setCustomReason(''); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 ${selectedReason === reason.id
                                        ? 'border-red-400 bg-red-50 dark:bg-red-900/20 shadow-sm'
                                        : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-sm'
                                        }`}
                                >
                                    <span className="text-lg flex-shrink-0">{reason.icon}</span>
                                    <span className={`text-sm font-medium ${selectedReason === reason.id ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {reason.label}
                                    </span>
                                    {selectedReason === reason.id && (
                                        <div className="ml-auto w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            ))}

                            {/* Other / Custom Reason */}
                            <button
                                type="button"
                                onClick={() => setSelectedReason('other')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 ${selectedReason === 'other'
                                    ? 'border-red-400 bg-red-50 dark:bg-red-900/20 shadow-sm'
                                    : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-sm'
                                    }`}
                            >
                                <span className="text-lg flex-shrink-0"><FiMessageSquare /></span>
                                <span className={`text-sm font-medium ${selectedReason === 'other' ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                    Other reason
                                </span>
                                {selectedReason === 'other' && (
                                    <div className="ml-auto w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        </div>

                        {/* Custom Reason Text Area */}
                        {selectedReason === 'other' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <textarea
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    placeholder="Please describe your reason..."
                                    maxLength={300}
                                    rows={3}
                                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-400 resize-none transition-colors"
                                />
                                <p className="text-xs text-gray-400 mt-1 text-right">{customReason.length}/300</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                        <button
                            onClick={closeCancelModal}
                            className="flex-1 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-all active:scale-[0.98]"
                        >
                            Keep Order
                        </button>
                        <button
                            onClick={handleConfirmCancel}
                            disabled={isCancelling || (!selectedReason) || (selectedReason === 'other' && !customReason.trim())}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${isCancelling || (!selectedReason) || (selectedReason === 'other' && !customReason.trim())
                                ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg hover:shadow-red-500/30'
                                }`}
                        >
                            {isCancelling ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Cancelling...
                                </>
                            ) : (
                                <>
                                    <FiX size={16} /> Cancel Order
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderOrders = () => (
        <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FiBox className="text-primary-600" /> Recent Orders
            </h2>

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            ) : orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order._id} className={`bg-white dark:bg-gray-800 rounded-2xl border transition-all hover:shadow-md ${order.status === 'cancelled'
                            ? 'border-red-200 dark:border-red-900/50'
                            : 'border-gray-100 dark:border-gray-700'
                            }`}>
                            {/* Order Header Row */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${order.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                                        order.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                                            order.status === 'shipped' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                                                order.status === 'processing' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600' :
                                                    'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                                        }`}>
                                        <FiBox size={18} />
                                    </div>
                                    <div>
                                        <p className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                                            #{order._id.slice(-8).toUpperCase()}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            {formatDate(order.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                                        ${order.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                            order.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                                order.status === 'shipped' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                                                    order.status === 'processing' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' :
                                                        'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                                        {order.status === 'cancelled' ? 'Cancelled' :
                                            order.status === 'delivered' ? 'Delivered' :
                                                order.status === 'shipped' ? 'Shipped' :
                                                    order.status === 'processing' ? 'Processing' : 'Pending'}
                                    </span>

                                    <span className="font-bold text-gray-900 dark:text-white text-sm">
                                        {formatCurrency(order.totalPrice)}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => navigate(`/order-confirmation/${order._id}`)}
                                            className="text-primary-600 hover:text-primary-800 dark:hover:text-primary-400 text-sm font-bold transition-colors flex items-center gap-1"
                                        >
                                            <FiEye size={14} /> View Details
                                        </button>
                                        <span className="text-gray-200 dark:text-gray-600">|</span>
                                        <button
                                            onClick={() => navigate(`/receipt/${order._id}`)}
                                            className="text-emerald-600 hover:text-emerald-800 dark:hover:text-emerald-400 text-sm font-bold transition-colors flex items-center gap-1"
                                        >
                                            <FiFileText size={14} /> Receipt
                                        </button>
                                        {(order.status === 'pending' || order.status === 'processing') && (
                                            <button
                                                onClick={() => openCancelModal(order._id)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-transparent hover:border-red-200 dark:hover:border-red-800 flex items-center gap-1.5"
                                            >
                                                <FiX size={14} /> Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Cancellation Reason Banner (for cancelled orders) */}
                            {order.status === 'cancelled' && (
                                <div className="mx-5 mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3 flex items-start gap-3">
                                    <FiAlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                                    <div>
                                        <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1">Cancellation Reason</p>
                                        <p className="text-sm text-red-600 dark:text-red-300 font-medium">
                                            {order.cancellationReason || 'No reason provided'}
                                        </p>
                                        {order.cancelledAt && (
                                            <p className="text-[11px] text-red-400 dark:text-red-500 mt-1">
                                                Cancelled on {formatDate(order.cancelledAt)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <FiShoppingBag className="mx-auto text-4xl text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No orders found yet</p>
                    <button onClick={() => window.location.href = '/products'} className="mt-4 text-primary-600 font-bold hover:underline font-sm">Start Shopping</button>
                </div>
            )}
        </div>
    );

    const renderProfile = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiUser className="text-primary-600" /> Account Details
                </h2>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 text-primary-600 font-bold hover:bg-primary-50 px-4 py-2 rounded-lg transition-colors"
                    >
                        <FiEdit2 /> Edit Profile
                    </button>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">New Password (Optional)</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary-500 transition-colors"
                                placeholder="Leave blank to keep current"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-primary-500 transition-colors"
                                placeholder="Confirm new password"
                            />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-primary-600/30"
                        >
                            <FiSave /> Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="bg-gray-100 text-gray-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                            <FiX /> Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl border border-gray-100 dark:border-gray-600">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Full Name</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl border border-gray-100 dark:border-gray-600">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email Address</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{user?.email}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl border border-gray-100 dark:border-gray-600">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Account Role</p>
                            <p className="text-lg font-bold text-primary-600 uppercase tracking-wide">{user?.role}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl border border-gray-100 dark:border-gray-600">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Current Date</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                        </div>
                    </div>

                    <div className="mt-8 border-t border-gray-100 dark:border-gray-700 pt-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center text-xl">
                                🌟
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reward Points</h3>
                                <p className="text-sm text-gray-500">You have earned <span className="font-bold text-amber-600">{rewardPoints}</span> points!</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Available Coupons</h3>
                            {activeCoupons.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {activeCoupons.map((coupon) => (
                                        <div key={coupon._id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 border-dashed border-primary-200 dark:border-primary-800 flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-primary-600 mb-1">{coupon.code}</p>
                                                <p className="text-xs text-gray-500">{coupon.description}</p>
                                            </div>
                                            <button className="bg-primary-50 text-primary-600 px-3 py-1 rounded text-xs font-bold hover:bg-primary-100 transition-colors">
                                                USE CODE
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No valid coupons available right now.</p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    const renderSettings = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <FiSettings className="text-primary-600" /> User Settings
            </h2>

            <div className="space-y-4">
                <div
                    onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-md transition-shadow cursor-pointer select-none"
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${settings.notifications ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                            <FiMail />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">Email Notifications</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Receive order updates and offers</p>
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors ${settings.notifications ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.notifications ? 'left-7' : 'left-1'}`}></div>
                    </div>
                </div>

                <div
                    onClick={toggleTheme}
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-md transition-shadow cursor-pointer select-none"
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${darkMode ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
                            <FiInfo />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 dark:text-white">Dark Mode</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Switch to a darker theme</p>
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors ${darkMode ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${darkMode ? 'left-7' : 'left-1'}`}></div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
                <h3 className="text-red-600 font-bold mb-4">Danger Zone</h3>
                <button
                    onClick={handleDeleteAccount}
                    className="bg-red-50 text-red-600 px-6 py-2 rounded-lg font-bold hover:bg-red-100 transition-colors text-sm flex items-center gap-2"
                >
                    <FiTrash2 /> Delete My Account
                </button>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Cancel Reason Modal */}
            <CancelModal />
            <div className="flex items-center gap-4 mb-10">
                <div className="w-16 h-1 bg-primary-600 rounded-full"></div>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">MY ACCOUNT</h1>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Sidebar */}
                <div className="w-full lg:w-80 space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-xl mb-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 dark:bg-primary-900/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-500"></div>
                        <div className="relative z-10 text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-4xl font-black mx-auto mb-6 shadow-2xl ring-8 ring-primary-50 dark:ring-gray-700">
                                {user?.name.charAt(0).toUpperCase()}
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">{user?.name}</h3>
                            <p className="text-sm text-gray-400 font-medium mb-4">{user?.email}</p>
                            <div className="inline-block px-4 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                                {user?.role} Account
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-lg space-y-2">
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`flex items-center gap-4 w-full px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'orders' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                            <FiBox size={20} /> Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`flex items-center gap-4 w-full px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'profile' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                            <FiUser size={20} /> Profile Details
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex items-center gap-4 w-full px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === 'settings' ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                            <FiSettings size={20} /> Settings
                        </button>
                        <hr className="my-2 border-gray-50 dark:border-gray-700" />
                        <button onClick={logout} className="flex items-center gap-4 w-full px-6 py-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl font-bold transition-all">
                            <FiLogOut size={20} /> Logout
                        </button>
                    </div>

                    <div className="bg-primary-900 p-6 rounded-3xl text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-xs font-bold text-primary-300 uppercase tracking-widest mb-1">Today's Date</p>
                            <p className="text-lg font-black">{new Date().toLocaleDateString('en-IN', { weekday: 'long' })}</p>
                            <p className="text-sm text-primary-200">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                        <FiCalendar className="absolute -bottom-4 -right-4 text-white/10 text-8xl" />
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-2xl min-h-[600px] animate-in fade-in zoom-in-95 duration-500">
                    {activeTab === 'orders' && renderOrders()}
                    {activeTab === 'profile' && renderProfile()}
                    {activeTab === 'settings' && renderSettings()}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
