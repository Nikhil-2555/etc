import React, { useState } from 'react';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import {
    FiX, FiShoppingCart, FiStar, FiTruck, FiShield, FiPackage,
    FiLayers, FiArrowRight, FiCheck, FiMinus, FiHeart, FiPlus,
    FiChevronDown, FiChevronUp, FiAward, FiZap, FiEye, FiTrash2
} from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';

const Compare = () => {
    const { compareItems, removeFromCompare, clearCompare } = useCompare();
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const navigate = useNavigate();
    const [expandedSections, setExpandedSections] = useState({
        pricing: true,
        details: true,
        specs: true,
        availability: true,
    });
    const [highlightDifferences, setHighlightDifferences] = useState(false);

    const toggleSection = (key) => {
        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Find best value helpers
    const findLowestPrice = () => {
        if (compareItems.length === 0) return null;
        return compareItems.reduce((min, item) => item.price < min.price ? item : min, compareItems[0]);
    };

    const findHighestRating = () => {
        if (compareItems.length === 0) return null;
        return compareItems.reduce((max, item) =>
            (item.rating?.rate || 0) > (max.rating?.rate || 0) ? item : max, compareItems[0]);
    };

    const lowestPrice = findLowestPrice();
    const highestRated = findHighestRating();

    // Get all unique specs keys
    const allSpecsKeys = new Set();
    compareItems.forEach((product) => {
        if (product.specs) {
            Object.keys(product.specs).forEach((key) => allSpecsKeys.add(key));
        }
    });
    const specsList = Array.from(allSpecsKeys);

    const handleAddToCart = (product) => {
        if (product.sizes && product.sizes.length > 0) {
            navigate(`/products/${product._id || product.id}`);
            return;
        }
        addToCart({ ...product, quantity: 1 });
        toast.success(`${product.title} added to cart!`);
    };

    const handleToggleWishlist = (product) => {
        const productId = product._id || product.id;
        if (isInWishlist(productId)) {
            removeFromWishlist(productId);
        } else {
            addToWishlist(product);
        }
    };

    const formatPrice = (price) => `₹${price?.toLocaleString('en-IN')}`;

    const getSavingsPercent = (product) => {
        if (product.originalPrice && product.originalPrice > product.price) {
            return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
        }
        return 0;
    };

    // Empty State
    if (compareItems.length === 0) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-primary-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-100">
                        <FiLayers className="text-indigo-500" size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Compare Products</h1>
                    <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-8 leading-relaxed">
                        Add products to your comparison list to see them side by side. You can compare up to 4 products at a time.
                    </p>
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:from-primary-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-primary-600/30 active:scale-[0.98]"
                    >
                        Browse Products <FiArrowRight />
                    </Link>
                </div>
            </div>
        );
    }

    const SectionHeader = ({ title, icon: Icon, sectionKey, badge }) => (
        <tr className="bg-gray-50 dark:bg-gray-700/80">
            <td
                colSpan={compareItems.length + 1 + (4 - compareItems.length)}
                className="px-6 py-3 cursor-pointer select-none"
                onClick={() => toggleSection(sectionKey)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Icon className="text-primary-600 dark:text-primary-400" size={16} />
                        <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">{title}</span>
                        {badge && (
                            <span className="bg-primary-100 text-primary-700 dark:text-primary-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>
                        )}
                    </div>
                    {expandedSections[sectionKey] ? <FiChevronUp size={16} className="text-gray-400 dark:text-gray-500" /> : <FiChevronDown size={16} className="text-gray-400 dark:text-gray-500" />}
                </div>
            </td>
        </tr>
    );

    const EmptyCell = ({ index }) => (
        <td key={`empty-${index}`} className="px-4 py-4 border-l border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
            <div className="flex flex-col items-center justify-center text-gray-300">
                <span className="text-xs">—</span>
            </div>
        </td>
    );

    const isDifferent = (getValue) => {
        if (!highlightDifferences || compareItems.length < 2) return false;
        const values = compareItems.map(getValue).filter(v => v !== undefined && v !== null && v !== 'N/A');
        return new Set(values.map(String)).size > 1;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-[1600px] w-full mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                <FiLayers size={20} />
                            </div>
                            Compare Products
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 text-sm mt-1">Comparing {compareItems.length} of 4 products</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Highlight Differences Toggle */}
                        <button
                            onClick={() => setHighlightDifferences(!highlightDifferences)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${highlightDifferences
                                ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 shadow-md shadow-yellow-100'
                                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 dark:text-gray-500 hover:border-gray-300'
                                }`}
                        >
                            <FiZap size={14} />
                            {highlightDifferences ? 'Differences On' : 'Highlight Differences'}
                        </button>
                        <button
                            onClick={clearCompare}
                            className="flex items-center gap-2 text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 px-4 py-2.5 rounded-xl transition-all text-sm font-bold border-2 border-red-100 dark:border-red-800 hover:border-red-200 dark:border-red-800"
                        >
                            <FiTrash2 size={14} /> Clear All
                        </button>
                    </div>
                </div>

                {/* Quick Summary Cards (visible on all screen sizes) */}
                {compareItems.length >= 2 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-green-100 dark:border-green-800 p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
                                    <FiAward className="text-green-600 dark:text-green-400" size={14} />
                                </div>
                                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Best Price</span>
                            </div>
                            <p className="text-sm font-black text-gray-900 dark:text-white line-clamp-1">{lowestPrice?.title}</p>
                            <p className="text-green-600 dark:text-green-400 font-bold text-lg">{formatPrice(lowestPrice?.price)}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-amber-100 dark:border-amber-800 p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                                    <FiStar className="text-amber-600 dark:text-amber-400" size={14} />
                                </div>
                                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Top Rated</span>
                            </div>
                            <p className="text-sm font-black text-gray-900 dark:text-white line-clamp-1">{highestRated?.title}</p>
                            <p className="text-amber-600 dark:text-amber-400 font-bold text-lg">{highestRated?.rating?.rate?.toFixed(1) || 0} ★</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-primary-100 dark:border-primary-800 p-4 shadow-sm col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center">
                                    <FiZap className="text-primary-600 dark:text-primary-400" size={14} />
                                </div>
                                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Price Range</span>
                            </div>
                            <p className="text-primary-600 dark:text-primary-400 font-bold text-lg">
                                {formatPrice(Math.min(...compareItems.map(i => i.price)))} — {formatPrice(Math.max(...compareItems.map(i => i.price)))}
                            </p>
                        </div>
                    </div>
                )}

                {/* Comparison Table */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left" id="compare-table">
                            {/* Product Headers */}
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700">
                                    <th className="p-5 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 w-48 min-w-[180px] sticky left-0 z-10 border-r border-gray-100 dark:border-gray-700">
                                        <span className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">Features</span>
                                    </th>
                                    {compareItems.map((product) => (
                                        <th key={product._id} className="p-5 text-center min-w-[220px] max-w-[260px] border-l border-gray-100 dark:border-gray-700 relative group">
                                            {/* Remove Button */}
                                            <button
                                                onClick={() => removeFromCompare(product._id)}
                                                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-600 hover:bg-red-100 text-gray-400 dark:text-gray-500 hover:text-red-500 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10"
                                                title="Remove from comparison"
                                            >
                                                <FiX size={14} />
                                            </button>

                                            {/* Best Price / Top Rated Badge */}
                                            {compareItems.length >= 2 && lowestPrice?._id === product._id && (
                                                <div className="absolute top-3 left-3 bg-green-50 dark:bg-green-900/300 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                                    BEST PRICE
                                                </div>
                                            )}
                                            {compareItems.length >= 2 && highestRated?._id === product._id && lowestPrice?._id !== product._id && (
                                                <div className="absolute top-3 left-3 bg-amber-50 dark:bg-amber-900/300 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                                    TOP RATED
                                                </div>
                                            )}

                                            <div className="flex flex-col items-center">
                                                <div className="w-28 h-28 bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-100 dark:border-gray-700 p-2 mb-3 overflow-hidden group-hover:shadow-md transition-shadow">
                                                    <img
                                                        src={product.image || 'https://placehold.co/400?text=No+Image'}
                                                        alt={product.title}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <Link
                                                    to={`/products/${product._id}`}
                                                    className="text-sm font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:text-primary-400 transition-colors line-clamp-2 leading-tight mb-2"
                                                >
                                                    {product.title}
                                                </Link>

                                                {/* Quick Action Buttons */}
                                                <div className="flex gap-2 mt-2">
                                                    <button
                                                        onClick={() => handleAddToCart(product)}
                                                        className="flex items-center gap-1 bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-sm"
                                                    >
                                                        <FiShoppingCart size={12} /> Add
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleWishlist(product)}
                                                        className={`p-1.5 rounded-lg border-2 transition-all ${isInWishlist(product._id || product.id)
                                                            ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-500'
                                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:border-red-200 dark:border-red-800 hover:text-red-400'
                                                            }`}
                                                    >
                                                        <FiHeart size={12} fill={isInWishlist(product._id || product.id) ? 'currentColor' : 'none'} />
                                                    </button>
                                                    <Link
                                                        to={`/products/${product._id}`}
                                                        className="p-1.5 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:border-primary-200 dark:border-primary-800 hover:text-primary-500 transition-all"
                                                    >
                                                        <FiEye size={12} />
                                                    </Link>
                                                </div>
                                            </div>
                                        </th>
                                    ))}
                                    {/* Empty Slots */}
                                    {Array.from({ length: Math.max(0, 4 - compareItems.length) }).map((_, index) => (
                                        <th key={`empty-header-${index}`} className="p-5 border-l border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                                            <Link
                                                to="/products"
                                                className="flex flex-col items-center justify-center h-full text-gray-300 hover:text-primary-400 transition-colors group/add"
                                            >
                                                <div className="w-20 h-20 border-2 border-dashed border-gray-200 dark:border-gray-600 group-hover/add:border-primary-300 rounded-2xl flex items-center justify-center mb-2 transition-colors">
                                                    <FiPlus size={24} />
                                                </div>
                                                <p className="text-xs font-bold">Add Product</p>
                                            </Link>
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {/* ═══════ PRICING SECTION ═══════ */}
                                <SectionHeader title="Pricing" icon={FiAward} sectionKey="pricing" />
                                {expandedSections.pricing && (
                                    <>
                                        {/* Price */}
                                        <tr className="border-b border-gray-50 hover:bg-gray-50 dark:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 sticky left-0 z-10 border-r border-gray-100 dark:border-gray-700">
                                                Price
                                            </td>
                                            {compareItems.map((product) => (
                                                <td key={product._id} className={`px-4 py-4 text-center border-l border-gray-100 dark:border-gray-700 ${highlightDifferences && isDifferent(p => p.price) && lowestPrice?._id === product._id
                                                    ? 'bg-green-50 dark:bg-green-900/30'
                                                    : ''
                                                    }`}>
                                                    <span className={`text-lg font-black ${compareItems.length >= 2 && lowestPrice?._id === product._id
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-gray-900 dark:text-white'
                                                        }`}>
                                                        {formatPrice(product.price)}
                                                    </span>
                                                    {compareItems.length >= 2 && lowestPrice?._id === product._id && (
                                                        <span className="block text-[10px] font-bold text-green-500 mt-0.5">LOWEST</span>
                                                    )}
                                                </td>
                                            ))}
                                            {Array.from({ length: Math.max(0, 4 - compareItems.length) }).map((_, i) => <EmptyCell key={i} index={`price-${i}`} />)}
                                        </tr>

                                        {/* Original Price */}
                                        <tr className="border-b border-gray-50 hover:bg-gray-50 dark:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 sticky left-0 z-10 border-r border-gray-100 dark:border-gray-700">
                                                Original Price
                                            </td>
                                            {compareItems.map((product) => (
                                                <td key={product._id} className="px-4 py-4 text-center border-l border-gray-100 dark:border-gray-700">
                                                    {product.originalPrice && product.originalPrice > product.price ? (
                                                        <span className="text-sm text-gray-400 dark:text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                                                    ) : (
                                                        <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                                                    )}
                                                </td>
                                            ))}
                                            {Array.from({ length: Math.max(0, 4 - compareItems.length) }).map((_, i) => <EmptyCell key={i} index={`orig-${i}`} />)}
                                        </tr>

                                        {/* Savings */}
                                        <tr className="border-b border-gray-50 hover:bg-gray-50 dark:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 sticky left-0 z-10 border-r border-gray-100 dark:border-gray-700">
                                                Savings
                                            </td>
                                            {compareItems.map((product) => {
                                                const savings = getSavingsPercent(product);
                                                return (
                                                    <td key={product._id} className="px-4 py-4 text-center border-l border-gray-100 dark:border-gray-700">
                                                        {savings > 0 ? (
                                                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 dark:text-green-400 text-xs font-black px-2.5 py-1 rounded-full">
                                                                <FiZap size={10} /> {savings}% OFF
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-gray-400 dark:text-gray-500">No discount</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            {Array.from({ length: Math.max(0, 4 - compareItems.length) }).map((_, i) => <EmptyCell key={i} index={`save-${i}`} />)}
                                        </tr>
                                    </>
                                )}

                                {/* ═══════ DETAILS SECTION ═══════ */}
                                <SectionHeader title="Product Details" icon={FiPackage} sectionKey="details" />
                                {expandedSections.details && (
                                    <>
                                        {/* Category */}
                                        <tr className={`border-b border-gray-50 hover:bg-gray-50 dark:bg-gray-700/50 transition-colors ${highlightDifferences && isDifferent(p => p.category) ? 'bg-yellow-50 dark:bg-yellow-900/30/50' : ''
                                            }`}>
                                            <td className="px-6 py-4 font-bold text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 sticky left-0 z-10 border-r border-gray-100 dark:border-gray-700">
                                                Category
                                            </td>
                                            {compareItems.map((product) => (
                                                <td key={product._id} className="px-4 py-4 text-center border-l border-gray-100 dark:border-gray-700">
                                                    <span className="inline-block bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-3 py-1 rounded-full text-xs font-bold capitalize">
                                                        {product.category || 'N/A'}
                                                    </span>
                                                </td>
                                            ))}
                                            {Array.from({ length: Math.max(0, 4 - compareItems.length) }).map((_, i) => <EmptyCell key={i} index={`cat-${i}`} />)}
                                        </tr>

                                        {/* Rating */}
                                        <tr className={`border-b border-gray-50 hover:bg-gray-50 dark:bg-gray-700/50 transition-colors ${highlightDifferences && isDifferent(p => p.rating?.rate) ? 'bg-yellow-50 dark:bg-yellow-900/30/50' : ''
                                            }`}>
                                            <td className="px-6 py-4 font-bold text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 sticky left-0 z-10 border-r border-gray-100 dark:border-gray-700">
                                                Rating
                                            </td>
                                            {compareItems.map((product) => {
                                                const rate = product.rating?.rate || 0;
                                                const count = product.rating?.count || 0;
                                                const isBest = compareItems.length >= 2 && highestRated?._id === product._id;
                                                return (
                                                    <td key={product._id} className={`px-4 py-4 text-center border-l border-gray-100 dark:border-gray-700 ${highlightDifferences && isBest ? 'bg-amber-50 dark:bg-amber-900/30' : ''
                                                        }`}>
                                                        <div className="flex flex-col items-center gap-1">
                                                            {/* Star visualization */}
                                                            <div className="flex items-center gap-0.5">
                                                                {[1, 2, 3, 4, 5].map(star => (
                                                                    <FiStar
                                                                        key={star}
                                                                        size={14}
                                                                        className={star <= Math.round(rate) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className={`text-sm font-bold ${isBest ? 'text-amber-600 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                                                {rate > 0 ? rate.toFixed(1) : 'N/A'}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                                                                {count > 0 ? `${count} reviews` : 'No reviews'}
                                                            </span>
                                                            {isBest && (
                                                                <span className="text-[10px] font-bold text-amber-500 mt-0.5">HIGHEST</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                            {Array.from({ length: Math.max(0, 4 - compareItems.length) }).map((_, i) => <EmptyCell key={i} index={`rat-${i}`} />)}
                                        </tr>

                                        {/* Sizes */}
                                        <tr className="border-b border-gray-50 hover:bg-gray-50 dark:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 sticky left-0 z-10 border-r border-gray-100 dark:border-gray-700">
                                                Available Sizes
                                            </td>
                                            {compareItems.map((product) => (
                                                <td key={product._id} className="px-4 py-4 text-center border-l border-gray-100 dark:border-gray-700">
                                                    {product.sizes && product.sizes.length > 0 ? (
                                                        <div className="flex flex-wrap justify-center gap-1">
                                                            {product.sizes.map(size => (
                                                                <span key={size} className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                                                    {size}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 dark:text-gray-500">One Size</span>
                                                    )}
                                                </td>
                                            ))}
                                            {Array.from({ length: Math.max(0, 4 - compareItems.length) }).map((_, i) => <EmptyCell key={i} index={`size-${i}`} />)}
                                        </tr>

                                        {/* Description */}
                                        <tr className="border-b border-gray-50 hover:bg-gray-50 dark:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 sticky left-0 z-10 border-r border-gray-100 dark:border-gray-700">
                                                Description
                                            </td>
                                            {compareItems.map((product) => (
                                                <td key={product._id} className="px-4 py-4 text-center border-l border-gray-100 dark:border-gray-700">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 dark:text-gray-500 leading-relaxed line-clamp-4 text-left">
                                                        {product.description || 'No description available'}
                                                    </p>
                                                </td>
                                            ))}
                                            {Array.from({ length: Math.max(0, 4 - compareItems.length) }).map((_, i) => <EmptyCell key={i} index={`desc-${i}`} />)}
                                        </tr>
                                    </>
                                )}

                                {/* ═══════ AVAILABILITY SECTION ═══════ */}
                                <SectionHeader title="Availability & Shipping" icon={FiTruck} sectionKey="availability" />
                                {expandedSections.availability && (
                                    <>
                                        {/* Stock Status */}
                                        <tr className="border-b border-gray-50 hover:bg-gray-50 dark:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 sticky left-0 z-10 border-r border-gray-100 dark:border-gray-700">
                                                Stock Status
                                            </td>
                                            {compareItems.map((product) => {
                                                const inStock = product.stock > 0 || product.countInStock > 0 || (product.stock === undefined && product.countInStock === undefined);
                                                return (
                                                    <td key={product._id} className="px-4 py-4 text-center border-l border-gray-100 dark:border-gray-700">
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${inStock
                                                            ? 'bg-green-100 text-green-700 dark:text-green-400'
                                                            : 'bg-red-100 text-red-700'
                                                            }`}>
                                                            {inStock ? <><FiCheck size={10} /> In Stock</> : <><FiX size={10} /> Out of Stock</>}
                                                        </span>
                                                    </td>
                                                );
                                            })}
                                            {Array.from({ length: Math.max(0, 4 - compareItems.length) }).map((_, i) => <EmptyCell key={i} index={`stock-${i}`} />)}
                                        </tr>

                                        {/* Free Delivery */}
                                        <tr className="border-b border-gray-50 hover:bg-gray-50 dark:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 sticky left-0 z-10 border-r border-gray-100 dark:border-gray-700">
                                                Free Delivery
                                            </td>
                                            {compareItems.map((product) => (
                                                <td key={product._id} className="px-4 py-4 text-center border-l border-gray-100 dark:border-gray-700">
                                                    {product.price >= 500 ? (
                                                        <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-bold">
                                                            <FiCheck size={12} /> Yes
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-gray-400 dark:text-gray-500 text-xs font-bold">
                                                            <FiMinus size={12} /> Orders above ₹500
                                                        </span>
                                                    )}
                                                </td>
                                            ))}
                                            {Array.from({ length: Math.max(0, 4 - compareItems.length) }).map((_, i) => <EmptyCell key={i} index={`del-${i}`} />)}
                                        </tr>

                                        {/* Return Policy */}
                                        <tr className="border-b border-gray-50 hover:bg-gray-50 dark:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 sticky left-0 z-10 border-r border-gray-100 dark:border-gray-700">
                                                Return Policy
                                            </td>
                                            {compareItems.map((product) => (
                                                <td key={product._id} className="px-4 py-4 text-center border-l border-gray-100 dark:border-gray-700">
                                                    <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400 dark:text-gray-500 text-xs font-medium">
                                                        <FiShield size={10} className="text-green-500" /> 7-Day Easy Returns
                                                    </span>
                                                </td>
                                            ))}
                                            {Array.from({ length: Math.max(0, 4 - compareItems.length) }).map((_, i) => <EmptyCell key={i} index={`ret-${i}`} />)}
                                        </tr>
                                    </>
                                )}

                                {/* ═══════ SPECS SECTION ═══════ */}
                                {specsList.length > 0 && (
                                    <>
                                        <SectionHeader title="Specifications" icon={FiZap} sectionKey="specs" badge={`${specsList.length} specs`} />
                                        {expandedSections.specs && specsList.map((specKey) => (
                                            <tr key={specKey} className={`border-b border-gray-50 hover:bg-gray-50 dark:bg-gray-700/50 transition-colors ${highlightDifferences && isDifferent(p => p.specs?.[specKey]) ? 'bg-yellow-50 dark:bg-yellow-900/30/50' : ''
                                                }`}>
                                                <td className="px-6 py-4 font-bold text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 sticky left-0 z-10 border-r border-gray-100 dark:border-gray-700 capitalize">
                                                    {specKey.replace(/([A-Z])/g, ' $1').trim()}
                                                </td>
                                                {compareItems.map((product) => (
                                                    <td key={product._id} className="px-4 py-4 text-center text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500 border-l border-gray-100 dark:border-gray-700">
                                                        {product.specs && product.specs[specKey] !== undefined
                                                            ? <span className="font-medium">{product.specs[specKey].toString()}</span>
                                                            : <span className="text-gray-300">—</span>
                                                        }
                                                    </td>
                                                ))}
                                                {Array.from({ length: Math.max(0, 4 - compareItems.length) }).map((_, i) => <EmptyCell key={i} index={`spec-${specKey}-${i}`} />)}
                                            </tr>
                                        ))}
                                    </>
                                )}

                                {/* ═══════ ACTIONS ROW ═══════ */}
                                <tr className="bg-gray-50 dark:bg-gray-700/80 border-t border-gray-200 dark:border-gray-600">
                                    <td className="px-6 py-5 font-bold text-sm text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-700 sticky left-0 z-10 border-r border-gray-100 dark:border-gray-700">
                                        Actions
                                    </td>
                                    {compareItems.map((product) => (
                                        <td key={product._id} className="px-4 py-5 text-center border-l border-gray-100 dark:border-gray-700">
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() => handleAddToCart(product)}
                                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white py-2.5 rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                                                >
                                                    <FiShoppingCart size={14} />
                                                    {product.sizes && product.sizes.length > 0 ? 'Select Size' : 'Add to Cart'}
                                                </button>
                                                <Link
                                                    to={`/products/${product._id}`}
                                                    className="w-full flex items-center justify-center gap-1 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 py-2 rounded-xl text-xs font-bold transition-all"
                                                >
                                                    View Details <FiArrowRight size={12} />
                                                </Link>
                                            </div>
                                        </td>
                                    ))}
                                    {Array.from({ length: Math.max(0, 4 - compareItems.length) }).map((_, i) => <EmptyCell key={i} index={`act-${i}`} />)}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="mt-8 text-center">
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:text-primary-400 font-bold text-sm hover:underline"
                    >
                        <FiArrowRight /> Browse more products to compare
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Compare;
