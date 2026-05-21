import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchOrderById, createPaymentIntent, confirmStripePayment } from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import {
    FiCreditCard, FiShield,
    FiChevronRight, FiLock, FiArrowLeft
} from 'react-icons/fi';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const paymentMethods = [
    {
        id: 'credit',
        name: 'Credit Card',
        description: 'Visa, Mastercard, Rupay, Amex — Powered by Stripe',
        icon: FiCreditCard,
        color: 'from-blue-500 to-cyan-600',
        lightBg: 'from-blue-50 to-cyan-50',
        border: 'border-blue-400',
        chipBg: 'bg-blue-100 text-blue-700',
        tags: ['Visa', 'MC', 'RuPay', 'Amex'],
        connectMsg: 'Connecting to Stripe...',
        needsForm: 'stripe',
    },
    {
        id: 'debit',
        name: 'Debit Card',
        description: 'All major bank debit cards — Powered by Stripe',
        icon: FiCreditCard,
        color: 'from-emerald-500 to-teal-600',
        lightBg: 'from-emerald-50 to-teal-50',
        border: 'border-emerald-400',
        chipBg: 'bg-emerald-100 text-emerald-700',
        tags: ['Visa', 'MC', 'RuPay', 'Maestro'],
        connectMsg: 'Connecting to Stripe...',
        needsForm: 'stripe',
    }
];

// ------------- Stripe Card Form Component -------------
const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            fontSize: '16px',
            fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
            color: '#1f2937',
            letterSpacing: '0.025em',
            '::placeholder': {
                color: '#9ca3af',
            },
        },
        invalid: {
            color: '#ef4444',
            iconColor: '#ef4444',
        },
    },
    hidePostalCode: true,
};

