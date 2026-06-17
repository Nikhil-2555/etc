import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchOrderById } from '../services/api';
import { FiDownload, FiArrowLeft, FiCheckCircle, FiPrinter } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Receipt = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const receiptRef = useRef(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchOrderById(orderId);
                setOrder(data);
            } catch {
                toast.error('Failed to load receipt');
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [orderId, navigate]);

    const formatCurrency = (val) =>
        `Rs. ${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const formatDate = (d) =>
        new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    const receiptNo = order ? '#' + order._id.slice(-8).toUpperCase() : '';

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium">Loading receipt…</p>
                </div>
            </div>
        );
    }

    if (!order) return null;

    const subtotal = order.orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = 100;

    return (
        <>
            {/* ── Print styles injected inline ── */}
            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    #receipt-printable, #receipt-printable * { visibility: visible !important; }
                    #receipt-printable {
                        position: fixed !important;
                        top: 0; left: 0;
                        width: 100vw !important;
                        padding: 32px 40px !important;
                        background: #fff !important;
                        z-index: 9999 !important;
                    }
                    .no-print { display: none !important; }
                }
            `}</style>

            {/* ── Page wrapper (screen only) ── */}
            <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-indigo-50/40 py-10 px-4 no-print-bg">
                {/* Action bar */}
                <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between no-print">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        <FiArrowLeft size={16} /> Back to Order
                    </button>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-700 text-sm font-bold hover:border-gray-300 hover:shadow-md transition-all"
                        >
                            <FiPrinter size={16} /> Print
                        </button>
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-primary-600 text-white text-sm font-bold shadow-lg hover:shadow-indigo-500/30 hover:from-indigo-700 hover:to-primary-700 transition-all active:scale-[0.98]"
                        >
                            <FiDownload size={16} /> Download PDF
                        </button>
                    </div>
                </div>

                {/* ── Receipt card ── */}
                <div
                    id="receipt-printable"
                    ref={receiptRef}
                    className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl shadow-gray-200/60 overflow-hidden border border-gray-100"
                >
                    {/* Header stripe */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-primary-500 to-cyan-500" />

                    {/* Top section: brand + INVOICE label */}
                    <div className="px-10 pt-10 pb-6 flex items-start justify-between border-b border-gray-100">
                        {/* Brand */}
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                                ShopFlow<span className="text-indigo-600">.</span>
                            </h1>
                            <p className="text-xs text-gray-400 mt-1">shopflow.com</p>
                        </div>

                        {/* Invoice meta */}
                        <div className="text-right">
                            <p className="text-3xl font-black text-gray-300 tracking-widest uppercase">Invoice</p>
                            <p className="text-sm text-gray-500 mt-1 font-medium">
                                Invoice No: <span className="font-bold text-gray-700">{receiptNo}</span>
                            </p>
                            {order.transactionId && (
                                <p className="text-xs text-gray-400 mt-0.5 font-mono">
                                    Txn: {order.transactionId}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Billed To + Invoice Date block */}
                    <div className="px-10 py-6 grid grid-cols-2 gap-8 border-b border-gray-100">
                        {/* Billed To */}
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Billed To</p>
                            <p className="text-base font-black text-gray-900 uppercase tracking-wide">
                                {order.user?.name || user?.name || 'Customer'}
                            </p>
                            <p className="text-sm text-indigo-600 font-medium mt-0.5">
                                {order.user?.email || user?.email || ''}
                            </p>
                            {order.shippingAddress && (
                                <div className="text-sm text-gray-500 mt-1 leading-relaxed">
                                    <p>{order.shippingAddress.address}</p>
                                    <p>{order.shippingAddress.city} — {order.shippingAddress.postalCode}</p>
                                </div>
                            )}
                        </div>

                        {/* Date + Status */}
                        <div className="text-right space-y-3">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Invoice Date</p>
                                <p className="text-sm font-bold text-indigo-600">{formatDate(order.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment Status</p>
                                {order.isPaid || order.paymentStatus === 'Paid' ? (
                                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide">
                                        <FiCheckCircle size={11} /> Paid
                                    </span>
                                ) : order.paymentMethod === 'COD' ? (
                                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide">
                                        Cash on Delivery
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide">
                                        Pending
                                    </span>
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment Method</p>
                                <p className="text-sm font-semibold text-gray-700">{order.paymentMethod || 'Online'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Items table */}
                    <div className="px-10 pt-6 pb-2">
                        {/* Table header */}
                        <div className="grid grid-cols-12 gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest pb-3 border-b border-gray-200">
                            <div className="col-span-5">Description</div>
                            <div className="col-span-2 text-center">Size</div>
                            <div className="col-span-1 text-center">Qty</div>
                            <div className="col-span-2 text-right">Unit Price</div>
                            <div className="col-span-2 text-right">Amount</div>
                        </div>

                        {/* Items */}
                        <div className="divide-y divide-gray-100">
                            {order.orderItems.map((item, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-2 py-4 items-center">
                                    <div className="col-span-5 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 p-1 flex-shrink-0">
                                            <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">{item.title}</p>
                                    </div>
                                    <div className="col-span-2 text-center text-sm text-gray-500">
                                        {item.size || '—'}
                                    </div>
                                    <div className="col-span-1 text-center text-sm font-semibold text-gray-700">
                                        {item.quantity}
                                    </div>
                                    <div className="col-span-2 text-right text-sm font-semibold text-indigo-600">
                                        {formatCurrency(item.price)}
                                    </div>
                                    <div className="col-span-2 text-right text-sm font-bold text-indigo-600">
                                        {formatCurrency(item.price * item.quantity)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="px-10 py-6 border-t border-gray-200">
                        <div className="ml-auto w-72 space-y-2">
                            {order.discountAmount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-600 font-medium">Discount ({order.couponCode})</span>
                                    <span className="text-green-600 font-bold">−{formatCurrency(order.discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Subtotal</span>
                                <span className="font-semibold text-indigo-600">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Shipping</span>
                                <span className="font-semibold text-indigo-600">{formatCurrency(shipping)}</span>
                            </div>
                            <div className="flex justify-between pt-3 border-t-2 border-gray-200">
                                <span className="text-base font-black text-gray-900">Total</span>
                                <span className="text-base font-black text-indigo-700">{formatCurrency(order.totalPrice)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer note */}
                    <div className="px-10 pb-8 pt-2 flex items-start justify-between">
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Receipt ID</p>
                            <p className="text-xs font-mono text-gray-600">{receiptNo}</p>
                            {order.transactionId && (
                                <>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 mt-3">Transaction ID</p>
                                    <p className="text-xs font-mono text-gray-600">{order.transactionId}</p>
                                </>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Purchase Date</p>
                            <p className="text-xs font-semibold text-gray-700">{formatDate(order.createdAt)}</p>
                            {order.paidAt && (
                                <>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 mt-2">Payment Date</p>
                                    <p className="text-xs font-semibold text-gray-700">{formatDate(order.paidAt)}</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Bottom stripe */}
                    <div className="px-10 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-xs text-gray-400">Thank you for shopping with ShopFlow! 🛍️</p>
                        <p className="text-xs text-gray-400">shopflow.com</p>
                    </div>
                </div>

                {/* Bottom action */}
                <div className="max-w-3xl mx-auto mt-6 text-center no-print">
                    <p className="text-xs text-gray-400">
                        Click <strong>Download PDF</strong> or <strong>Print</strong> to save your receipt. Use your browser's "Save as PDF" option when printing.
                    </p>
                </div>
            </div>
        </>
    );
};

export default Receipt;
