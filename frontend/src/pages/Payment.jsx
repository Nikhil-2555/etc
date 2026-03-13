import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createPaymentIntent, payOrder } from '../services/api';
import { FiShield, FiCreditCard, FiLock, FiCheckCircle } from 'react-icons/fi';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Inner checkout form component (must be inside <Elements>)
const CheckoutForm = ({ orderId }) => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);
        setErrorMessage('');

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                redirect: 'if_required',
            });

            if (error) {
                setErrorMessage(error.message || 'Payment failed. Please try again.');
                setIsProcessing(false);
                return;
            }

            if (paymentIntent && paymentIntent.status === 'succeeded') {
                // Mark order as paid in our backend
                await payOrder(orderId, {
                    id: paymentIntent.id,
                    status: paymentIntent.status,
                    update_time: new Date().toISOString(),
                    paymentMethod: 'Stripe',
                });

                navigate(`/payment/success/${orderId}?txn=${paymentIntent.id}`, { replace: true });
            } else {
                navigate(`/payment/failed/${orderId}`, { replace: true });
            }
        } catch (err) {
            console.error('Payment confirmation error:', err);
            setErrorMessage('An unexpected error occurred. Please try again.');
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <PaymentElement
                    options={{
                        layout: 'tabs',
                    }}
                />
            </div>

            {errorMessage && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                    <span className="text-red-500 text-lg">⚠</span>
                    {errorMessage}
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className={`w-full py-4 rounded-xl font-black text-white text-lg transition-all flex items-center justify-center gap-3 shadow-lg ${
                    isProcessing || !stripe
                        ? 'bg-gray-400 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 hover:shadow-primary-600/30 active:scale-[0.98]'
                }`}
            >
                {isProcessing ? (
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
                        Pay Now
                    </>
                )}
            </button>

            {/* Security footer */}
            <div className="flex items-center justify-center gap-2 text-gray-400 dark:text-gray-500 text-xs">
                <FiShield className="text-green-500" size={14} />
                <span>Secured by Stripe • 256-bit SSL Encrypted</span>
            </div>
        </form>
    );
};

// Main Payment page component
const ProcessingPayment = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [clientSecret, setClientSecret] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSecret = async () => {
            try {
                const data = await createPaymentIntent(orderId);
                setClientSecret(data.clientSecret);
            } catch (err) {
                console.error('Error creating payment intent:', err);
                setError(err.response?.data?.message || 'Failed to initialize payment. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchSecret();
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30 dark:from-gray-900 dark:via-gray-950 dark:to-black flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-primary-500/30">
                        <FiCreditCard className="text-white animate-pulse" size={28} />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold">Initializing payment…</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30 dark:from-gray-900 dark:via-gray-950 dark:to-black flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <span className="text-red-500 text-3xl">✕</span>
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">Payment Error</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-gray-900 dark:bg-gray-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const appearance = {
        theme: 'stripe',
        variables: {
            colorPrimary: '#6366f1',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            fontFamily: '"Inter", system-ui, sans-serif',
            borderRadius: '12px',
            spacingUnit: '4px',
        },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50/30 dark:from-gray-900 dark:via-gray-950 dark:to-black py-12 px-4">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-primary-500/30 mb-4">
                        <FiCreditCard className="text-white" size={28} />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">Complete Payment</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Enter your payment details below</p>
                </div>

                {/* Secure badge */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800">
                        <FiCheckCircle size={12} />
                        Stripe Test Mode
                    </div>
                </div>

                {/* Stripe Elements */}
                {clientSecret && (
                    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                        <CheckoutForm orderId={orderId} />
                    </Elements>
                )}

                {/* Test card hint */}
                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-1">🧪 Test Mode</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                        Use card number <span className="font-mono font-bold">4242 4242 4242 4242</span> with any future expiry and any CVC.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProcessingPayment;
