import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FiCopy, FiArrowRight, FiShield } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [searchParams] = useSearchParams();
    const transactionId = searchParams.get('txn') || 'N/A';
    const [countdown, setCountdown] = useState(7);

    // Countdown and automatic redirection timer
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

    // Canvas-based lightweight falling confetti effect
    useEffect(() => {
        const canvas = document.getElementById('confetti-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#f43f5e'];
        const particles = [];

        // Generate 120 colorful falling confetti items
        for (let i = 0; i < 120; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * -window.innerHeight - 20,
                size: Math.random() * 7 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: Math.random() * 6 - 3,
                speedY: Math.random() * 3 + 2.5,
                speedX: Math.random() * 2.5 - 1.25,
            });
        }

        let animationFrameId;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let active = false;

            particles.forEach(p => {
                p.y += p.speedY;
                p.x += p.speedX;
                p.rotation += p.rotationSpeed;

                if (p.y < canvas.height) {
                    active = true;
                }

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                
                // Draw rectangles & circles alternatingly
                if (p.size % 2 === 0) {
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            });

            if (active) {
                animationFrameId = requestAnimationFrame(animate);
            }
        };
        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    const copyTxnId = () => {
        navigator.clipboard.writeText(transactionId);
        toast.success('Transaction ID copied!');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 relative overflow-hidden">
            {/* Confetti Canvas Container */}
            <canvas id="confetti-canvas" className="absolute inset-0 w-full h-full pointer-events-none z-40" />

            <div className="text-center max-w-lg w-full z-10 bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-xl relative">
                {/* SVG Drawing Checkmark Circle */}
                <div className="mx-auto mb-8 w-24 h-24 rounded-full bg-green-50 flex items-center justify-center border border-green-100/50 shadow-inner">
                    <svg className="w-16 h-16 stroke-green-500 fill-none" viewBox="0 0 52 52">
                        <circle className="circle-draw" cx="26" cy="26" r="24" stroke="currentColor" strokeWidth="3" />
                        <path className="check-draw" d="M15 27l7.5 7.5 16.5-16.5" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                <p className="text-gray-500 text-sm md:text-base mb-8">Thank you for your order. We've verified your transaction.</p>

                <div className="bg-gray-50/60 dark:bg-gray-800/10 rounded-2xl border border-gray-150 p-6 mb-8 text-left space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Transaction Reference</p>
                            <p className="text-sm font-mono font-bold text-gray-900">{transactionId}</p>
                        </div>
                        <button onClick={copyTxnId} className="p-2 rounded-xl bg-white hover:bg-primary-50 text-gray-400 hover:text-primary-600 transition-colors border border-gray-250 shadow-sm" title="Copy Transaction Reference">
                            <FiCopy size={15} />
                        </button>
                    </div>
                    <div className="h-px bg-gray-200" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Order Identification</p>
                            <p className="text-sm font-mono font-bold text-gray-700">#{orderId?.slice(-8).toUpperCase()}</p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-green-50/80 px-3 py-1.5 rounded-full border border-green-100">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-semibold text-green-600">Settled</span>
                        </div>
                    </div>
                </div>

                <button onClick={() => navigate(`/order-confirmation/${orderId}`)} className="w-full bg-gray-900 hover:bg-primary-600 text-white py-3.5 rounded-xl font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mb-4 shadow-md">
                    View Order Details <FiArrowRight size={16} />
                </button>

                <p className="text-xs text-gray-400">Redirecting to order dashboard in <span className="font-semibold text-primary-600">{countdown}s</span></p>

                <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                    <FiShield className="text-green-500" size={13} /> Secured by 256-bit SSL encryption
                </div>
            </div>

            {/* Custom SVG Drawing CSS animation rules */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes drawCircle {
                    from { stroke-dashoffset: 160; }
                    to { stroke-dashoffset: 0; }
                }
                @keyframes drawCheck {
                    from { stroke-dashoffset: 40; }
                    to { stroke-dashoffset: 0; }
                }
                .circle-draw {
                    stroke-dasharray: 160;
                    stroke-dashoffset: 160;
                    animation: drawCircle 0.65s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                }
                .check-draw {
                    stroke-dasharray: 40;
                    stroke-dashoffset: 40;
                    animation: drawCheck 0.45s cubic-bezier(0.4, 0, 0.2, 1) 0.55s forwards;
                }
            `}} />
        </div>
    );
};

export default PaymentSuccess;
