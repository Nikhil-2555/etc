import { Link } from 'react-router-dom';
import { FiHome, FiShoppingBag, FiSearch } from 'react-icons/fi';

const NotFound = () => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
            <div className="text-center max-w-lg">
                {/* 404 Number */}
                <div className="relative mb-8">
                    <h1 className="text-[8rem] font-extrabold text-gray-100 dark:text-gray-800 leading-none select-none">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                            <FiSearch className="text-primary-600 dark:text-primary-400" size={36} />
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Page Not Found
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-base">
                    Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors"
                    >
                        <FiHome size={18} /> Go Home
                    </Link>
                    <Link
                        to="/products"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <FiShoppingBag size={18} /> Browse Products
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
