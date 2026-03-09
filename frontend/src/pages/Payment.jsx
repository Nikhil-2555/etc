import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { simulatePayment } from '../services/api';
import { FiShield } from 'react-icons/fi';

const ProcessingPayment = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [dots, setDots] = useState('');

    useEffect(() => {
        // Animate dots
        const dotInterval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);

        // Simulate payment after 2 seconds
        const paymentTimer = setTimeout(async () => {
            try {
                const result = await simulatePayment(orderId);
                if (result.success) {
                    navigate(`/payment/success/${orderId}?txn=${result.transactionId}`, { replace: true });
                } else {
                    navigate(`/payment/failed/${orderId}`, { replace: true });
                }
            } catch (error) {
                navigate(`/payment/failed/${orderId}`, { replace: true });
            }
        }, 2000);

        return () => {
            clearInterval(dotInterval);
            clearTimeout(paymentTimer);
        };
    }, [orderId, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-950 to-indigo-950 flex items-center justify-center px-4">
            <div className="text-center">
                {/* Animated Payment Icon */}
                <div className="relative mx-auto mb-10 w-32 h-32">
                    {/* Outer ring pulse */}
                    <div className="absolute inset-0 rounded-full bg-primary-500/20 animate-ping" style={{ animationDuration: '2s' }} />
                    <div className="absolute inset-2 rounded-full bg-primary-500/10 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                    {/* Main circle */}
                    <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-primary-500/30">
                        {/* Card icon with animation */}
                        <svg className="w-14 h-14 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                        </svg>
                    </div>
                </div>

                {/* Processing Text */}
                <h1 className="text-3xl md:text-4xl font-black text-white mb-3">
                    Processing Payment{dots}
                </h1>
                <p className="text-primary-200 text-base md:text-lg mb-8 max-w-md mx-auto">
                    Please wait while we securely process your payment. Do not close or refresh this page.
                </p>

                {/* Progress bar */}
                <div className="w-64 md:w-80 h-1.5 bg-white/10 rounded-full overflow-hidden mx-auto mb-8">
                    <div
                        className="h-full bg-gradient-to-r from-primary-400 to-indigo-400 rounded-full"
                        style={{
                            animation: 'progressFill 2s ease-in-out forwards'
                        }}
                    />
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-primary-300/80 text-sm">
                    <FiShield className="text-green-400" />
                    <span>256-bit SSL Encrypted • Secure Transaction</span>
                </div>
            </div>

            {/* CSS Animation for progress bar */}
            <style>{`
                @keyframes progressFill {
                    0% { width: 0%; }
                    50% { width: 60%; }
                    80% { width: 85%; }
                    100% { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default ProcessingPayment;
