import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../services/api';
import { FiFilter, FiSearch, FiX } from 'react-icons/fi';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    const sortParam = searchParams.get('sort');

    const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'All');
    const [sortOrder, setSortOrder] = useState(sortParam || 'popular');
    const [priceRange, setPriceRange] = useState([
        minPriceParam ? parseInt(minPriceParam) : 0, 
        maxPriceParam ? parseInt(maxPriceParam) : 200000
    ]);
    const [searchQuery, setSearchQuery] = useState(searchParam || '');

    useEffect(() => {
        if (categoryParam) setSelectedCategory(categoryParam);
        if (searchParam !== null) setSearchQuery(searchParam);
        if (sortParam) setSortOrder(sortParam);
        if (minPriceParam || maxPriceParam) {
            setPriceRange([
                minPriceParam ? parseInt(minPriceParam) : 0, 
                maxPriceParam ? parseInt(maxPriceParam) : 200000
            ]);
        }
    }, [categoryParam, searchParam, sortParam, minPriceParam, maxPriceParam]);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                const data = await fetchProducts();
                setProducts(data);
                setFilteredProducts(data);
            } catch (error) {
                console.error("Failed to load products", error);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    useEffect(() => {
        let result = [...products];

        // Filter by Category
        if (selectedCategory && selectedCategory !== 'All') {
            result = result.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
        }

        // Filter by Price
        result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

        // Search
        if (searchQuery) {
            result = result.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        // Sort
        if (sortOrder === 'price-low-high') {
            result.sort((a, b) => a.price - b.price);
        } else if (sortOrder === 'price-high-low') {
            result.sort((a, b) => b.price - a.price);
        } else if (sortOrder === 'rating') {
            result.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
        }

        setFilteredProducts(result);
    }, [products, selectedCategory, sortOrder, priceRange, searchQuery]);

    const categories = ['All', 'Electronics', 'Accessories', 'Clothing', 'Furniture', 'Footwear', 'Sports', 'Home & Kitchen', 'Stationery', 'Books & Media', 'Beauty & Personal Care', 'Toys & Games', 'Automotive'];

    return (
        <div className="max-w-[1920px] mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shop</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{filteredProducts.length} results found</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative group">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all w-full sm:w-64 bg-white dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="md:hidden flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                        <FiFilter /> Filters
                    </button>

                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary-500 text-sm bg-white dark:bg-gray-800 dark:text-white"
                    >
                        <option value="popular">Most Popular</option>
                        <option value="price-low-high">Price: Low to High</option>
                        <option value="price-high-low">Price: High to Low</option>
                        <option value="rating">Top Rated</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Filters Sidebar */}
                <aside className={`w-full md:w-60 space-y-8 ${showFilters ? 'block' : 'hidden md:block'}`}>
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm sticky top-24">
                        <div className="flex justify-between items-center mb-6 md:hidden">
                            <h3 className="font-bold text-lg">Filters</h3>
                            <button onClick={() => setShowFilters(false)}><FiX size={20} /></button>
                        </div>

                        <div className="mb-8">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
                            <div className="space-y-2">
                                {categories.map(cat => (
                                    <label key={cat} className="flex items-center space-x-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={selectedCategory === cat}
                                            onChange={() => setSelectedCategory(cat)}
                                            className="accent-primary-600 w-4 h-4"
                                        />
                                        <span className={`text-sm ${selectedCategory === cat ? 'text-primary-600 font-medium' : 'text-gray-600 group-hover:text-primary-600 transition-colors'}`}>{cat}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Price Range</h3>
                            <div className="flex items-center space-x-4 mb-4">
                                <span className="text-sm text-gray-500">₹{priceRange[0]}</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="200000"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                    className="w-full accent-primary-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="text-sm text-gray-500">₹{priceRange[1]}</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                                <div key={i} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 h-[420px] flex flex-col justify-between">
                                    <div className="space-y-4">
                                        {/* Image skeleton */}
                                        <div className="aspect-[4/5] w-full rounded-xl shimmer-bg" />
                                        {/* Category skeleton */}
                                        <div className="h-3 w-1/4 rounded shimmer-bg" />
                                        {/* Title skeleton */}
                                        <div className="h-5 w-3/4 rounded shimmer-bg" />
                                    </div>
                                    {/* Price and Cart Button skeleton */}
                                    <div className="flex justify-between items-center mt-4">
                                        <div className="h-7 w-1/3 rounded shimmer-bg" />
                                        <div className="h-10 w-10 rounded-xl shimmer-bg" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        selectedCategory === 'All' && filteredProducts.length > 3 ? (
                            <div className="overflow-hidden h-[80vh] min-h-[600px] relative rounded-2xl">
                                {/* Gradient fades for top and bottom edges */}
                                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-gray-50 dark:from-gray-900 to-transparent z-10 pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent z-10 pointer-events-none"></div>
                                
                                <div className="flex flex-col gap-6 animate-auto-scroll-y">
                                    {/* First Set */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                        {filteredProducts.map((product, idx) => (
                                            <div key={product._id || product.id} style={{ animationDelay: `${idx * 50}ms` }} className="animate-fade-slide-up">
                                                <ProductCard product={product} />
                                            </div>
                                        ))}
                                    </div>
                                    {/* Second Set for seamless loop */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                        {filteredProducts.map((product, idx) => (
                                            <div key={(product._id || product.id) + '-dup'} style={{ animationDelay: `${idx * 50}ms` }} className="animate-fade-slide-up">
                                                <ProductCard product={product} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                {filteredProducts.map((product, idx) => (
                                    <div key={product._id || product.id} style={{ animationDelay: `${idx * 50}ms` }} className="animate-fade-slide-up">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400 text-lg">No products found matching your criteria.</p>
                            <button
                                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setPriceRange([0, 200000]); }}
                                className="mt-4 text-primary-600 font-medium hover:underline"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Scoped CSS animations for Shimmer and Stagger */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                .shimmer-bg {
                    background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.6s infinite linear;
                }
                .dark .shimmer-bg {
                    background: linear-gradient(90deg, #1f2937 25%, #374151 50%, #1f2937 75%);
                    background-size: 200% 100%;
                    animation: shimmer 1.6s infinite linear;
                }
                @keyframes fadeSlideUp {
                    from {
                        opacity: 0;
                        transform: translateY(24px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-slide-up {
                    opacity: 0;
                    animation: fadeSlideUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}} />
        </div>
    );
};

export default ProductList;
