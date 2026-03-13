import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchOrderById } from '../services/api';
import {
    FiCreditCard, FiShield,
    FiChevronRight, FiLock, FiArrowLeft, FiEye, FiEyeOff
} from 'react-icons/fi';

const paymentMethods = [
    {
        id: 'credit',
        name: 'Credit Card',
        description: 'Visa, Mastercard, Rupay, Amex',
        icon: FiCreditCard,
        color: 'from-blue-500 to-cyan-600',
        lightBg: 'from-blue-50 to-cyan-50',
        border: 'border-blue-400',
        chipBg: 'bg-blue-100 text-blue-700',
        tags: ['Visa', 'MC', 'RuPay', 'Amex'],
        connectMsg: 'Connecting to card gateway...',
        needsForm: true,
    },
    {
        id: 'debit',
        name: 'Debit Card',
        description: 'All major bank debit cards accepted',
        icon: FiCreditCard,
        color: 'from-emerald-500 to-teal-600',
        lightBg: 'from-emerald-50 to-teal-50',
        border: 'border-emerald-400',
        chipBg: 'bg-emerald-100 text-emerald-700',
        tags: ['Visa', 'MC', 'RuPay', 'Maestro'],
        connectMsg: 'Connecting to card gateway...',
        needsForm: true,
    },
];

// Format card number with spaces: 1234 5678 9012 3456
const formatCardNumber = (value) => {
    const v = value.replace(/\D/g, '').slice(0, 16);
    const parts = [];
    for (let i = 0; i < v.length; i += 4) {
        parts.push(v.slice(i, i + 4));
    }
    return parts.join(' ');
};

// Format expiry: MM/YY
const formatExpiry = (value) => {
    const v = value.replace(/\D/g, '').slice(0, 4);
    if (v.length >= 3) return v.slice(0, 2) + '/' + v.slice(2);
    return v;
};

// Detect card brand
const getCardBrand = (number) => {
    const n = number.replace(/\s/g, '');
    if (/^4/.test(n)) return { name: 'Visa', color: 'text-blue-700 bg-blue-50' };
    if (/^5[1-5]/.test(n)) return { name: 'Mastercard', color: 'text-orange-700 bg-orange-50' };
    if (/^3[47]/.test(n)) return { name: 'Amex', color: 'text-indigo-700 bg-indigo-50' };
    if (/^6/.test(n)) return { name: 'RuPay', color: 'text-green-700 bg-green-50' };
    return null;
};

