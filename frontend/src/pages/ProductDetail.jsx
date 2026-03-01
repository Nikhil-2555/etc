import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductById, getSmartRecommendations } from '../services/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { FiStar, FiTruck, FiShield, FiRotateCcw, FiPlus, FiMinus, FiShoppingCart, FiCpu } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [recsLoading, setRecsLoading] = useState(true);
    const [recsAIPowered, setRecsAIPowered] = useState(false);
    const { addToCart, cart } = useCart();
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

    useEffect(() => {
        const loadProduct = async () => {
            try {
                const data = await fetchProductById(id);
                setProduct(data);
            } catch (error) {
                console.error("Failed to load product", error);
            } finally {
                setLoading(false);
            }
        };
        loadProduct();
    }, [id]);

    // Fetch AI recommendations
    useEffect(() => {
        const loadRecommendations = async () => {
            setRecsLoading(true);
            try {
                const data = await getSmartRecommendations(id, cart);
                setRecommendations(data.recommendations || []);
                setRecsAIPowered(data.aiPowered || false);
            } catch (error) {
                console.error('Failed to load recommendations', error);
            } finally {
                setRecsLoading(false);
            }
        };
        if (id) loadRecommendations();
    }, [id]);

    const handleAddToCart = () => {
        if (product.sizes && product.sizes.length > 0 && !selectedSize) {
            toast.error('Please select a size');
            return;
        }
        addToCart({ ...product, quantity, size: selectedSize });
        toast.success('Added to cart!');
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    if (!product) return <div className="text-center py-20 text-gray-500">Product not found</div>;

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="aspect-square bg-white dark:bg-gray-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-700 flex items-center justify-center p-8 group relative">
                        <img src={product.image} alt={product.title} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Sale</div>
                    </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-col justify-center">
                    <nav className="text-sm text-gray-500 mb-4 flex items-center space-x-2">
                        <Link to="/" className="hover:text-primary-600">Home</Link>
                        <span>/</span>
                        <Link to="/products" className="hover:text-primary-600">Products</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.title}</span>
                    </nav>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">{product.title}</h1>

                    <div className="flex items-center space-x-4 mb-6">
                        <div className="flex items-center text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-lg">
                            <FiStar className="fill-current" />
                            <span className="ml-1 font-bold text-amber-700">{product?.rating?.rate || 0}</span>
                            <span className="text-gray-400 text-sm ml-1">({product?.rating?.count || 0} reviews)</span>
                        </div>
                        <span className="text-green-600 text-sm font-medium bg-green-50 px-3 py-1 rounded-lg">In Stock</span>
                    </div>

                    <div className="mb-8">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">₹{product.price.toLocaleString('en-IN')}</span>
                        <span className="text-lg text-gray-400 dark:text-gray-500 line-through ml-3 font-medium">₹{(product.price * 1.2).toLocaleString('en-IN')}</span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-lg">
                        {product.description} This premium product is designed to meet your highest expectations. Crafted with precision and care, it offers durability, style, and functionality in one package.
                    </p>

                    {product.sizes && product.sizes.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Select Size</h3>
                            <div className="flex flex-wrap gap-3">
                                {product.sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-4 h-14 rounded-xl flex items-center justify-center font-bold transition-all border-2 ${selectedSize === size
                                            ? 'border-primary-600 bg-primary-50 text-primary-600 shadow-md transform scale-105'
                                            : 'border-gray-100 bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center space-x-6 mb-8 border-t border-b border-gray-100 dark:border-gray-700 py-6">
                        <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="px-4 py-3 hover:bg-gray-50 text-gray-500 transition-colors"
                            >
                                <FiMinus />
                            </button>
                            <span className="px-4 py-3 font-medium text-gray-900 dark:text-white w-12 text-center">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="px-4 py-3 hover:bg-gray-50 text-gray-500 transition-colors"
                            >
                                <FiPlus />
                            </button>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            className="flex-1 bg-primary-600 text-white px-8 py-4 rounded-xl hover:bg-primary-700 flex items-center justify-center gap-2 font-bold text-lg shadow-lg hover:shadow-primary-600/30 transition-all active:scale-95"
                        >
                            <FiShoppingCart /> Add to Cart
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <FiTruck className="text-primary-600 text-xl" />
                            <div>
                                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Free Delivery</h4>
                                <p className="text-xs text-gray-500">Orders over ₹500</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <FiShield className="text-primary-600 text-xl" />
                            <div>
                                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Secure Payment</h4>
                                <p className="text-xs text-gray-500">100% protected</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI-Powered Recommendations */}
            {(recommendations.length > 0 || recsLoading) && (
                <section className="mt-20 border-t border-gray-100 dark:border-gray-700 pt-16">
                    <div className="flex items-center gap-3 mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">You Might Also Like</h2>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${recsAIPowered
                                ? 'bg-gradient-to-r from-primary-100 to-purple-100 dark:from-primary-900/40 dark:to-purple-900/40 text-primary-700 dark:text-primary-300'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                            }`}>
                            <FiCpu size={12} />
                            {recsAIPowered ? 'AI Powered' : 'Similar'}
                        </span>
                    </div>

                    {recsLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 h-80">
                                    <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-t-2xl" />
                                    <div className="p-4 space-y-3">
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {recommendations.map(rec => (
                                <ProductCard key={rec._id || rec.id} product={rec} />
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
};

export default ProductDetail;
