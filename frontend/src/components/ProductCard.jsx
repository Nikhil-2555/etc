import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { FiShoppingCart, FiStar, FiHeart } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const navigate = useNavigate();

    const handleAddToCart = (e) => {
        e.preventDefault();
        const productId = product._id || product.id;
        if (product.sizes && product.sizes.length > 0) {
            navigate(`/products/${productId}`);
            return;
        }
        addToCart({ ...product, quantity: 1 });
        toast.success(`${product.title} added to cart!`);
    };

    const handleToggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const productId = product._id || product.id;
        if (isInWishlist(productId)) {
            removeFromWishlist(productId);
        } else {
            addToWishlist(product);
        }
    };

    return (
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 relative">
            <Link to={`/products/${product._id || product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-50">
                <img
                    src={product.image}
                    alt={product.title}
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?w=800'; // Modern neutral product placeholder
                    }}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 will-change-transform"
                />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                        onClick={handleToggleWishlist}
                        className={`p-2 rounded-full shadow-md transition-colors ${isInWishlist(product._id || product.id) ? 'bg-red-50 text-red-500' : 'bg-white text-gray-500 hover:text-red-500'}`}
                    >
                        <FiHeart size={18} fill={isInWishlist(product._id || product.id) ? "currentColor" : "none"} />
                    </button>
                </div>
            </Link>

            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <span className="text-xs uppercase tracking-wider text-primary-600 font-semibold mb-1 block">{product.category}</span>
                        <Link to={`/products/${product._id || product.id}`} className="block">
                            <h3 className="text-lg font-medium text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">{product.title}</h3>
                        </Link>
                    </div>
                    <div className="flex items-center space-x-1 text-amber-400 bg-amber-50 px-2 py-1 rounded-md">
                        <FiStar size={14} fill="currentColor" />
                        <span className="text-xs font-bold text-amber-700">{product.rating?.rate || 0}</span>
                    </div>
                </div>

                <div className="flex justify-between items-end mt-4">
                    <div>
                        <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
                        <span className="text-sm text-gray-400 line-through ml-2">₹{(product.price * 1.2).toLocaleString('en-IN')}</span>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className="bg-gray-900 text-white p-3 rounded-xl hover:bg-primary-600 active:scale-95 transition-all shadow-md hover:shadow-lg flex items-center justify-center group/btn min-w-[3rem]"
                    >
                        <FiShoppingCart size={20} className={`${product.sizes && product.sizes.length > 0 ? 'hidden' : 'group-hover/btn:hidden'}`} />
                        <span className={`${product.sizes && product.sizes.length > 0 ? 'inline' : 'hidden group-hover/btn:inline'} text-sm font-medium px-2 whitespace-nowrap`}>
                            {product.sizes && product.sizes.length > 0 ? 'Select Size' : 'Add'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
