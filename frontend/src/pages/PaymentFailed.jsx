import { useNavigate, useParams } from 'react-router-dom';
import { FiAlertTriangle, FiRefreshCw, FiArrowLeft, FiShield } from 'react-icons/fi';

const PaymentFailed = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-rose-50 to-orange-50 flex items-center justify-center px-4">
            <div className="text-center max-w-lg w-full">
                {/* Failure Icon */}
                <div className="relative mx-auto mb-8 w-28 h-28">
                    <div className="absolute inset-0 rounded-full bg-red-400/15 animate-pulse" style={{ animationDuration: '2s' }} />
                    <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center shadow-2xl shadow-red-200/50">
                        <FiAlertTriangle className="text-white" size={48} />
                    </div>
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                    Payment Failed
                </h1>
                <p className="text-gray-600 text-base md:text-lg mb-3">
                    Unfortunately, your payment could not be processed.
                </p>
                <p className="text-gray-400 text-sm mb-10 max-w-sm mx-auto">
                    This could be due to insufficient funds, a network error, or a bank decline. Your order has been saved — you can retry the payment.
                </p>

                {/* Order Info Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-5 mb-8 text-left">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Order ID</p>
                            <p className="text-sm font-mono font-bold text-gray-700">#{orderId?.slice(-8).toUpperCase()}</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-red-100 px-3 py-1.5 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-xs font-bold text-red-700">Payment Failed</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={() => navigate(`/payment/processing/${orderId}`)}
                        className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white py-4 rounded-xl font-black text-lg shadow-lg hover:shadow-primary-600/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        <FiRefreshCw size={18} /> Retry Payment
                    </button>
                    <button
                        onClick={() => navigate('/checkout')}
                        className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 py-4 rounded-xl font-bold text-base hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        <FiArrowLeft size={18} /> Back to Checkout
                    </button>
                </div>

                <div className="mt-8 flex items-center justify-center gap-1 text-xs text-gray-400">
                    <FiShield className="text-green-400" /> Your payment information is never stored
                </div>
            </div>
        </div>
    );
};

export default PaymentFailed;
