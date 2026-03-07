import React from 'react';
import { useCompare } from '../context/CompareContext';
import { Link } from 'react-router-dom';

const Compare = () => {
    const { compareItems, removeFromCompare, clearCompare } = useCompare();

    if (compareItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold mb-4 dark:text-white">Compare Products</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">You have no items in your comparison list.</p>
                <Link to="/products" className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition">
                    Browse Products
                </Link>
            </div>
        );
    }

    // Get all unique specs keys
    const allSpecsKeys = new Set();
    compareItems.forEach((product) => {
        if (product.specs) {
            Object.keys(product.specs).forEach((key) => allSpecsKeys.add(key));
        }
    });

    const specsList = Array.from(allSpecsKeys);

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold dark:text-white">Compare Products</h1>
                <button
                    onClick={clearCompare}
                    className="text-red-500 hover:text-red-700 bg-red-100 dark:bg-red-900/30 px-4 py-2 rounded-md transition"
                >
                    Clear All
                </button>
            </div>

            <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full text-left bg-white dark:bg-gray-800">
                    <thead>
                        <tr>
                            <th className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 w-1/5">
                                Features
                            </th>
                            {compareItems.map((product) => (
                                <th key={product._id} className="p-4 border-b border-gray-200 dark:border-gray-700 text-center w-1/5 min-w-[200px]">
                                    <div className="relative inline-block">
                                        <img
                                            src={product.image || 'https://placehold.co/400?text=No+Image'}
                                            alt={product.title}
                                            className="w-32 h-32 object-cover mx-auto rounded-md mb-4"
                                        />
                                        <button
                                            onClick={() => removeFromCompare(product._id)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 shadow-md"
                                            title="Remove"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-2">{product.title}</h3>
                                    <p className="text-indigo-600 dark:text-indigo-400 font-bold mt-2">₹{product.price?.toLocaleString('en-IN')}</p>
                                    <Link
                                        to={`/products/${product._id}`}
                                        className="inline-block mt-4 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-4 py-1.5 rounded text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
                                    >
                                        View Details
                                    </Link>
                                </th>
                            ))}
                            {/* Fill remaining columns if less than 4 items */}
                            {Array.from({ length: 4 - compareItems.length }).map((_, index) => (
                                <th key={`empty-${index}`} className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 w-1/5">
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
                                        <div className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg mb-2 flex items-center justify-center">
                                            <span className="text-2xl">+</span>
                                        </div>
                                        <p className="text-sm">Add Product</p>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        <tr>
                            <td className="p-4 font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900">Brand</td>
                            {compareItems.map((product) => (
                                <td key={product._id} className="p-4 text-center text-gray-600 dark:text-gray-400">
                                    {product.brand || 'N/A'}
                                </td>
                            ))}
                            {Array.from({ length: 4 - compareItems.length }).map((_, index) => (
                                <td key={`empty-brand-${index}`} className="p-4 bg-gray-50/50 dark:bg-gray-800/50"></td>
                            ))}
                        </tr>
                        <tr>
                            <td className="p-4 font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900">Category</td>
                            {compareItems.map((product) => (
                                <td key={product._id} className="p-4 text-center text-gray-600 dark:text-gray-400">
                                    {product.category || 'N/A'}
                                </td>
                            ))}
                            {Array.from({ length: 4 - compareItems.length }).map((_, index) => (
                                <td key={`empty-category-${index}`} className="p-4 bg-gray-50/50 dark:bg-gray-800/50"></td>
                            ))}
                        </tr>
                        <tr>
                            <td className="p-4 font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900">Rating</td>
                            {compareItems.map((product) => (
                                <td key={product._id} className="p-4 text-center text-gray-600 dark:text-gray-400">
                                    {product.rating?.rate ? `${product.rating.rate.toFixed(1)} / 5 (${product.rating.count || 0} reviews)` : 'No ratings'}
                                </td>
                            ))}
                            {Array.from({ length: 4 - compareItems.length }).map((_, index) => (
                                <td key={`empty-rating-${index}`} className="p-4 bg-gray-50/50 dark:bg-gray-800/50"></td>
                            ))}
                        </tr>
                        <tr>
                            <td className="p-4 font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900">Stock Status</td>
                            {compareItems.map((product) => (
                                <td key={product._id} className="p-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.countInStock > 0 || product.countInStock === undefined ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                                        {product.countInStock > 0 || product.countInStock === undefined ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </td>
                            ))}
                            {Array.from({ length: 4 - compareItems.length }).map((_, index) => (
                                <td key={`empty-stock-${index}`} className="p-4 bg-gray-50/50 dark:bg-gray-800/50"></td>
                            ))}
                        </tr>
                        <tr>
                            <td className="p-4 font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900">Description</td>
                            {compareItems.map((product) => (
                                <td key={product._id} className="p-4 text-sm text-gray-600 dark:text-gray-400 align-top max-w-xs">
                                    <p className="line-clamp-4">{product.description || 'N/A'}</p>
                                </td>
                            ))}
                            {Array.from({ length: 4 - compareItems.length }).map((_, index) => (
                                <td key={`empty-desc-${index}`} className="p-4 bg-gray-50/50 dark:bg-gray-800/50"></td>
                            ))}
                        </tr>
                        {/* Dynamic Specs */}
                        {specsList.map((specKey) => (
                            <tr key={specKey}>
                                <td className="p-4 font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 capitalize">
                                    {specKey.replace(/([A-Z])/g, ' $1').trim()}
                                </td>
                                {compareItems.map((product) => (
                                    <td key={product._id} className="p-4 text-center text-sm text-gray-600 dark:text-gray-400">
                                        {product.specs && product.specs[specKey] !== undefined ? product.specs[specKey].toString() : 'N/A'}
                                    </td>
                                ))}
                                {Array.from({ length: 4 - compareItems.length }).map((_, index) => (
                                    <td key={`empty-${specKey}-${index}`} className="p-4 bg-gray-50/50 dark:bg-gray-800/50"></td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Compare;
