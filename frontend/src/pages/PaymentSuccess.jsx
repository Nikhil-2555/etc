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
        return () => clearInterval(timer);
    }, [navigate, orderId]);

    const copyTxnId = () => {
        navigator.clipboard.writeText(transactionId);
        toast.success('Transaction ID copied!');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="text-center max-w-lg w-full">
                <div className="mx-auto mb-8 w-20 h-20 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
                    <FiCheckCircle className="text-green-500" size={36} />
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                <p className="text-gray-600 text-base mb-8">Your payment has been processed successfully.</p>

                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 text-left">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Transaction ID</p>
                                <p className="text-base font-mono font-bold text-gray-900">{transactionId}</p>
                            </div>
                            <button onClick={copyTxnId} className="p-2.5 rounded-lg bg-gray-50 hover:bg-primary-50 text-gray-500 hover:text-primary-600 transition-colors border border-gray-100" title="Copy">
                                <FiCopy size={16} />
                            </button>
                        </div>
                        <div className="h-px bg-gray-100" />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Order ID</p>
                                <p className="text-sm font-mono font-bold text-gray-700">#{orderId?.slice(-8).toUpperCase()}</p>
                            </div>
                            <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-xs font-semibold text-green-600">Paid</span>
                            </div>
                        </div>
                    </div>
                </div>

                <button onClick={() => navigate(`/order-confirmation/${orderId}`)} className="w-full bg-gray-900 hover:bg-primary-600 text-white py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 mb-4">
                    View Order Details <FiArrowRight size={16} />
                </button>

                <p className="text-sm text-gray-400">Redirecting in <span className="font-semibold text-primary-600">{countdown}s</span></p>

                <div className="mt-6 flex items-center justify-center gap-1 text-xs text-gray-400">
                    <FiShield className="text-green-500" size={12} /> Secured by 256-bit SSL encryption
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
