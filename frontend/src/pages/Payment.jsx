import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    FiCreditCard, FiSmartphone, FiGlobe, FiPackage,
    FiLock, FiCheckCircle, FiArrowLeft, FiShield
} from 'react-icons/fi';
import { payOrder } from '../services/api';

const PAYMENT_METHODS = [
    {
        id: 'upi',
        label: 'UPI Payment',
        icon: FiSmartphone,
        description: 'Pay using Google Pay, PhonePe, Paytm, BHIM',
        color: 'from-violet-500 to-purple-600',
        iconBg: 'bg-violet-100 text-violet-600',
        providers: ['GPay', 'PhonePe', 'Paytm', 'BHIM'],
    },
    {
        id: 'card',
        label: 'Credit / Debit Card',
        icon: FiCreditCard,
        description: 'Visa, Mastercard, RuPay accepted',
        color: 'from-blue-500 to-indigo-600',
        iconBg: 'bg-blue-100 text-blue-600',
    },
    {
        id: 'netbanking',
        label: 'Net Banking',
        icon: FiGlobe,
        description: 'Pay directly from your bank account',
        color: 'from-emerald-500 to-teal-600',
        iconBg: 'bg-emerald-100 text-emerald-600',
        banks: ['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak'],
    },
    {
        id: 'cod',
        label: 'Cash on Delivery',
        icon: FiPackage,
        description: 'Pay when your order arrives',
        color: 'from-amber-500 to-orange-500',
        iconBg: 'bg-amber-100 text-amber-600',
    },
];

