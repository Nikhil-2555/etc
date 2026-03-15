import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import {
    FiArrowRight, FiTag, FiCreditCard, FiPackage,
    FiShield, FiCheckCircle, FiTruck
} from 'react-icons/fi';
import { createOrder, applyCoupon } from '../services/api';
import { useState } from 'react';

const Checkout = () => {
    const { cart, totalPrice, clearCart } = useCart();
    const navigate = useNavigate();
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [isApplying, setIsApplying] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState('');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [shippingComplete, setShippingComplete] = useState(false);

    const finalAmount = Math.max(0, totalPrice - discountAmount) + 100;

    const formik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            email: '',
            address: '',
            city: '',
            postalCode: '',
        },
        onSubmit: () => {
            setShippingComplete(true);
            toast.success('Shipping details saved!');
        }
    });

    const handlePlaceOrder = async () => {
        if (!selectedPayment) {
            toast.error('Please select a payment method');
            return;
        }

        setIsPlacingOrder(true);
        try {
            const orderData = {
                orderItems: cart,
                shippingAddress: {
                    address: formik.values.address,
                    city: formik.values.city,
                    postalCode: formik.values.postalCode,
                    country: 'India'
                },
                paymentMethod: selectedPayment === 'online' ? 'Online' : 'COD',
                paymentStatus: selectedPayment === 'cod' ? 'Pending' : 'Pending',
                orderStatus: 'Placed',
                totalPrice: finalAmount,
                couponCode: appliedCoupon ? appliedCoupon.code : null,
                discountAmount: discountAmount
            };

            const createdOrder = await createOrder(orderData);
            clearCart();

            if (selectedPayment === 'cod') {
                toast.success('Order placed successfully! 🎉');
                navigate(`/order-confirmation/${createdOrder._id}`);
            } else {
                navigate(`/payment/${createdOrder._id}`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCodeInput.trim()) return;
        setIsApplying(true);
        try {
            const data = await applyCoupon(couponCodeInput.toUpperCase(), totalPrice, cart);
            setAppliedCoupon(data.coupon);
            setDiscountAmount(data.discountAmount || 0);
            toast.success(`Coupon applied! You save ₹${data.discountAmount}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid or expired coupon');
            setAppliedCoupon(null);
            setDiscountAmount(0);
        } finally {
            setIsApplying(false);
        }
    };

    const removeCoupon = () => {
        setCouponCodeInput('');
        setAppliedCoupon(null);
        setDiscountAmount(0);
        toast.success("Coupon removed");
    };

    if (cart.length === 0) {
        return <div className="text-center py-20 font-bold text-gray-500 dark:text-gray-400 dark:text-gray-500">Your cart is empty. Please add items to checkout.</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-0 mb-12">
                    {[
                        { num: 1, label: 'Shipping', done: shippingComplete },
                        { num: 2, label: 'Payment', done: false },
                        { num: 3, label: 'Confirmation', done: false },
                    ].map((step, i) => (
                        <div key={step.num} className="flex items-center">
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-500 ${step.done
                                        ? 'bg-green-50 dark:bg-green-900/300 text-white shadow-lg shadow-green-200'
                                        : (step.num === 1 && !shippingComplete) || (step.num === 2 && shippingComplete)
                                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                                            : 'bg-gray-200 text-gray-500 dark:text-gray-400 dark:text-gray-500'
                                    }`}>
                                    {step.done ? <FiCheckCircle size={18} /> : step.num}
                                </div>
                                <span className={`text-xs mt-2 font-bold ${step.done ? 'text-green-600 dark:text-green-400' : (step.num === 1 && !shippingComplete) || (step.num === 2 && shippingComplete) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'
                                    }`}>{step.label}</span>
                            </div>
                            {i < 2 && (
                                <div className={`w-20 md:w-32 h-0.5 mx-2 mb-5 transition-all duration-500 ${step.done ? 'bg-green-400' : 'bg-gray-200'}`} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column: Shipping + Payment */}
                    <div className="flex-1 space-y-6">
                        {/* Step 1: Shipping Information */}
                        <div className={`bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-300 ${shippingComplete ? 'border-green-200 shadow-sm' : 'border-gray-100 dark:border-gray-700 shadow-lg'}`}>
                            <div className="p-6 md:p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${shippingComplete ? 'bg-green-50 dark:bg-green-900/300 text-white' : 'bg-primary-100 text-primary-600 dark:text-primary-400'}`}>
                                            {shippingComplete ? <FiCheckCircle /> : '1'}
                                        </span>
                                        Shipping Information
                                    </h2>
                                    {shippingComplete && (
                                        <button
                                            onClick={() => setShippingComplete(false)}
                                            className="text-sm text-primary-600 dark:text-primary-400 font-bold hover:underline"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>

                                {shippingComplete ? (
                                    <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-4 border border-green-100 dark:border-green-800">
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            <strong>{formik.values.firstName} {formik.values.lastName}</strong><br />
                                            {formik.values.address}, {formik.values.city} - {formik.values.postalCode}<br />
                                            <span className="text-gray-500 dark:text-gray-400 dark:text-gray-500">{formik.values.email}</span>
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={formik.handleSubmit} className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-1.5">First Name</label>
                                                <input
                                                    type="text" name="firstName"
                                                    onChange={formik.handleChange} value={formik.values.firstName}
                                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    placeholder="John" required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-1.5">Last Name</label>
                                                <input
                                                    type="text" name="lastName"
                                                    onChange={formik.handleChange} value={formik.values.lastName}
                                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    placeholder="Doe" required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-1.5">Email Address</label>
                                            <input
                                                type="email" name="email"
                                                onChange={formik.handleChange} value={formik.values.email}
                                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                placeholder="john@example.com" required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-1.5">Street Address</label>
                                            <input
                                                type="text" name="address"
                                                onChange={formik.handleChange} value={formik.values.address}
                                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                placeholder="123 Main Street" required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-1.5">City</label>
                                                <input
                                                    type="text" name="city"
                                                    onChange={formik.handleChange} value={formik.values.city}
                                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    placeholder="Mumbai" required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-1.5">Postal Code</label>
                                                <input
                                                    type="text" name="postalCode"
                                                    onChange={formik.handleChange} value={formik.values.postalCode}
                                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    placeholder="400001" required
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full bg-gray-900 text-white rounded-xl py-4 font-bold text-base hover:bg-primary-600 transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] mt-2"
                                        >
                                            Save & Continue <FiArrowRight />
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Step 2: Payment Method */}
                        <div className={`bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-500 ${shippingComplete ? 'border-gray-100 dark:border-gray-700 shadow-lg opacity-100 translate-y-0' : 'border-gray-100 dark:border-gray-700 shadow-sm opacity-50 pointer-events-none translate-y-2'
                            }`}>
                            <div className="p-6 md:p-8">
                                <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3 mb-6">
                                    <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 dark:text-primary-400 flex items-center justify-center text-sm font-bold">2</span>
                                    Select Payment Method
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {/* Online Payment Card */}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedPayment('online')}
                                        className={`relative rounded-2xl border-2 p-6 transition-all duration-300 text-left group hover:shadow-lg ${selectedPayment === 'online'
                                                ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-indigo-50 shadow-lg shadow-primary-100'
                                                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-primary-300'
                                            }`}
                                    >
                                        {selectedPayment === 'online' && (
                                            <div className="absolute top-3 right-3">
                                                <FiCheckCircle className="text-primary-600 dark:text-primary-400" size={20} />
                                            </div>
                                        )}
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all ${selectedPayment === 'online'
                                                ? 'bg-gradient-to-br from-primary-500 to-indigo-600 text-white shadow-lg shadow-primary-200'
                                                : 'bg-primary-100 text-primary-600 dark:text-primary-400'
                                            }`}>
                                            <FiCreditCard size={24} />
                                        </div>
                                        <h3 className={`font-black text-base mb-1 ${selectedPayment === 'online' ? 'text-primary-700 dark:text-primary-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                            Online Payment
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Credit Card, Debit Card</p>
                                        <div className="flex gap-1.5 mt-3">
                                            {['Visa', 'MasterCard', 'RuPay'].map(tag => (
                                                <span key={tag} className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${selectedPayment === 'online'
                                                        ? 'bg-primary-100 text-primary-700 dark:text-primary-400'
                                                        : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 dark:text-gray-500'
                                                    }`}>{tag}</span>
                                            ))}
                                        </div>
                                    </button>

                                    {/* COD Card */}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedPayment('cod')}
                                        className={`relative rounded-2xl border-2 p-6 transition-all duration-300 text-left group hover:shadow-lg ${selectedPayment === 'cod'
                                                ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg shadow-amber-100'
                                                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-amber-300'
                                            }`}
                                    >
                                        {selectedPayment === 'cod' && (
                                            <div className="absolute top-3 right-3">
                                                <FiCheckCircle className="text-amber-600 dark:text-amber-400" size={20} />
                                            </div>
                                        )}
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all ${selectedPayment === 'cod'
                                                ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-200'
                                                : 'bg-amber-100 text-amber-600 dark:text-amber-400'
                                            }`}>
                                            <FiTruck size={24} />
                                        </div>
                                        <h3 className={`font-black text-base mb-1 ${selectedPayment === 'cod' ? 'text-amber-700 dark:text-amber-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                            Cash on Delivery
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Pay when your order arrives at your doorstep</p>
                                        <div className="flex gap-1.5 mt-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${selectedPayment === 'cod'
                                                    ? 'bg-amber-100 text-amber-700 dark:text-amber-400'
                                                    : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 dark:text-gray-500'
                                                }`}>No extra charges</span>
                                        </div>
                                    </button>
                                </div>

                                {/* COD Info */}
                                {selectedPayment === 'cod' && (
                                    <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-4 border border-amber-200 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                                            <FiPackage className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                            You will pay <strong>₹{finalAmount.toLocaleString('en-IN')}</strong> in cash when the order is delivered.
                                        </p>
                                    </div>
                                )}

                                {/* Online Info */}
                                {selectedPayment === 'online' && (
                                    <div className="bg-primary-50 dark:bg-primary-900/30 rounded-xl p-4 border border-primary-200 dark:border-primary-800 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <p className="text-sm text-primary-800 font-medium flex items-center gap-2">
                                            <FiShield className="text-green-500 flex-shrink-0" />
                                            You will be redirected to a secure payment page to complete the transaction.
                                        </p>
                                    </div>
                                )}

                                {/* Place Order Button */}
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={!selectedPayment || isPlacingOrder}
                                    id="place-order-btn"
                                    className={`w-full py-4 rounded-xl font-black text-white text-lg transition-all flex items-center justify-center gap-2 shadow-lg mt-2 ${!selectedPayment || isPlacingOrder
                                            ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                            : selectedPayment === 'cod'
                                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 hover:shadow-amber-500/30 active:scale-[0.98]'
                                                : 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 hover:shadow-primary-600/30 active:scale-[0.98]'
                                        }`}
                                >
                                    {isPlacingOrder ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Placing Order…
                                        </>
                                    ) : selectedPayment === 'cod' ? (
                                        <>
                                            <FiPackage size={18} /> Place Order (COD)
                                        </>
                                    ) : selectedPayment === 'online' ? (
                                        <>
                                            <FiCreditCard size={18} /> Pay ₹{finalAmount.toLocaleString('en-IN')} Now
                                        </>
                                    ) : (
                                        'Select a Payment Method'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="w-full lg:w-96">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg p-6 sticky top-24">
                            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">Order Summary</h3>
                            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-1">
                                {cart.map(item => (
                                    <div key={`${item.id || item._id}-${item.size}`} className="flex gap-3">
                                        <div className="w-14 h-14 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-700 p-1 flex-shrink-0">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{item.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500">Qty: {item.quantity}</p>
                                                {item.size && (
                                                    <>
                                                        <span className="text-gray-300 text-[10px]">•</span>
                                                        <p className="text-xs font-bold text-primary-600 dark:text-primary-400">Size: {item.size}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white flex-shrink-0">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
                                {/* Coupon Section */}
                                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                        <FiTag className="text-primary-600 dark:text-primary-400" /> Apply Coupon
                                    </h4>
                                    {!appliedCoupon ? (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Enter code"
                                                className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-primary-500 uppercase bg-white dark:bg-gray-800"
                                                value={couponCodeInput}
                                                onChange={(e) => setCouponCodeInput(e.target.value)}
                                                disabled={isApplying}
                                            />
                                            <button
                                                onClick={handleApplyCoupon}
                                                disabled={isApplying || !couponCodeInput}
                                                className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
                                            >
                                                {isApplying ? '...' : 'Apply'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/30 px-3 py-2 rounded-lg border border-green-200">
                                            <div className="flex items-center gap-2">
                                                <span className="text-green-700 dark:text-green-400 font-bold text-sm tracking-wide">{appliedCoupon.code}</span>
                                                <span className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">APPLIED</span>
                                            </div>
                                            <button onClick={removeCoupon} className="text-gray-500 dark:text-gray-400 dark:text-gray-500 hover:text-red-500 text-xs font-bold transition-colors">
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                                    <span>Subtotal</span>
                                    <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400 font-medium">
                                        <span>Discount ({appliedCoupon?.code})</span>
                                        <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                                    <span>Shipping</span>
                                    <span>₹100</span>
                                </div>
                                <div className="flex justify-between font-black text-lg text-gray-900 dark:text-white mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                    <span>Total</span>
                                    <span className="text-primary-600 dark:text-primary-400">₹{finalAmount.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <div className="mt-5 text-center">
                                <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1">
                                    <FiShield className="text-green-400" /> Secure & Encrypted Checkout
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
