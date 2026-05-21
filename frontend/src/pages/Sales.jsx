import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../services/api';
import { FiCalendar, FiClock, FiTag, FiShoppingBag, FiStar, FiZap } from 'react-icons/fi';

const Sales = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const salesEvents = [
        {
            id: 1,
            title: "Great Indian Summer Sale",
            date: "June 15 - June 30",
            status: "Upcoming",
            description: "Get ready for the hottest deals of the season! Up to 50% off on summer essentials.",
            accent: "bg-orange-50 text-orange-600 border-orange-100",
            icon: <FiZap />
        },
        {
            id: 2,
            title: "Independence Day Sale",
            date: "August 10 - August 15",
            status: "Upcoming",
            description: "Celebrate freedom with amazing discounts on electronics and fashion.",
            accent: "bg-blue-50 text-blue-600 border-blue-100",
            icon: <FiShoppingBag />
        },
        {
            id: 3,
            title: "Diwali Dhamaka Sale",
            date: "October 20 - November 5",
            status: "Upcoming",
            description: "Celebrate the Festival of Lights with sparkling offers! Huge savings on gifts, ethnic wear, and more.",
            accent: "bg-amber-50 text-amber-600 border-amber-100",
            icon: <FiStar />
        },
        {
            id: 4,
            title: "Christmas & New Year Sale",
            date: "December 20 - January 5",
            status: "Upcoming",
            description: "End the year with a bang! Clear out sale on winter collections and holiday gifts.",
            accent: "bg-purple-50 text-purple-600 border-purple-100",
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
                const saleProducts = data.filter(product => product.originalPrice && product.originalPrice > product.price);
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
            {/* Hero Banner */}
            <div className="bg-gray-900 text-white py-14">
                <div className="container mx-auto px-4 text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-sm font-semibold mb-6">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        LIVE NOW: {activeSale.title}
                    </span>

                    <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
                        Exclusive Deals
                    </h1>

                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        {activeSale.description} Ends in <span className="text-white font-semibold">{activeSale.endsIn}</span>.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">

                {/* Upcoming Sales */}
                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-8">
                        <FiCalendar className="text-2xl text-primary-600" />
                        <h2 className="text-2xl font-bold text-gray-900">Upcoming Sales Calendar</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {salesEvents.map((sale) => (
                            <div
                                key={sale.id}
                                className="bg-white rounded-xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg mb-3 ${sale.accent.split(' ').slice(0, 2).join(' ')}`}>
                                            {sale.icon}
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                                            {sale.title}
                                        </h3>
                                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-3">
                                            <FiClock className="text-primary-500" size={14} />
                                            {sale.date}
                                        </div>
                                        <p className="text-gray-500 text-sm leading-relaxed">
                                            {sale.description}
                                        </p>
                                    </div>
                                    <span className="hidden sm:inline-block px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-xs font-medium border border-gray-100">
                                        {sale.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Products On Sale */}
                <div className="border-t border-gray-200 pt-12">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">Shop Current Deals</h2>
                            <p className="text-gray-500 text-sm">Don't wait for the next big sale, grab these offers now!</p>
                        </div>
                        <Link to="/products" className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1 text-sm">
                            View All <FiTag size={14} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="animate-pulse bg-white rounded-xl p-4 border border-gray-100 h-[380px]">
                                    <div className="bg-gray-100 h-60 rounded-lg mb-4 w-full"></div>
                                    <div className="h-4 bg-gray-100 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.slice(0, 8).map(product => (
                                <ProductCard key={product._id || product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
                            <FiTag className="text-5xl text-gray-300 mx-auto mb-4" />
                            <p className="text-lg text-gray-500">No specific products on sale today.</p>
                            <p className="text-gray-400 text-sm mb-6">Check out our full catalog for everyday low prices.</p>
                            <Link
                                to="/products"
                                className="inline-block px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors"
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
