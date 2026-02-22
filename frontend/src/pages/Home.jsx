import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
        { name: 'Electronics', icon: <FiSmartphone />, color: 'bg-blue-100 text-blue-600' },
        { name: 'Clothing', icon: <FiShoppingBag />, color: 'bg-pink-100 text-pink-600' },
        { name: 'Furniture', icon: <FiMonitor />, color: 'bg-green-100 text-green-600' },
        { name: 'Sports', icon: <FiSpeaker />, color: 'bg-purple-100 text-purple-600' },
        { name: 'Beauty & Personal Care', icon: <FiCodesandbox />, color: 'bg-rose-100 text-rose-600' },
        { name: 'Books & Media', icon: <FiMonitor />, color: 'bg-amber-100 text-amber-600' },
    ];

    return (
        <div className="space-y-24 pb-24">
            {/* Hero Section */}
            <section className="relative h-[85vh] flex items-center bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop"
                        alt="Hero Background"
                        className="w-full h-full object-cover opacity-80"
                    />
                </div>

                <div className="container mx-auto px-4 z-10 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-2xl"
                    >
                        <span className="px-4 py-1 rounded-full border border-gray-700 bg-gray-800/50 backdrop-blur-sm text-gray-300 text-sm font-medium mb-6 inline-block">
                            New Summer Collection 2026
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-8">
                            Redefining <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">Modern Style.</span>
                        </h1>
                        <p className="text-lg text-gray-300 mb-10 leading-relaxed max-w-lg">
                            Discover a curated selection of premium products designed to elevate your lifestyle. Quality meets aesthetics in every piece.
                        </p>
                        <div className="flex space-x-4">
                            <Link to="/products" className="px-8 py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-primary-600/30 flex items-center gap-2 group">
                                Shop Now <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/sales" className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl font-bold text-lg hover:bg-white/20 transition-all">
                                View Sale
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Categories */}
            <section className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Browse by Category</h2>
                        <p className="text-gray-500">Find exactly what you're looking for</p>
                    </div>
                    <Link to="/products" className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1 group">
                        View All Categories <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                    {categories.map((cat, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary-100 transition-all cursor-pointer group"
                        >
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-6 ${cat.color} group-hover:scale-110 transition-transform`}>
                                {cat.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{cat.name}</h3>
                            <p className="text-sm text-gray-400">120+ Products</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Featured Products */}
            <section className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
                        <p className="text-gray-500">Handpicked selections just for you</p>
                    </div>
                    <Link to="/products" className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1 group">
                        View All Products <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="animate-pulse bg-white rounded-2xl p-4 border border-gray-100 h-[400px]">
                                <div className="bg-gray-200 h-64 rounded-xl mb-4 w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {products.slice(0, 4).map(product => (
                            <ProductCard key={product._id || product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>

            {/* Promo Section */}
            <section className="container mx-auto px-4">
                <div className="bg-primary-900 rounded-3xl p-12 md:p-24 relative overflow-hidden flex items-center">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-800 to-transparent skew-x-12 opacity-50" />
                    <div className="relative z-10 max-w-xl">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Upgrade Your Tech Game</h2>
                        <p className="text-primary-200 text-lg mb-8">Get up to 40% off on all premium electronics this week. Don't miss out on the latest gadgets.</p>
                        <button className="px-8 py-4 bg-white text-primary-900 rounded-xl font-bold hover:bg-gray-100 transition-colors">
                            Shop Electronics
                        </button>
                    </div>
                    <div className="hidden lg:block absolute right-20 top-1/2 -translate-y-1/2">
                        {/* Abstract shapes or image */}
                        <div className="w-64 h-64 bg-primary-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