const StripeCardForm = ({ orderAmount, orderId, orderData, methodData, onBack }) => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [cardError, setCardError] = useState('');
    
    // Split Stripe elements completion states
    const [numComplete, setNumComplete] = useState(false);
    const [expComplete, setExpComplete] = useState(false);
    const [cvcComplete, setCvcComplete] = useState(false);
    const isSplitComplete = numComplete && expComplete && cvcComplete;

    // Mockup states for 3D Card
    const [cardholderName, setCardholderName] = useState('');
    const [cardBrand, setCardBrand] = useState('unknown');
    const [isFlipped, setIsFlipped] = useState(false);
    const [cardNumberText, setCardNumberText] = useState('');
    const [cardExpiryText, setCardExpiryText] = useState('');
    const [cardCvcText, setCardCvcText] = useState('');
    const [focusedField, setFocusedField] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setProcessing(true);
        setCardError('');

        try {
            // Step 1: Create PaymentIntent on the backend
            const { clientSecret } = await createPaymentIntent(orderId);

            // Step 2: Confirm the card payment using Stripe.js
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardNumberElement),
                    billing_details: {
                        name: cardholderName || 'Stripe Customer',
                    }
                },
            });

            if (result.error) {
                setCardError(result.error.message);
                setProcessing(false);
                return;
            }

            if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
                // Step 3: Confirm on backend & update order
                const confirmResult = await confirmStripePayment(result.paymentIntent.id, orderId);

                if (confirmResult.success) {
                    navigate(`/payment/success/${orderId}?txn=${result.paymentIntent.id}`, { replace: true });
                } else {
                    navigate(`/payment/failed/${orderId}`, { replace: true });
                }
            }
        } catch (err) {
            setCardError(err.response?.data?.message || err.message || 'Payment failed. Please try again.');
            setProcessing(false);
        }
    };

    const Icon = methodData.icon;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 lg:px-8">
            <div className="max-w-6xl mx-auto w-full">
                {/* Back Button */}
                <button
                    onClick={onBack}
                    disabled={processing}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium mb-6 transition-colors disabled:opacity-50"
                >
                    <FiArrowLeft size={16} /> Change Payment Method
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-7 xl:col-span-8">
                        {/* Card Header */}
                <div className="text-center mb-8">
                    <div className={`w-14 h-14 rounded-xl bg-primary-600 flex items-center justify-center mx-auto mb-4`}>
                        <Icon className="text-white" size={28} />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                        Pay with {methodData.name}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Amount: <span className="font-bold text-gray-800">₹{orderAmount ? orderAmount.toLocaleString('en-IN') : '—'}</span>
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold">
                        <svg viewBox="0 0 28 12" width="28" height="12" className="flex-shrink-0"><path fill="#635BFF" d="M13.976 3.075c0-1.09.535-1.95 1.558-1.95.98 0 1.514.86 1.514 1.928 0 1.432-.578 1.983-1.536 1.983-.937 0-1.536-.616-1.536-1.961zm-1.254 0c0 1.84 1.09 3.075 2.79 3.075 1.744 0 2.812-1.278 2.812-3.097C18.324 1.278 17.234 0 15.512 0c-1.7 0-2.79 1.235-2.79 3.075zM1.167 5.908h1.301l.3-1.928h.022c.107 1.322.959 2.084 2.084 2.084.535 0 .97-.171 1.3-.45l-.213-1.112c-.235.193-.535.322-.862.322-.659 0-1.108-.472-1.108-1.322V3.44h1.885V2.307H3.69V.464H2.369l-.171 1.843H1.167v1.133h.981v.064c0 1.507-.407 2.404-1.883 2.404h-.064l.966.043V5.91zM8.69 5.908h1.236V3.869c0-.83.45-1.365 1.172-1.365.15 0 .343.021.472.064V1.328a1.5 1.5 0 0 0-.364-.043c-.665 0-1.172.408-1.365 1.09h-.021l-.065-.98H8.69v4.513zM19.24 5.908h1.236V3.61c0-.723.45-1.172 1.108-1.172.622 0 .895.386.895 1.044v2.426h1.236V3.267c0-1.236-.665-1.982-1.757-1.982-.73 0-1.214.343-1.493.895h-.022V1.395H19.24v4.513zM24.77 4.539c.3.3.773.493 1.365.493 1.044 0 1.843-.644 1.843-1.6 0-.73-.407-1.172-1.172-1.407l-.493-.15c-.3-.107-.493-.236-.493-.472 0-.257.236-.429.579-.429.3 0 .536.107.708.3l.73-.665c-.278-.3-.73-.493-1.322-.493-1.001 0-1.715.601-1.715 1.493 0 .708.429 1.15 1.108 1.365l.472.15c.364.107.558.257.558.493 0 .278-.257.472-.644.472-.364 0-.644-.15-.862-.386l-.665.836z"/></svg>
                        Powered by Stripe (Test Mode)
                    </div>
                </div>

                {/* 3D Flipping Card Preview */}
                <div className="w-full max-w-md mx-auto aspect-[1.586/1] perspective-1000 mb-8 cursor-pointer relative" onClick={() => setIsFlipped(!isFlipped)}>
                    <div className={`w-full h-full duration-700 transform-style-3d transition-transform relative ${isFlipped ? 'rotate-y-180' : ''}`}>
                        
                        {/* Front Face */}
                        <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-950 p-6 flex flex-col justify-between text-white backface-hidden shadow-2xl border border-white/10 overflow-hidden">
                            <div className="absolute -inset-1/2 bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-45 pointer-events-none" />
                            
                            <div className="flex justify-between items-start z-10">
                                <div className="w-12 h-9 bg-gradient-to-br from-amber-300 to-amber-500 rounded-lg flex items-center justify-center shadow-md">
                                    <div className="w-8 h-6 border border-amber-600/30 rounded-sm grid grid-cols-3 grid-rows-3 opacity-80" />
                                </div>
                                <div className="text-right">
                                    <span className="text-white/50 text-[9px] uppercase tracking-wider block font-bold">Stripe Card</span>
                                    <span className="text-xs font-bold uppercase tracking-wider text-primary-400">Test Mode</span>
                                </div>
                            </div>

                            <div className="z-10 my-auto py-2">
                                <p className="text-white text-lg md:text-xl font-mono tracking-[0.18em]">
                                    {cardNumberText || '•••• •••• •••• ••••'}
                                </p>
                            </div>

                            <div className="flex justify-between items-end z-10">
                                <div className="max-w-[70%]">
                                    <p className="text-white/40 text-[9px] uppercase tracking-widest font-bold">Card Holder</p>
                                    <p className="text-sm font-semibold uppercase tracking-wider truncate">
                                        {cardholderName || 'Stripe Customer'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-white/40 text-[9px] uppercase tracking-widest font-bold">Expires</p>
                                    <p className="text-sm font-semibold font-mono">
                                        {cardExpiryText || 'MM/YY'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Back Face */}
                        <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-indigo-950 via-gray-900 to-black p-6 flex flex-col justify-between text-white backface-hidden rotate-y-180 shadow-2xl border border-white/10 overflow-hidden">
                            <div className="absolute left-0 top-6 w-full h-11 bg-black/90" />
                            
                            <div className="mt-14 w-full space-y-2 z-10">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[9px] text-white/50 uppercase tracking-wider font-semibold">Authorized Signature</span>
                                    <span className="text-[9px] text-white/50 uppercase tracking-wider font-semibold">CVC</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="flex-1 h-9 bg-white/15 rounded-l-md flex items-center justify-start pl-3 font-serif italic text-white/70 text-xs select-none">
                                        Stripe Test Card
                                    </div>
                                    <div className="w-14 h-9 bg-white text-black font-mono font-bold text-center flex items-center justify-center rounded-r-md text-base select-none">
                                        {cardCvcText || '•••'}
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mt-auto z-10">
                                <p className="text-[8px] text-white/30 font-medium">
                                    This is a secure Stripe test card environment.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stripe Card Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 md:p-8 space-y-5">
                    
                    {/* Cardholder Name */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Cardholder Name</label>
                        <input
                            type="text"
                            value={cardholderName}
                            onChange={(e) => setCardholderName(e.target.value)}
                            placeholder="e.g. John Doe"
                            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 transition-colors bg-white text-gray-900 text-sm font-medium"
                            required
                        />
                    </div>

                    {/* Card Number element */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Card Number</label>
                        <div className={`px-4 py-4 border-2 rounded-xl transition-all ${cardError ? 'border-red-400 bg-red-50' : 'border-gray-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 bg-white'}`}>
                            <CardNumberElement
                                options={CARD_ELEMENT_OPTIONS}
                                onFocus={() => { setFocusedField('number'); setIsFlipped(false); }}
                                onChange={(e) => {
                                    setNumComplete(e.complete);
                                    setCardBrand(e.brand);
                                    if (e.complete) {
                                        setCardNumberText('4242 4242 4242 4242');
                                    } else if (!e.empty) {
                                        setCardNumberText('4242 4242 •••• ••••');
                                    } else {
                                        setCardNumberText('');
                                    }
                                    setCardError(e.error ? e.error.message : '');
                                }}
                            />
                        </div>
                    </div>

                    {/* Expiry and CVC elements in grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Expiry Date</label>
                            <div className={`px-4 py-4 border-2 rounded-xl transition-all ${cardError ? 'border-red-400 bg-red-50' : 'border-gray-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 bg-white'}`}>
                                <CardExpiryElement
                                    options={CARD_ELEMENT_OPTIONS}
                                    onFocus={() => { setFocusedField('expiry'); setIsFlipped(false); }}
                                    onChange={(e) => {
                                        setExpComplete(e.complete);
                                        if (e.complete) {
                                            setCardExpiryText('12/28');
                                        } else {
                                            setCardExpiryText('');
                                        }
                                        setCardError(e.error ? e.error.message : '');
                                    }}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">CVC / CVV</label>
                            <div className={`px-4 py-4 border-2 rounded-xl transition-all ${cardError ? 'border-red-400 bg-red-50' : 'border-gray-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100 bg-white'}`}>
                                <CardCvcElement
                                    options={CARD_ELEMENT_OPTIONS}
                                    onFocus={() => { setFocusedField('cvc'); setIsFlipped(true); }}
                                    onBlur={() => { setFocusedField(''); setIsFlipped(false); }}
                                    onChange={(e) => {
                                        setCvcComplete(e.complete);
                                        if (e.complete) {
                                            setCardCvcText('123');
                                        } else {
                                            setCardCvcText('');
                                        }
                                        setCardError(e.error ? e.error.message : '');
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {cardError && <p className="text-xs text-red-500 mt-1 font-medium">{cardError}</p>}
                    
                    <p className="text-xs text-gray-400 mt-1">
                        Test card number: <span className="font-mono font-bold text-gray-500">4242 4242 4242 4242</span> • Any future date • Any CVC
                    </p>

                    {/* Security note */}
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                        <FiShield className="text-green-500 flex-shrink-0" size={16} />
                        <p className="text-xs text-green-700 font-medium">
                            Your card details are handled securely by Stripe. We never store credit credentials.
                        </p>
                    </div>

                    {/* Pay Button */}
                    <button
                        type="submit"
                        disabled={!stripe || !isSplitComplete || processing}
                        className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] ${
                            !stripe || !isSplitComplete || processing
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-gray-900 hover:bg-primary-600'
                        }`}
                    >
                        {processing ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Processing Payment…
                            </>
                        ) : (
                            <>
                                <FiLock size={18} />
                                Pay ₹{orderAmount ? orderAmount.toLocaleString('en-IN') : '—'}
                            </>
                        )}
                    </button>

                    {/* Local styles for 3D card flipping */}
                    <style dangerouslySetInnerHTML={{__html: `
                        .perspective-1000 {
                            perspective: 1000px;
                        }
                        .transform-style-3d {
                            transform-style: preserve-3d;
                        }
                        .backface-hidden {
                            backface-visibility: hidden;
                        }
                        .rotate-y-180 {
                            transform: rotateY(180deg);
                        }
                    `}} />
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
                        <span>Stripe Secured</span>
                    </div>
                </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    {orderData && (
                        <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-8 space-y-6">
                            {/* Order Summary Card */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
                                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="text-lg font-bold text-gray-900">Order Summary</h3>
                                    <p className="text-xs text-gray-500 mt-1">Order #{orderId?.slice(-8).toUpperCase()}</p>
                                </div>
                                
                                <div className="px-6 py-5 max-h-[350px] overflow-y-auto scrollbar-thin">
                                    <div className="space-y-4">
                                        {orderData.orderItems?.map((item) => (
                                            <div key={item._id} className="flex gap-4">
                                                <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 border border-gray-200 overflow-hidden">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-gray-900 truncate">{item.name}</h4>
                                                    <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} {item.size && `• Size: ${item.size}`}</p>
                                                    <p className="text-sm font-bold text-gray-900 mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="px-6 py-5 border-t border-gray-100 bg-gray-50">
                                    <div className="flex items-center justify-between mb-2 text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-bold text-gray-700">₹{orderData.itemsPrice?.toLocaleString('en-IN') || orderAmount?.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex items-center justify-between mb-2 text-sm">
                                        <span className="text-gray-500">Shipping</span>
                                        <span className="font-bold text-gray-700">{orderData.shippingPrice === 0 ? 'Free' : `₹${orderData.shippingPrice?.toLocaleString('en-IN')}`}</span>
                                    </div>
                                    <div className="flex items-center justify-between mb-4 text-sm">
                                        <span className="text-gray-500">Tax</span>
                                        <span className="font-bold text-gray-700">₹{orderData.taxPrice?.toLocaleString('en-IN') || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                        <span className="text-base font-bold text-gray-900">Total</span>
                                        <span className="text-xl font-bold text-gray-900">₹{orderAmount?.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Badge Card */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Why Shop With Us?</h4>
                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 text-primary-600">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">100% Genuine Products</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Sourced directly from brands</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 text-primary-600">
                                            <FiShield size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Secure Payments</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Your data is always protected</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ------------- Main PaymentGateway Component -------------
const PaymentGateway = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [selectedMethod, setSelectedMethod] = useState('');
    const [orderAmount, setOrderAmount] = useState(null);
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showStripeForm, setShowStripeForm] = useState(false);
    const redirectTimerRef = useRef(null);

    useEffect(() => {
        const loadOrder = async () => {
            try {
                const order = await fetchOrderById(orderId);
                setOrderAmount(order.totalPrice);
                setOrderData(order);
            } catch {
                setOrderAmount(null);
                setOrderData(null);
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
        setSelectedMethod(methodId);
        setShowStripeForm(true);
    };

    // Go back from form views to method selection
    const handleBackToMethods = () => {
        setShowStripeForm(false);
        setSelectedMethod('');
    };

    const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium">Loading payment details...</p>
                </div>
            </div>
        );
    }

    // --- Stripe Card Form (Credit / Debit) ---
    if (showStripeForm && selectedMethodData) {
        return (
            <Elements stripe={stripePromise}>
                <StripeCardForm
                    orderAmount={orderAmount}
                    orderId={orderId}
                    orderData={orderData}
                    methodData={selectedMethodData}
                    onBack={handleBackToMethods}
                />
            </Elements>
        );
    }

    // --- Default: Payment Method Selection ---
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="text-center mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 font-medium mb-6 transition-colors"
                    >
                        <FiArrowLeft size={16} /> Back
                    </button>
                    <div className="w-16 h-16 rounded-xl bg-primary-600 flex items-center justify-center mx-auto mb-5">
                        <FiLock className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
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
                            <p className="text-3xl font-bold text-gray-900">
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
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors bg-gray-100 text-gray-500 group-hover:bg-primary-600 group-hover:text-white`}>
                                            <Icon size={22} />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-base mb-0.5 text-gray-800">
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
                                            <span className="hidden sm:block text-xs font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                Enter Card
                                            </span>
                                            <FiChevronRight className="text-gray-300 group-hover:text-primary-500 transition-colors" size={20} />
                                        </div>
                                    </div>

                                    {/* Method type badge */}
                                    <div className="absolute top-3 right-3">
                                        <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            Stripe Secure
                                        </span>
                                    </div>
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
                            <span>Stripe Secured</span>
                        </div>
                    </div>
                    <p className="text-center text-[11px] text-gray-400">
                        Card payments are processed securely via Stripe.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentGateway;
