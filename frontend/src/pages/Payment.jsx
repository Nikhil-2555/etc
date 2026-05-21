import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { simulatePayment } from '../services/api';
import { FiShield, FiSmartphone, FiCreditCard, FiGlobe } from 'react-icons/fi';

const METHOD_META = {
    upi: { label: 'UPI', icon: FiSmartphone, steps: ['Connecting to UPI gateway…', 'Verifying merchant…', 'Authorizing payment…', 'Confirming…'] },
    credit: { label: 'Credit Card', icon: FiCreditCard, steps: ['Connecting to gateway…', 'Verifying card…', '3D Secure check…', 'Authorizing…'] },
    debit: { label: 'Debit Card', icon: FiCreditCard, steps: ['Connecting to bank…', 'Verifying card…', 'Contacting bank…', 'Confirming…'] },
    netbanking: { label: 'Net Banking', icon: FiGlobe, steps: ['Connecting to portal…', 'Authenticating…', 'Processing…', 'Confirming…'] },
};

const DEFAULT_META = { label: 'Payment', icon: FiCreditCard, steps: ['Connecting…', 'Verifying…', 'Processing…', 'Confirming…'] };

const ProcessingPayment = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const stateMethodId = location.state?.methodId;
    const meta = (stateMethodId && METHOD_META[stateMethodId]) ? METHOD_META[stateMethodId] : DEFAULT_META;
    const Icon = meta.icon;

    const [stepIndex, setStepIndex] = useState(0);
    const [dots, setDots] = useState('');

    useEffect(() => {
        const dotInterval = setInterval(() => setDots(prev => prev.length >= 3 ? '' : prev + '.'), 400);
        const stepInterval = setInterval(() => setStepIndex(prev => prev < meta.steps.length - 1 ? prev + 1 : prev), 600);

        const paymentTimer = setTimeout(async () => {
            try {
                const result = await simulatePayment(orderId);
                clearInterval(dotInterval);
                clearInterval(stepInterval);
                if (result.success) {
                    navigate(`/payment/success/${orderId}?txn=${result.transactionId}`, { replace: true });
                } else {
                    navigate(`/payment/failed/${orderId}`, { replace: true });
                }
            } catch {
                navigate(`/payment/failed/${orderId}`, { replace: true });
            }
        }, 2500);

        return () => { clearInterval(dotInterval); clearInterval(stepInterval); clearTimeout(paymentTimer); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId, navigate]);

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
            <div className="text-center w-full max-w-sm mx-auto">
                {/* Icon */}
                <div className="mx-auto mb-8 w-24 h-24 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                    <Icon className="text-primary-400 animate-pulse" size={40} />
                </div>

                <div className="inline-flex items-center gap-2 bg-gray-800 border border-gray-700 text-gray-300 text-xs font-semibold uppercase tracking-wider px-4 py-1.5 rounded-full mb-5">
                    <Icon size={12} /> {meta.label}
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Processing{dots}</h1>
                <p className="text-gray-400 text-sm mb-1 h-5">{meta.steps[stepIndex]}</p>
                <p className="text-gray-500 text-xs mb-8">Please wait while we securely process your payment.</p>

                {/* Progress bar */}
                <div className="w-72 md:w-80 h-1.5 bg-gray-800 rounded-full overflow-hidden mx-auto mb-8">
                    <div className="h-full bg-primary-500 rounded-full" style={{ animation: 'progressFill 2.5s ease-in-out forwards' }} />
                </div>

                {/* Step Dots */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {meta.steps.map((_, i) => (
                        <div key={i} className={`rounded-full transition-all duration-300 ${i <= stepIndex ? 'w-5 h-1.5 bg-primary-500' : 'w-1.5 h-1.5 bg-gray-700'}`} />
                    ))}
                </div>

                <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
                    <FiShield className="text-green-500" size={14} />
                    <span>256-bit SSL Encrypted</span>
                </div>
                <p className="text-gray-600 text-[10px] mt-3">Do not close or refresh this page</p>
            </div>

            <style>{`
                @keyframes progressFill {
                    0% { width: 0%; }
                    30% { width: 40%; }
                    60% { width: 70%; }
                    85% { width: 90%; }
                    100% { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default ProcessingPayment;
