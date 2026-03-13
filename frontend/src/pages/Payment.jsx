import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { simulatePayment } from '../services/api';
import { FiShield, FiSmartphone, FiCreditCard, FiGlobe } from 'react-icons/fi';

// Method metadata to render correct icon + colour when state is available
const METHOD_META = {
    upi: {
        label: 'UPI',
        icon: FiSmartphone,
        color: 'from-violet-500 to-purple-600',
        shadow: 'shadow-violet-500/30',
        bar: 'from-violet-400 to-purple-400',
        subline: 'Auto-authorizing via Google Pay / PhonePe — No PIN required',
        steps: ['Connecting to UPI gateway…', 'Verifying merchant…', 'Auto-authorizing payment…', 'Confirming transaction…'],
    },
    credit: {
        label: 'Credit Card',
        icon: FiCreditCard,
        color: 'from-blue-500 to-cyan-600',
        shadow: 'shadow-blue-500/30',
        bar: 'from-blue-400 to-cyan-400',
        subline: 'Card details auto-filled — Starting 3D secure authorization…',
        steps: ['Connecting to card gateway…', 'Verifying card…', 'Running 3D Secure check…', 'Authorizing transaction…'],
    },
    debit: {
        label: 'Debit Card',
        icon: FiCreditCard,
        color: 'from-emerald-500 to-teal-600',
        shadow: 'shadow-emerald-500/30',
        bar: 'from-emerald-400 to-teal-400',
        subline: 'Card details auto-filled — Bank authorization in progress…',
        steps: ['Connecting to bank gateway…', 'Verifying card…', 'Contacting your bank…', 'Confirming transaction…'],
    },
    netbanking: {
        label: 'Net Banking',
        icon: FiGlobe,
        color: 'from-amber-500 to-orange-600',
        shadow: 'shadow-amber-500/30',
        bar: 'from-amber-400 to-orange-400',
        subline: 'Bank portal connected — Logging in automatically…',
        steps: ['Connecting to bank portal…', 'Authenticating session…', 'Processing payment…', 'Confirming transaction…'],
    },
};

const DEFAULT_META = {
    label: 'Payment',
    icon: FiCreditCard,
    color: 'from-primary-500 to-indigo-600',
    shadow: 'shadow-primary-500/30',
    bar: 'from-primary-400 to-indigo-400',
    subline: 'Please wait while we securely process your payment.',
    steps: ['Connecting to gateway…', 'Verifying details…', 'Processing payment…', 'Confirming transaction…'],
};

const ProcessingPayment = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const location = useLocation();

    // Read method from router state (set by PaymentGateway after method click)
    const stateMethodId = location.state?.methodId;
    const meta = (stateMethodId && METHOD_META[stateMethodId]) ? METHOD_META[stateMethodId] : DEFAULT_META;
    const Icon = meta.icon;

    const [stepIndex, setStepIndex] = useState(0);
    const [dots, setDots] = useState('');

    useEffect(() => {
        // Animate dots
        const dotInterval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 400);

        // Cycle through steps every 600ms
        const stepInterval = setInterval(() => {
            setStepIndex(prev => (prev < meta.steps.length - 1 ? prev + 1 : prev));
        }, 600);

        // Simulate payment after 2.5 seconds
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

        return () => {
            clearInterval(dotInterval);
            clearInterval(stepInterval);
            clearTimeout(paymentTimer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-950 to-indigo-950 flex items-center justify-center px-4">
            <div className="text-center w-full max-w-sm mx-auto">

                {/* Animated Method Icon */}
                <div className="relative mx-auto mb-10 w-36 h-36">
                    {/* Ripple rings */}
                    <div className={`absolute inset-0 rounded-full bg-white/10 animate-ping`} style={{ animationDuration: '2s' }} />
                    <div className={`absolute inset-4 rounded-full bg-white/5 animate-ping`} style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                    {/* Main circle */}
                    <div className={`relative w-36 h-36 rounded-full bg-gradient-to-br ${meta.color} flex items-center justify-center shadow-2xl ${meta.shadow}`}>
                        <Icon className="text-white animate-pulse" size={52} />
                    </div>
                    {/* Orbiting dot */}
                    <div className="absolute inset-0" style={{ animation: 'orbit 2s linear infinite' }}>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-3 h-3 rounded-full bg-white/70 shadow-lg" />
                    </div>
                </div>

                {/* Method Label */}
                <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${meta.color} text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-5 shadow-lg`}>
                    <Icon size={12} />
                    {meta.label}
                </div>

                {/* Processing Text */}
                <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                    Processing{dots}
                </h1>

                {/* Live Step Indicator */}
                <p className="text-primary-200 text-sm mb-1 h-5 transition-all duration-300">
                    {meta.steps[stepIndex]}
                </p>
                <p className="text-white/40 text-xs mb-8 max-w-xs mx-auto leading-relaxed">
                    {meta.subline}
                </p>

                {/* Progress bar */}
                <div className="w-72 md:w-80 h-2 bg-white/10 rounded-full overflow-hidden mx-auto mb-8">
                    <div
                        className={`h-full bg-gradient-to-r ${meta.bar} rounded-full`}
                        style={{ animation: 'progressFill 2.5s ease-in-out forwards' }}
                    />
                </div>

                {/* Step Dots */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {meta.steps.map((_, i) => (
                        <div
                            key={i}
                            className={`rounded-full transition-all duration-300 ${i <= stepIndex ? `w-6 h-2 bg-gradient-to-r ${meta.bar}` : 'w-2 h-2 bg-white/20'}`}
                        />
                    ))}
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 text-white/50 text-xs">
                    <FiShield className="text-green-400" size={14} />
                    <span>256-bit SSL Encrypted • No input required • Fully automated</span>
                </div>

                {/* Warning */}
                <p className="text-white/25 text-[10px] mt-4">
                    Do not close or refresh this page
                </p>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes progressFill {
                    0%   { width: 0%; }
                    30%  { width: 40%; }
                    60%  { width: 70%; }
                    85%  { width: 90%; }
                    100% { width: 100%; }
                }
                @keyframes orbit {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ProcessingPayment;
