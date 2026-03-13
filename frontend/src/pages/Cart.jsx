import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiTrash2, FiMinus, FiPlus, FiArrowLeft, FiArrowRight, FiShoppingCart, FiShield } from 'react-icons/fi';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();

    if (cart.length === 0) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                    <FiShoppingCart size={40} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Your cart is empty</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">Looks like you haven't added anything to your cart yet. Browse our products to find something you love.</p>
                <Link to="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg hover:shadow-primary-600/30">
                    <FiArrowLeft /> Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Shopping Cart ({totalItems} items)</h1>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Cart Items */}
                <div className="flex-1 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Product</th>
                                    <th className="px-6 py-4 font-medium text-center">Quantity</th>
                                    <th className="px-6 py-4 font-medium text-right">Price</th>
                                    <th className="px-6 py-4 font-medium text-right">Total</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {cart.map(item => {
                                    const itemId = item._id || item.id;
                                    return (
                                        <tr key={`${itemId}-${item.size}`} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 p-2 flex-shrink-0">
                                                        <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 max-w-[150px] md:max-w-xs">{item.title}</h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <p className="text-sm text-gray-500">{item.category}</p>
                                                            {item.size && (
                                                                <>
                                                                    <span className="text-gray-300">•</span>
                                                                    <span className="text-sm font-bold text-primary-600 bg-primary-50 px-2 rounded">Size: {item.size}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center border border-gray-200 rounded-lg w-fit mx-auto bg-white">
                                                    <button
                                                        onClick={() => updateQuantity(itemId, item.size, Math.max(1, item.quantity - 1))}
                                                        className="p-2 hover:bg-gray-50 text-gray-500 transition-colors"
                                                    >
                                                        <FiMinus size={14} />
                                                    </button>
                                                    <span className="px-3 font-medium text-gray-900 text-sm w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(itemId, item.size, item.quantity + 1)}
                                                        className="p-2 hover:bg-gray-50 text-gray-500 transition-colors"
                                                    >
                                                        <FiPlus size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-gray-900 dark:text-white">₹{item.price.toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-4 text-right font-bold text-primary-600">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => removeFromCart(itemId, item.size)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <button onClick={clearCart} className="text-red-500 text-sm font-medium hover:underline">Clear Cart</button>
                        <Link to="/products" className="text-primary-600 font-medium hover:underline flex items-center gap-1">
                            Continue Shopping <FiArrowRight />
                        </Link>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 h-fit sticky top-24">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h3>

                    <div className="space-y-4 mb-6 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span className="font-medium text-gray-900 dark:text-white">₹{totalPrice.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Shipping estimate</span>
                            <span className="font-medium text-gray-900 dark:text-white">₹100</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Tax estimate (18% GST)</span>
                            <span className="font-medium text-gray-900 dark:text-white">₹{(totalPrice * 0.18).toLocaleString('en-IN')}</span>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6 mb-8">
                        <div className="flex justify-between items-end">
                            <span className="font-bold text-lg text-gray-900 dark:text-white">Order Total</span>
                            <span className="font-bold text-2xl text-primary-600">₹{(totalPrice + 100 + totalPrice * 0.18).toLocaleString('en-IN')}</span>
                        </div>
                    </div>

                    <Link to="/checkout" className="w-full bg-gray-900 text-white rounded-xl py-4 font-bold text-lg hover:bg-primary-600 transition-all shadow-lg flex items-center justify-center gap-2 group">
                        Checkout <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                            <FiShield /> Secure Checkout
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
