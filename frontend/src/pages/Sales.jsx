import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../services/api';
import { FiCalendar, FiClock, FiTag, FiShoppingBag, FiStar, FiZap } from 'react-icons/fi';

const Sales = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Example sales data - you can fetch this from an API later
    const salesEvents = [
        {
            id: 1,
            title: "Great Indian Summer Sale",
            date: "June 15 - June 30",
            status: "Upcoming",
            description: "Get ready for the hottest deals of the season! Up to 50% off on summer essentials.",
            color: "from-orange-400 to-red-500",
            icon: <FiZap />
        },
        {
            id: 2,
            title: "Independence Day Sale",
            date: "August 10 - August 15",
            status: "Upcoming",
            description: "Celebrate freedom with amazing discounts on electronics and fashion.",
            color: "from-blue-400 to-cyan-500",
            icon: <FiShoppingBag />
        },
        {
            id: 3,
            title: "Diwali Dhamaka Sale",
            date: "October 20 - November 5",
            status: "Upcoming",
            description: "Celebrate the Festival of Lights with sparkling offers! Huge savings on gifts, ethnic wear, and more.",
            color: "from-yellow-400 to-amber-500",
            icon: <FiStar />
        },
        {
            id: 4,
            title: "Christmas & New Year Sale",
            date: "December 20 - January 5",
            status: "Upcoming",
            description: "End the year with a bang! Clear out sale on winter collections and holiday gifts.",
            color: "from-indigo-400 to-purple-500",
            icon: <FiCalendar />
        }
    ];

    const activeSale = {
        title: "Holi Festival Sale",
        date: "Live Now!",
        endsIn: "2 Days",
        description: "Colors of joy, colors of savings! Grab exclusive deals this Holi."
    };

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await fetchProducts();
                // Filter products on sale 
                const saleProducts = data.filter(product => product.onSale || product.discount > 0);
                setProducts(saleProducts);
            } catch (error) {
                console.error("Failed to load products", error);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Banner for Active Sale */}
            <div className="bg-gray-900 border-b border-gray-800 text-white py-16 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-500 via-gray-900 to-gray-900"></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-red-500/20 border border-red-500 text-red-400 text-sm font-bold mb-6 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            LIVE NOW: {activeSale.title}
                        </span>

                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
                            Exclusive Deals
                        </h1>

                        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                            {activeSale.description} Ends in <span className="text-white font-bold">{activeSale.endsIn}</span>.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">

                {/* Upcoming Sales List */}
                <div className="mb-20">
                    <div className="flex items-center gap-3 mb-8">
                        <FiCalendar className="text-3xl text-primary-600" />
                        <h2 className="text-3xl font-bold text-gray-900">Upcoming Sales Calendar</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {salesEvents.map((sale, index) => (
                            <motion.div
                                key={sale.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${sale.color} opacity-10 rounded-bl-full group-hover:scale-110 transition-transform`}></div>

                                <div className="flex items-start justify-between relative z-10">
                                    <div>
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sale.color} flex items-center justify-center text-white text-xl mb-4 shadow-lg`}>
                                            {sale.icon}
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                                            {sale.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-gray-500 font-medium mb-4">
                                            <FiClock className="text-primary-500" />
                                            {sale.date}
                                        </div>
                                        <p className="text-gray-600 leading-relaxed">
                                            {sale.description}
                                        </p>
                                    </div>
                                    <span className="hidden sm:inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                                        {sale.status}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Products On Sale Section */}
                <div className="border-t border-gray-200 pt-16">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop Current Deals</h2>
                            <p className="text-gray-500">Don't wait for the next big sale, grab these offers now!</p>
                        </div>
                        <Link to="/products" className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1 group">
                            View All <FiTag className="group-hover:rotate-12 transition-transform" />
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
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {products.slice(0, 8).map(product => (
                                <ProductCard key={product._id || product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
                            <FiTag className="text-6xl text-gray-300 mx-auto mb-4" />
                            <p className="text-xl text-gray-500">No specific products on sale today.</p>
                            <p className="text-gray-400 mb-6">Check out our full catalog for everyday low prices.</p>
                            <Link
                                to="/products"
                                className="inline-block px-8 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-primary-600/30"
                            >
                                Browse All Products
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sales;
