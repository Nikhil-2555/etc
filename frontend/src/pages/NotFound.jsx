import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiShoppingBag, FiSearch } from 'react-icons/fi';

const NotFound = () => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-lg"
            >
                {/* Animated 404 Number */}
                <div className="relative mb-8">
                    <h1 className="text-[10rem] font-extrabold text-gray-100 dark:text-gray-800 leading-none select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                            <FiSearch className="text-primary-600 dark:text-primary-400" size={40} />
                        </div>
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Page Not Found
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-10 text-lg">
                    Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-primary-600/30"
                    >
                        <FiHome size={20} /> Go Home
                    </Link>
                    <Link
                        to="/products"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                    >
                        <FiShoppingBag size={20} /> Browse Products
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default NotFound;
