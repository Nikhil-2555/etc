import { useNavigate, Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { FiHeart, FiTrash2, FiShoppingCart, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Wishlist = () => {
    const { wishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const handleAddToCart = (product) => {
        if (product.sizes && product.sizes.length > 0) {
            navigate(`/products/${product._id || product.id}`);
            return;
        }
        addToCart({ ...product, quantity: 1 });
        toast.success(`${product.title} added to cart!`);
    };

    if (wishlist.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 text-gray-300 dark:text-gray-600">
                    <FiHeart size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-center max-w-md">Looks like you haven't added anything to your wishlist yet. Explore our products and find something you love!</p>
                <Link to="/products" className="px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-900 dark:text-white">
                    <FiArrowLeft size={24} />
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Wishlist ({wishlist.length})</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {wishlist.map((product) => (
                    <div key={product._id || product.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all group">
                        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-700 mb-4">
                            <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <button
                                onClick={() => removeFromWishlist(product._id || product.id)}
                                className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-800 rounded-full text-red-500 shadow-sm hover:bg-red-50 dark:hover:bg-gray-700 transition-colors z-10"
                                title="Remove from wishlist"
                            >
                                <FiTrash2 size={18} />
                            </button>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide mb-1">{product.category}</p>
                            <Link to={`/products/${product._id || product.id}`} className="block">
                                <h3 className="text-gray-900 dark:text-white font-medium line-clamp-1 mb-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{product.title}</h3>
                            </Link>

                            <div className="flex items-end justify-between mt-4">
                                <div>
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">₹{product.price.toLocaleString('en-IN')}</span>
                                </div>
                                <button
                                    onClick={() => handleAddToCart(product)}
                                    className="p-3 bg-gray-900 dark:bg-primary-600 text-white rounded-xl hover:bg-primary-600 dark:hover:bg-primary-700 transition-colors shadow-md active:scale-95"
                                    title="Add to Cart"
                                >
                                    <FiShoppingCart size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wishlist;