const Payment = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const amount = parseFloat(searchParams.get('amount') || '0');

    const [selectedMethod, setSelectedMethod] = useState('upi');
    const [upiId, setUpiId] = useState('');
    const [selectedBank, setSelectedBank] = useState('SBI');
    const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '', name: '' });
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!orderId) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
                <FiPackage className="text-6xl text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-700 mb-2">No Order Found</h2>
                <p className="text-gray-500 mb-6">Please go through checkout first.</p>
                <button
                    onClick={() => navigate('/cart')}
                    className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors"
                >
                    Back to Cart
                </button>
            </div>
        );
    }

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    const handlePay = async () => {
        // Basic validation
        if (selectedMethod === 'upi' && !upiId.trim()) {
            toast.error('Please enter your UPI ID');
            return;
        }
        if (selectedMethod === 'card') {
            if (!cardData.number || !cardData.expiry || !cardData.cvv || !cardData.name) {
                toast.error('Please fill all card details');
                return;
            }
        }

        setProcessing(true);
        try {
            // Simulate payment processing delay
            await new Promise(r => setTimeout(r, 1800));

            const paymentResult = {
                id: `PAY_${Date.now()}`,
                status: 'COMPLETED',
                update_time: new Date().toISOString(),
                paymentMethod: selectedMethod,
            };

            await payOrder(orderId, paymentResult);
            setSuccess(true);
            toast.success('Payment successful! 🎉');

            setTimeout(() => navigate('/dashboard'), 2200);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-5xl mb-6 animate-bounce">
                    <FiCheckCircle />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-500 mb-2">Your order has been confirmed.</p>
                <p className="text-primary-600 font-bold text-xl">{formatCurrency(amount)}</p>
                <p className="text-sm text-gray-400 mt-4">Redirecting to your dashboard…</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30 py-12 px-4">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
                    >
                        <FiArrowLeft size={22} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Secure Payment</h1>
                        <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
                            <FiShield className="text-green-500" /> 256-bit SSL encrypted payment
                        </p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left: Payment Method Selection */}
                    <div className="flex-1 space-y-4">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                            Choose Payment Method
                        </h2>

                        {PAYMENT_METHODS.map((method) => {
                            const Icon = method.icon;
                            const isSelected = selectedMethod === method.id;
                            return (
                                <div
                                    key={method.id}
                                    onClick={() => setSelectedMethod(method.id)}
                                    className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all duration-200 group
                                        ${isSelected
                                            ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-100'
                                            : 'border-gray-100 bg-white hover:border-primary-200 hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-all ${isSelected ? `bg-gradient-to-br ${method.color} text-white shadow-lg` : method.iconBg}`}>
                                            <Icon size={22} />
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-bold text-base ${isSelected ? 'text-primary-700' : 'text-gray-800'}`}>
                                                {method.label}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">{method.description}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300'}`}>
                                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                    </div>

                                    {/* Expanded input areas */}
                                    {isSelected && (
                                        <div className="mt-5 pt-5 border-t border-primary-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                            {method.id === 'upi' && (
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">UPI ID</label>
                                                    <input
                                                        type="text"
                                                        placeholder="yourname@upi"
                                                        value={upiId}
                                                        onChange={e => setUpiId(e.target.value)}
                                                        className="w-full px-4 py-3 rounded-xl border border-primary-200 bg-white focus:outline-none focus:border-primary-500 text-sm font-medium transition-colors"
                                                    />
                                                    <div className="flex gap-2 mt-3 flex-wrap">
                                                        {method.providers.map(p => (
                                                            <span key={p} className="px-3 py-1 bg-white rounded-full text-xs font-bold text-primary-600 border border-primary-200">
                                                                {p}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {method.id === 'card' && (
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Card Number</label>
                                                        <input
                                                            type="text"
                                                            placeholder="0000 0000 0000 0000"
                                                            value={cardData.number}
                                                            onChange={e => setCardData({ ...cardData, number: e.target.value })}
                                                            className="w-full px-4 py-3 rounded-xl border border-primary-200 bg-white focus:outline-none focus:border-primary-500 text-sm font-medium"
                                                            maxLength={19}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Cardholder Name</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Name on card"
                                                            value={cardData.name}
                                                            onChange={e => setCardData({ ...cardData, name: e.target.value })}
                                                            className="w-full px-4 py-3 rounded-xl border border-primary-200 bg-white focus:outline-none focus:border-primary-500 text-sm font-medium"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">Expiry</label>
                                                            <input
                                                                type="text"
                                                                placeholder="MM/YY"
                                                                value={cardData.expiry}
                                                                onChange={e => setCardData({ ...cardData, expiry: e.target.value })}
                                                                className="w-full px-4 py-3 rounded-xl border border-primary-200 bg-white focus:outline-none focus:border-primary-500 text-sm font-medium"
                                                                maxLength={5}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">CVV</label>
                                                            <input
                                                                type="password"
                                                                placeholder="•••"
                                                                value={cardData.cvv}
                                                                onChange={e => setCardData({ ...cardData, cvv: e.target.value })}
                                                                className="w-full px-4 py-3 rounded-xl border border-primary-200 bg-white focus:outline-none focus:border-primary-500 text-sm font-medium"
                                                                maxLength={4}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {method.id === 'netbanking' && (
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Select Bank</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {method.banks.map(bank => (
                                                            <button
                                                                key={bank}
                                                                type="button"
                                                                onClick={() => setSelectedBank(bank)}
                                                                className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${selectedBank === bank
                                                                    ? 'border-primary-500 bg-primary-500 text-white'
                                                                    : 'border-gray-200 bg-white text-gray-700 hover:border-primary-300'}`}
                                                            >
                                                                {bank}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {method.id === 'cod' && (
                                                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                                    <p className="text-sm text-amber-800 font-medium">
                                                        💡 You will pay <strong>{formatCurrency(amount)}</strong> in cash when the order is delivered to your doorstep.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Right: Order Summary + Pay Button */}
                    <div className="w-full lg:w-80">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 sticky top-24">
                            <h3 className="text-base font-bold text-gray-900 mb-4">Order Summary</h3>

                            <div className="space-y-3 pb-4 border-b border-gray-100">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Order ID</span>
                                    <span className="font-mono text-xs text-gray-700">#{orderId.slice(-8).toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(amount - 100)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Shipping</span>
                                    <span>₹100</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-4 mb-6">
                                <span className="font-black text-gray-900">Total</span>
                                <span className="text-2xl font-black text-primary-600">{formatCurrency(amount)}</span>
                            </div>

                            <button
                                onClick={handlePay}
                                disabled={processing}
                                id="pay-now-btn"
                                className={`w-full py-4 rounded-xl font-black text-white text-lg transition-all flex items-center justify-center gap-2 shadow-lg
                                    ${processing
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 hover:shadow-primary-600/40 active:scale-95'
                                    }`}
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Processing…
                                    </>
                                ) : (
                                    <>
                                        <FiLock size={18} />
                                        Pay {formatCurrency(amount)}
                                    </>
                                )}
                            </button>

                            <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                                <FiShield className="text-green-400" /> Secured by 256-bit SSL
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