const PaymentGateway = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [selectedMethod, setSelectedMethod] = useState('');
    const [orderAmount, setOrderAmount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [redirecting, setRedirecting] = useState(false);
    const redirectTimerRef = useRef(null);

    // Card form state
    const [showCardForm, setShowCardForm] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [showCvv, setShowCvv] = useState(false);
    const [cardErrors, setCardErrors] = useState({});



    useEffect(() => {
        const loadOrder = async () => {
            try {
                const order = await fetchOrderById(orderId);
                setOrderAmount(order.totalPrice);
            } catch {
                setOrderAmount(null);
            } finally {
                setLoading(false);
            }
        };
        loadOrder();

        return () => {
            if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
        };
    }, [orderId]);

    // Handle method selection
    const handleSelectMethod = (methodId) => {
        if (redirecting) return;
        const method = paymentMethods.find(m => m.id === methodId);

        // Credit/Debit card → show card details form
        setSelectedMethod(methodId);
        setShowCardForm(true);
        setCardErrors({});
    };

    // Validate and submit card form
    const handleCardSubmit = (e) => {
        e.preventDefault();
        const errors = {};
        const rawNumber = cardNumber.replace(/\s/g, '');

        if (rawNumber.length < 13 || rawNumber.length > 16) errors.cardNumber = 'Enter a valid card number';
        if (!cardName.trim() || cardName.trim().length < 3) errors.cardName = 'Enter cardholder name';
        if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
            errors.cardExpiry = 'Enter valid expiry (MM/YY)';
        } else {
            const [mm, yy] = cardExpiry.split('/').map(Number);
            if (mm < 1 || mm > 12) errors.cardExpiry = 'Invalid month';
            const now = new Date();
            const expDate = new Date(2000 + yy, mm);
            if (expDate < now) errors.cardExpiry = 'Card has expired';
        }
        if (!/^\d{3,4}$/.test(cardCvv)) errors.cardCvv = 'Enter valid CVV';

        setCardErrors(errors);
        if (Object.keys(errors).length > 0) return;

        // Form valid → redirect to processing
        const method = paymentMethods.find(m => m.id === selectedMethod);
        setRedirecting(true);
        redirectTimerRef.current = setTimeout(() => {
            navigate(`/payment/processing/${orderId}`, {
                replace: true,
                state: {
                    methodId: method.id,
                    methodName: method.name,
                    methodColor: method.color,
                    methodConnectMsg: method.connectMsg,
                }
            });
        }, 1500);
    };

    // Validate and submit UPI form
    const handleUpiSubmit = (e) => {
        e.preventDefault();
        // Validate UPI ID format: must contain @
        if (!upiId.trim() || !upiId.includes('@') || upiId.trim().length < 5) {
            setUpiError('Enter a valid UPI ID (e.g. name@upi, name@axl)');
            return;
        }
        setUpiError('');

        // Form valid → redirect to processing
        const method = paymentMethods.find(m => m.id === selectedMethod);
        setRedirecting(true);
        redirectTimerRef.current = setTimeout(() => {
            navigate(`/payment/processing/${orderId}`, {
                replace: true,
                state: {
                    methodId: method.id,
                    methodName: method.name,
                    methodColor: method.color,
                    methodConnectMsg: method.connectMsg,
                }
            });
        }, 1500);
    };

    // Go back from card form to method selection
    const handleBackToMethods = () => {
        setShowCardForm(false);
        setSelectedMethod('');
        setCardNumber('');
        setCardName('');
        setCardExpiry('');
        setCardCvv('');
        setCardErrors({});
    };

    const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);
    const cardBrand = getCardBrand(cardNumber);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium">Loading payment details...</p>
                </div>
            </div>
        );
    }

    // --- Redirecting overlay: shows after UPI/NetBanking click OR after card form submit ---
    if (redirecting && selectedMethodData) {
        const Icon = selectedMethodData.icon;
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="relative mx-auto mb-8 w-28 h-28">
                        <div className="absolute inset-0 rounded-full bg-primary-500/15 animate-ping" style={{ animationDuration: '1.5s' }} />
                        <div className="absolute inset-3 rounded-full bg-primary-500/10 animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.4s' }} />
                        <div className={`relative w-28 h-28 rounded-full bg-gradient-to-br ${selectedMethodData.color} flex items-center justify-center shadow-2xl`}>
                            <Icon className="text-white animate-pulse" size={44} />
                        </div>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
                        {selectedMethodData.connectMsg}
                    </h2>
                    <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
                        Securely initiating {selectedMethodData.name} payment for{' '}
                        <span className="font-bold text-gray-800">₹{orderAmount ? orderAmount.toLocaleString('en-IN') : '—'}</span>
                    </p>
                    <div className="w-64 md:w-80 h-1.5 bg-gray-200 rounded-full overflow-hidden mx-auto mb-6">
                        <div
                            className={`h-full bg-gradient-to-r ${selectedMethodData.color} rounded-full`}
                            style={{ animation: 'gatewayProgress 1.5s ease-in-out forwards' }}
                        />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                        <FiShield className="text-green-400" />
                        <span>256-bit SSL Encrypted • Secure Transaction</span>
                    </div>
                </div>
                <style>{`
                    @keyframes gatewayProgress {
                        0% { width: 0%; }
                        40% { width: 50%; }
                        70% { width: 80%; }
                        100% { width: 100%; }
                    }
                `}</style>
            </div>
        );
    }


    // --- Card Details Form (Credit / Debit) ---
    if (showCardForm && selectedMethodData) {
        const Icon = selectedMethodData.icon;
        const isFormValid = cardNumber.replace(/\s/g, '').length >= 13 && cardName.trim().length >= 3 && /^\d{2}\/\d{2}$/.test(cardExpiry) && /^\d{3,4}$/.test(cardCvv);

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-8 px-4">
                <div className="max-w-xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={handleBackToMethods}
                        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium mb-6 transition-colors"
                    >
                        <FiArrowLeft size={16} /> Change Payment Method
                    </button>

                    {/* Card Header */}
                    <div className="text-center mb-8">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${selectedMethodData.color} flex items-center justify-center mx-auto mb-4 shadow-xl`}>
                            <Icon className="text-white" size={28} />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-1">
                            Enter {selectedMethodData.name} Details
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Amount: <span className="font-bold text-gray-800">₹{orderAmount ? orderAmount.toLocaleString('en-IN') : '—'}</span>
                        </p>
                    </div>

                    {/* Visual Card Preview */}
                    <div className={`relative w-full max-w-md mx-auto h-52 rounded-2xl bg-gradient-to-br ${selectedMethodData.color} p-6 mb-8 shadow-2xl overflow-hidden`}>
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-2 border-white" />
                            <div className="absolute top-8 right-8 w-24 h-24 rounded-full border-2 border-white" />
                            <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full border-2 border-white" />
                        </div>

                        {/* Chip */}
                        <div className="relative">
                            <div className="w-12 h-9 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-lg mb-6 flex items-center justify-center">
                                <div className="w-8 h-5 border border-yellow-600/30 rounded-sm" />
                            </div>

                            {/* Card number */}
                            <p className="text-white text-xl font-mono tracking-[0.2em] mb-4">
                                {cardNumber || '•••• •••• •••• ••••'}
                            </p>

                            {/* Bottom row */}
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-white/50 text-[10px] uppercase tracking-wider mb-0.5">Card Holder</p>
                                    <p className="text-white font-bold text-sm uppercase tracking-wide">
                                        {cardName || 'YOUR NAME'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/50 text-[10px] uppercase tracking-wider mb-0.5">Expires</p>
                                    <p className="text-white font-bold text-sm font-mono">
                                        {cardExpiry || 'MM/YY'}
                                    </p>
                                </div>
                                {cardBrand && (
                                    <div className="ml-3">
                                        <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${cardBrand.color}`}>
                                            {cardBrand.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Card Form */}
                    <form onSubmit={handleCardSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 md:p-8 space-y-5">

                        {/* Card Number */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Card Number</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="1234 5678 9012 3456"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                    maxLength={19}
                                    className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl text-sm font-mono tracking-wider focus:outline-none transition-all ${cardErrors.cardNumber ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'}`}
                                />
                                <FiCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                {cardBrand && (
                                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black px-2 py-0.5 rounded-md ${cardBrand.color}`}>
                                        {cardBrand.name}
                                    </span>
                                )}
                            </div>
                            {cardErrors.cardNumber && <p className="text-xs text-red-500 mt-1 font-medium">{cardErrors.cardNumber}</p>}
                        </div>

                        {/* Cardholder Name */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Cardholder Name</label>
                            <input
                                type="text"
                                placeholder="JOHN DOE"
                                value={cardName}
                                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                maxLength={50}
                                className={`w-full px-4 py-3.5 border-2 rounded-xl text-sm uppercase tracking-wide focus:outline-none transition-all ${cardErrors.cardName ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'}`}
                            />
                            {cardErrors.cardName && <p className="text-xs text-red-500 mt-1 font-medium">{cardErrors.cardName}</p>}
                        </div>

                        {/* Expiry + CVV row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">Expiry Date</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="MM/YY"
                                    value={cardExpiry}
                                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                    maxLength={5}
                                    className={`w-full px-4 py-3.5 border-2 rounded-xl text-sm font-mono text-center tracking-widest focus:outline-none transition-all ${cardErrors.cardExpiry ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'}`}
                                />
                                {cardErrors.cardExpiry && <p className="text-xs text-red-500 mt-1 font-medium">{cardErrors.cardExpiry}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1.5">CVV</label>
                                <div className="relative">
                                    <input
                                        type={showCvv ? 'text' : 'password'}
                                        inputMode="numeric"
                                        placeholder="•••"
                                        value={cardCvv}
                                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        maxLength={4}
                                        className={`w-full px-4 py-3.5 border-2 rounded-xl text-sm font-mono text-center tracking-[0.3em] focus:outline-none transition-all ${cardErrors.cardCvv ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCvv(!showCvv)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showCvv ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                    </button>
                                </div>
                                {cardErrors.cardCvv && <p className="text-xs text-red-500 mt-1 font-medium">{cardErrors.cardCvv}</p>}
                            </div>
                        </div>

                        {/* Security note */}
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                            <FiShield className="text-green-500 flex-shrink-0" size={16} />
                            <p className="text-xs text-green-700 font-medium">
                                Your card details are encrypted and secure. This is a demo — no real charges.
                            </p>
                        </div>

                        {/* Pay Button */}
                        <button
                            type="submit"
                            disabled={!isFormValid}
                            className={`w-full py-4 rounded-xl font-black text-white text-lg transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] ${
                                isFormValid
                                    ? `bg-gradient-to-r ${selectedMethodData.color} hover:shadow-xl`
                                    : 'bg-gray-300 cursor-not-allowed shadow-none'
                            }`}
                        >
                            <FiLock size={18} />
                            Pay ₹{orderAmount ? orderAmount.toLocaleString('en-IN') : '—'}
                        </button>
                    </form>

                    {/* Security Footer */}
                    <div className="mt-6 flex items-center justify-center gap-6">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <FiShield className="text-green-400" size={14}/>
                            <span>256-bit SSL</span>
                        </div>
                        <div className="w-px h-4 bg-gray-200" />
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <FiLock className="text-green-400" size={14}/>
                            <span>PCI DSS Compliant</span>
                        </div>
                        <div className="w-px h-4 bg-gray-200" />
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <FiShield className="text-green-400" size={14}/>
                            <span>100% Secure</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Default: Payment Method Selection ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="text-center mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium mb-6 transition-colors"
                    >
                        <FiArrowLeft size={16} /> Back
                    </button>
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-primary-200/60">
                        <FiLock className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                        Secure Payment
                    </h1>
                    <p className="text-gray-500 text-base">
                        Select a payment method to proceed
                    </p>
                </div>

                {/* Amount Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Amount to Pay</p>
                            <p className="text-3xl font-black text-gray-900">
                                ₹{orderAmount ? orderAmount.toLocaleString('en-IN') : '—'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                Order #{orderId?.slice(-8).toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="mb-6">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-1">
                        Choose Payment Method
                    </h2>
                    <div className="space-y-3">
                        {paymentMethods.map((method) => {
                            const Icon = method.icon;
                            return (
                                <button
                                    key={method.id}
                                    type="button"
                                    onClick={() => handleSelectMethod(method.id)}
                                    className={`w-full relative rounded-2xl border-2 p-5 transition-all duration-300 text-left group border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]`}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Icon */}
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all bg-gray-100 text-gray-500 group-hover:bg-gradient-to-br group-hover:${method.color} group-hover:text-white group-hover:shadow-lg`}>
                                            <Icon size={22} />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-black text-base mb-0.5 text-gray-800">
                                                {method.name}
                                            </h3>
                                            <p className="text-xs text-gray-500">{method.description}</p>
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {method.tags.map(tag => (
                                                    <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500">{tag}</span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Right side info */}
                                        <div className="flex-shrink-0 flex items-center gap-2">
                                            {method.needsForm ? (
                                                <span className="hidden sm:block text-xs font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {method.needsForm === 'upi' ? 'Enter UPI ID' : 'Enter Details'}
                                                </span>
                                            ) : (
                                                <span className="hidden sm:block text-xs font-bold text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Tap to Pay
                                                </span>
                                            )}
                                            <FiChevronRight className="text-gray-300 group-hover:text-primary-500 transition-colors" size={20} />
                                        </div>
                                    </div>

                                    {/* Method type badge */}
                                    {method.needsForm && (
                                        <div className="absolute top-3 right-3">
                                            <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                {method.needsForm === 'upi' ? 'UPI ID Required' : 'Card Details Required'}
                                            </span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Security Badges */}
                <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-center gap-6">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <FiShield className="text-green-400" size={14}/>
                            <span>256-bit SSL</span>
                        </div>
                        <div className="w-px h-4 bg-gray-200" />
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <FiLock className="text-green-400" size={14}/>
                            <span>PCI DSS Compliant</span>
                        </div>
                        <div className="w-px h-4 bg-gray-200" />
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                            <FiShield className="text-green-400" size={14}/>
                            <span>100% Secure</span>
                        </div>
                    </div>
                    <p className="text-center text-[11px] text-gray-400">
                        This is a simulated payment gateway for demo purposes. No real transaction will be processed.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentGateway;
