import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FiCheckCircle, FiCopy, FiArrowRight, FiShield } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [searchParams] = useSearchParams();
    const transactionId = searchParams.get('txn') || 'N/A';
    const [countdown, setCountdown] = useState(5);
    const [confetti, setConfetti] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate(`/order-confirmation/${orderId}`, { replace: true });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Hide confetti after animation
        const confettiTimer = setTimeout(() => setConfetti(false), 3000);

        return () => {
            clearInterval(timer);
            clearTimeout(confettiTimer);
        };
    }, [navigate, orderId]);

    const copyTxnId = () => {
        navigator.clipboard.writeText(transactionId);
        toast.success('Transaction ID copied!');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center px-4 relative overflow-hidden">
            {/* Confetti Animation */}
            {confetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {Array.from({ length: 30 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2.5 h-2.5 rounded-full opacity-80"
                            style={{
                                backgroundColor: ['#22c55e', '#6366f1', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'][i % 6],
                                left: `${Math.random() * 100}%`,
                                top: `-5%`,
                                animation: `confettiFall ${2 + Math.random() * 2}s ease-in forwards`,
                                animationDelay: `${Math.random() * 1}s`,
                            }}
                        />
                    ))}
                </div>
            )}

            <div className="text-center max-w-lg w-full">
                {/* Success Icon */}
                <div className="relative mx-auto mb-8 w-28 h-28">
                    <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" style={{ animationDuration: '2s' }} />
                    <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-300/40">
                        <FiCheckCircle className="text-white" size={50} />
                    </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                    Payment Successful! 🎉
                </h1>
                <p className="text-gray-600 text-base md:text-lg mb-8">
                    Your payment has been processed successfully.
                </p>

                {/* Transaction Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6 mb-8 text-left">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Transaction ID</p>
                                <p className="text-lg font-mono font-black text-gray-900">{transactionId}</p>
                            </div>
                            <button
                                onClick={copyTxnId}
                                className="p-3 rounded-xl bg-gray-100 hover:bg-primary-100 text-gray-500 hover:text-primary-600 transition-all"
                                title="Copy Transaction ID"
                            >
                                <FiCopy size={18} />
                            </button>
                        </div>
                        <div className="h-px bg-gray-100" />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Order ID</p>
                                <p className="text-sm font-mono font-bold text-gray-700">#{orderId?.slice(-8).toUpperCase()}</p>
                            </div>
                            <div className="flex items-center gap-1.5 bg-green-100 px-3 py-1.5 rounded-full">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-xs font-bold text-green-700">Paid</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={() => navigate(`/order-confirmation/${orderId}`)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-xl font-black text-lg shadow-lg hover:shadow-green-500/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98] mb-4"
                >
                    View Order Details <FiArrowRight />
                </button>

                {/* Auto-redirect countdown */}
                <p className="text-sm text-gray-400">
                    Redirecting to order details in <span className="font-bold text-primary-600">{countdown}s</span>
                </p>

                <div className="mt-6 flex items-center justify-center gap-1 text-xs text-gray-400">
                    <FiShield className="text-green-400" /> Secured by 256-bit SSL encryption
                </div>
            </div>

            {/* CSS Animation */}
            <style>{`
                @keyframes confettiFall {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default PaymentSuccess;
