import { useNavigate, useParams } from 'react-router-dom';
import { FiAlertTriangle, FiRefreshCw, FiArrowLeft, FiShield } from 'react-icons/fi';

const PaymentFailed = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="text-center max-w-lg w-full">
                {/* Failure Icon */}
                <div className="mx-auto mb-8 w-20 h-20 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                    <FiAlertTriangle className="text-red-500" size={36} />
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Payment Failed
                </h1>
                <p className="text-gray-600 text-base mb-2">
                    Unfortunately, your payment could not be processed.
                </p>
                <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">
                    This could be due to insufficient funds, a network error, or a bank decline. Your order has been saved — you can retry the payment.
                </p>

                {/* Order Info Card */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8 text-left">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Order ID</p>
                            <p className="text-sm font-mono font-bold text-gray-700">#{orderId?.slice(-8).toUpperCase()}</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-xs font-semibold text-red-600">Payment Failed</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={() => navigate(`/payment/processing/${orderId}`)}
                        className="w-full bg-gray-900 hover:bg-primary-600 text-white py-3.5 rounded-xl font-semibold text-base transition-colors flex items-center justify-center gap-2"
                    >
                        <FiRefreshCw size={18} /> Retry Payment
                    </button>
                    <button
                        onClick={() => navigate('/checkout')}
                        className="w-full bg-white border border-gray-200 hover:border-gray-300 text-gray-700 py-3.5 rounded-xl font-semibold text-base hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <FiArrowLeft size={18} /> Back to Checkout
                    </button>
                </div>

                <div className="mt-8 flex items-center justify-center gap-1 text-xs text-gray-400">
                    <FiShield className="text-green-500" size={12} /> Your payment information is never stored
                </div>
            </div>
        </div>
    );
};

export default PaymentFailed;
