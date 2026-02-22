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
    const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'All');
    const [sortOrder, setSortOrder] = useState('popular');
    const [priceRange, setPriceRange] = useState([0, 200000]);
    const [searchQuery, setSearchQuery] = useState(searchParam || '');

    useEffect(() => {
        if (categoryParam) setSelectedCategory(categoryParam);
        if (searchParam !== null) setSearchQuery(searchParam);
    }, [categoryParam, searchParam]);
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

    const categories = ['All', 'Electronics', 'Accessories', 'Clothing', 'Furniture', 'Footwear', 'Sports', 'Home & Kitchen', 'Stationery', 'Books & Media', 'Beauty & Personal Care'];

    return (
        <div className="max-w-[1920px] mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Shop</h1>
                    <p className="text-gray-500 text-sm mt-1">{filteredProducts.length} results found</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative group">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all w-full sm:w-64"
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
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm bg-white"
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
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-24">
                        <div className="flex justify-between items-center mb-6 md:hidden">
                            <h3 className="font-bold text-lg">Filters</h3>
                            <button onClick={() => setShowFilters(false)}><FiX size={20} /></button>
                        </div>

                        <div className="mb-8">
                            <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
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
                            <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
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
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-2xl p-4 h-96"></div>
                            ))}
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                            {filteredProducts.map(product => (
                                <ProductCard key={product._id || product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
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
        </div>
    );
};

export default ProductList;
