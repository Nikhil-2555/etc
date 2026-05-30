import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../services/api';
import { FiArrowRight, FiCodesandbox, FiMonitor, FiSmartphone, FiSpeaker, FiShoppingBag, FiStar } from 'react-icons/fi';

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
        { name: 'Electronics', icon: <FiSmartphone />, color: 'bg-blue-50 text-blue-500', shadow: 'hover:shadow-blue-100', slug: 'electronics' },
        { name: 'Clothing', icon: <FiShoppingBag />, color: 'bg-rose-50 text-rose-500', shadow: 'hover:shadow-rose-100', slug: 'clothing' },
        { name: 'Furniture', icon: <FiMonitor />, color: 'bg-amber-50 text-amber-500', shadow: 'hover:shadow-amber-100', slug: 'furniture' },
        { name: 'Sports', icon: <FiSpeaker />, color: 'bg-emerald-50 text-emerald-500', shadow: 'hover:shadow-emerald-100', slug: 'sports' },
        { name: 'Beauty & Care', icon: <FiStar />, color: 'bg-violet-50 text-violet-500', shadow: 'hover:shadow-violet-100', slug: 'beauty & personal care' },
        { name: 'Books & Media', icon: <FiCodesandbox />, color: 'bg-cyan-50 text-cyan-500', shadow: 'hover:shadow-cyan-100', slug: 'books & media' },
    ];

    return (
        <div className="min-h-screen bg-[#fafafc] dark:bg-gray-950 pb-24 font-sans selection:bg-primary-100 dark:selection:bg-primary-900/50 selection:text-primary-900 dark:selection:text-primary-100">
            {/* Hero Section */}
            <section className="relative px-4 pt-6 pb-12 sm:px-8 lg:px-12 xl:px-16 w-full max-w-[2400px] mx-auto">
                <div className="relative h-[85vh] min-h-[600px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-gray-200/50">
                    <img
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=75&auto=format&fit=crop"
                        alt="Hero Background"
                        fetchpriority="high"
                        width="1200"
                        height="800"
                        className="absolute inset-0 w-full h-full object-cover scale-105 transform origin-center animate-image-pan"
                        style={{ animation: 'pan 30s linear infinite alternate' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent" />
                    
                    <div className="relative h-full flex items-center">
                        <div className="w-full max-w-2xl px-8 md:px-16 lg:px-20 py-12">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-white/80 dark:border-gray-700/50 shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 mb-8">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                New Summer Collection 2026
                            </div>
                            
                            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-6">
                                Redefining <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-500 dark:from-primary-400 dark:to-indigo-400">
                                    Modern Style.
                                </span>
                            </h1>
                            
                            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-lg font-light">
                                Discover a curated selection of premium products designed to elevate your lifestyle. Where impeccable quality meets breathtaking aesthetics.
                            </p>
                            
                            <div className="flex flex-wrap gap-4">
                                <Link to="/products" className="px-8 py-4 bg-gray-900 dark:bg-primary-600 text-white rounded-2xl font-semibold text-lg hover:bg-gray-800 dark:hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2">
                                    Explore Collection <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link to="/sales" className="px-8 py-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700/50 rounded-2xl font-semibold text-lg hover:bg-white dark:hover:bg-gray-800 transition-all shadow-sm hover:shadow hover:-translate-y-0.5">
                                    View Sale
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="w-full max-w-[2400px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 mt-12 mb-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Curated Categories</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-light text-lg">Find exactly what you're looking for</p>
                    </div>
                    <Link to="/products" className="group inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 transition-colors">
                        View all categories 
                        <div className="w-8 h-8 rounded-full bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                            <FiArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {categories.map((cat, idx) => (
                        <Link key={idx} to={`/products?category=${encodeURIComponent(cat.slug)}`} className="group">
                            <div className={`p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-transparent dark:hover:border-transparent transition-all duration-300 shadow-sm hover:shadow-xl dark:hover:shadow-gray-900/50 ${cat.shadow} hover:-translate-y-1 flex flex-col items-center text-center h-full`}>
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5 transition-transform group-hover:scale-110 ${cat.color} dark:bg-opacity-20`}>
                                    {cat.icon}
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{cat.name}</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Explore &rarr;</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured Products */}
            <section className="w-full max-w-[2400px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 mb-24">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Trending Now</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-light text-lg">Handpicked selections just for you</p>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 h-[420px] shadow-sm">
                                <div className="bg-gray-100 dark:bg-gray-700 h-64 rounded-2xl mb-6 w-full"></div>
                                <div className="h-5 bg-gray-100 dark:bg-gray-700 rounded-md w-3/4 mb-3"></div>
                                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-md w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.slice(0, 4).map(product => (
                            <ProductCard key={product._id || product.id} product={product} />
                        ))}
                    </div>
                )}
            </section>

            {/* Promo Section */}
            <section className="w-full max-w-[2400px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
                <div className="relative rounded-[2.5rem] p-10 md:p-20 overflow-hidden shadow-2xl shadow-indigo-100 dark:shadow-none bg-white dark:bg-gray-800">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/10 dark:to-purple-900/20" />
                    
                    {/* Decorative blurred circles */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-blue-200/50 dark:bg-blue-900/30 blur-3xl" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-purple-200/50 dark:bg-purple-900/30 blur-3xl" />

                    <div className="relative z-10 max-w-2xl">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 leading-tight">
                            Upgrade Your <br className="hidden md:block" />
                            Tech Game
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 text-lg md:text-xl font-light mb-10 max-w-xl">
                            Get up to 40% off on all premium electronics this week. Don't miss out on the latest intelligent gadgets and lifestyle upgrades.
                        </p>
                        <Link to="/products?category=electronics" className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-semibold text-lg hover:bg-primary-600 transition-all shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 group">
                            Shop Electronics
                            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            <style>{`
                @keyframes pan {
                    0% { transform: scale(1.05) translate(0, 0); }
                    100% { transform: scale(1.1) translate(-2%, -1%); }
                }
            `}</style>
        </div>
    );
};

export default Home;
