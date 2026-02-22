import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';
import { FiArrowRight } from 'react-icons/fi';
import { createOrder } from '../services/api';

const Checkout = () => {
    const { cart, totalPrice, clearCart } = useCart();
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            email: '',
            address: '',
            city: '',
            postalCode: '',
        },
        onSubmit: async (values) => {
            try {
                const orderData = {
                    orderItems: cart,
                    shippingAddress: {
                        address: values.address,
                        city: values.city,
                        postalCode: values.postalCode,
                        country: 'India'
                    },
                    paymentMethod: 'Pending',
                    totalPrice: totalPrice + 100
                };

                const createdOrder = await createOrder(orderData);
                toast.success('Shipping details saved! Please complete payment.');
                // Clear cart and redirect to payment
                navigate(`/payment?orderId=${createdOrder._id}&amount=${totalPrice + 100}`);
                clearCart();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to create order');
            }
        }
    });

    if (cart.length === 0) {
        return <div className="text-center py-20 font-bold text-gray-500">Your cart is empty. Please add items to checkout.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

            <div className="flex flex-col lg:flex-row gap-12">
                <div className="flex-1 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold">1</span>
                        Shipping Information
                    </h2>

                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    onChange={formik.handleChange}
                                    value={formik.values.firstName}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    onChange={formik.handleChange}
                                    value={formik.values.lastName}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                onChange={formik.handleChange}
                                value={formik.values.email}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                            <input
                                type="text"
                                name="address"
                                onChange={formik.handleChange}
                                value={formik.values.address}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    onChange={formik.handleChange}
                                    value={formik.values.city}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    onChange={formik.handleChange}
                                    value={formik.values.postalCode}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary-600 text-white rounded-xl py-4 font-bold text-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-primary-600/30 flex items-center justify-center gap-2 active:scale-95 mt-8"
                        >
                            Continue to Payment <FiArrowRight />
                        </button>
                    </form>
                </div>

                {/* Order Summary Side */}
                <div className="w-full lg:w-96 bg-gray-50 rounded-2xl p-8 h-fit border border-gray-100 sticky top-24">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Your Order</h3>
                    <div className="space-y-4 mb-6">
                        {cart.map(item => (
                            <div key={`${item.id || item._id}-${item.size}`} className="flex gap-4">
                                <div className="w-16 h-16 bg-white rounded-lg border border-gray-100 p-1 flex-shrink-0">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.title}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                        {item.size && (
                                            <>
                                                <span className="text-gray-300 text-[10px]">•</span>
                                                <p className="text-xs font-bold text-primary-600">Size: {item.size}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Shipping</span>
                            <span>₹100</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg text-gray-900 mt-4 pt-4 border-t border-gray-200">
                            <span>Total</span>
                            <span className="text-primary-600">₹{(totalPrice + 100).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
