import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../services/api';
import { FiArrowRight, FiCodesandbox, FiMonitor, FiSmartphone, FiSpeaker, FiShoppingBag } from 'react-icons/fi';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await fetchProducts();
                setProducts(data);
            } catch (error) {
                console.error("Failed to load products", error);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    const categories = [
        { name: 'Electronics', icon: <FiSmartphone />, color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400', slug: 'electronics' },
        { name: 'Clothing', icon: <FiShoppingBag />, color: 'bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400', slug: 'clothing' },
        { name: 'Furniture', icon: <FiMonitor />, color: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400', slug: 'furniture' },
        { name: 'Sports', icon: <FiSpeaker />, color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400', slug: 'sports' },
        { name: 'Beauty & Personal Care', icon: <FiCodesandbox />, color: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400', slug: 'beauty & personal care' },
        { name: 'Books & Media', icon: <FiMonitor />, color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', slug: 'books & media' },
    ];

    return (
        <div className="space-y-20 pb-20">
            {/* Hero Section */}
            <section className="relative h-[80vh] flex items-center bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop"
                        alt="Hero Background"
                        className="w-full h-full object-cover opacity-70"
                    />
                </div>

                <div className="container mx-auto px-4 z-10 relative">
                    <div className="max-w-2xl">
                        <span className="px-4 py-1.5 rounded-full border border-gray-600 bg-gray-800/80 text-gray-300 text-sm font-medium mb-6 inline-block">
                            New Summer Collection 2026
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
                            Redefining <br />
                            <span className="text-primary-400">Modern Style.</span>
                        </h1>
                        <p className="text-lg text-gray-300 mb-10 leading-relaxed max-w-lg">
                            Discover a curated selection of premium products designed to elevate your lifestyle. Quality meets aesthetics in every piece.
                        </p>
                        <div className="flex space-x-4">
                            <Link to="/products" className="px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg hover:bg-primary-700 transition-colors flex items-center gap-2">
                                Shop Now <FiArrowRight />
                            </Link>
                            <Link to="/sales" className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-xl font-semibold text-lg hover:bg-white/20 transition-colors">
                                View Sale
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Browse by Category</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Find exactly what you're looking for</p>
                    </div>
                    <Link to="/products" className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 flex items-center gap-1 text-sm">
                        View All <FiArrowRight size={14} />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                    {categories.map((cat, idx) => (
                        <Link key={idx} to={`/products?category=${encodeURIComponent(cat.slug)}`}>
                            <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-md transition-all cursor-pointer group">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 ${cat.color}`}>
                                    {cat.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-0.5">{cat.name}</h3>
                                <p className="text-sm text-gray-400 dark:text-gray-500">120+ Products</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured Products */}
            <section className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Featured Products</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Handpicked selections just for you</p>
                    </div>
                    <Link to="/products" className="text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 flex items-center gap-1 text-sm">
                        View All <FiArrowRight size={14} />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 h-[380px]">
                                <div className="bg-gray-100 dark:bg-gray-700 h-60 rounded-lg mb-4 w-full"></div>
                                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.slice(0, 4).map(product => (
                            <ProductCard key={product._id || product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>

            {/* Promo Section */}
            <section className="container mx-auto px-4">
                <div className="bg-gray-900 rounded-2xl p-10 md:p-16 relative overflow-hidden">
                    <div className="relative z-10 max-w-xl">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Upgrade Your Tech Game</h2>
                        <p className="text-gray-400 text-base mb-8">Get up to 40% off on all premium electronics this week. Don't miss out on the latest gadgets.</p>
                        <Link to="/products?category=electronics" className="inline-block px-8 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                            Shop Electronics
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
