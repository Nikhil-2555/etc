import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import {
    FiShoppingCart, FiUser, FiLogOut, FiMenu, FiSearch, FiHeart, FiBell,
    FiChevronDown, FiGrid, FiBox, FiSettings, FiX
} from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';

const Navbar = () => {
    const { totalItems } = useCart();
    const { totalWishlistItems } = useWishlist();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const userMenuRef = useRef(null);
    const categoryMenuRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
            if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target)) {
                setIsCategoryMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
            setIsMenuOpen(false);
        }
    };

    const categories = [
        { name: 'Electronics', icon: <FiGrid />, path: '/products?category=electronics' },
        { name: 'Accessories', icon: <FiGrid />, path: '/products?category=accessories' },
        { name: 'Clothing', icon: <FiGrid />, path: '/products?category=clothing' },
        { name: 'Furniture', icon: <FiGrid />, path: '/products?category=furniture' },
        { name: 'Footwear', icon: <FiGrid />, path: '/products?category=footwear' },
        { name: 'Sports', icon: <FiGrid />, path: '/products?category=sports' },
        { name: 'Home & Kitchen', icon: <FiGrid />, path: '/products?category=home & kitchen' },
        { name: 'Stationery', icon: <FiGrid />, path: '/products?category=stationery' },
        { name: 'Books & Media', icon: <FiGrid />, path: '/products?category=books & media' },
        { name: 'Beauty & Personal Care', icon: <FiGrid />, path: '/products?category=beauty & personal care' },
    ];

    return (
        <div className="navbar-sticky">


            {/* Main Navbar */}
            <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="max-w-[1920px] mx-auto px-6 h-20 flex items-center justify-between gap-4 md:gap-8">

                    {/* Logo */}
                    <Link to="/" className="text-2xl font-bold text-primary-600 tracking-tight flex-shrink-0">
                        ShopFlow
                    </Link>

                    {/* Desktop Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-2xl relative">
                        <form onSubmit={handleSearch} className="w-full relative">
                            <input
                                type="text"
                                placeholder="Search for products, brands and more..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-5 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-primary-500 focus:bg-white transition-all text-sm"
                            />
                            <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors">
                                <FiSearch size={16} />
                            </button>
                        </form>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center space-x-6 flex-shrink-0">
                        {/* Categories Dropdown */}
                        <div className="relative" ref={categoryMenuRef}>
                            <button
                                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                                className="flex items-center space-x-1 text-gray-600 hover:text-primary-600 font-medium transition-colors"
                            >
                                <span>Categories</span>
                                <FiChevronDown size={16} className={`transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isCategoryMenuOpen && (
                                <div className="absolute top-full right-0 mt-4 w-60 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                                    {categories.map((cat, idx) => (
                                        <Link
                                            key={idx}
                                            to={cat.path}
                                            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                                            onClick={() => setIsCategoryMenuOpen(false)}
                                        >
                                            {cat.icon}
                                            <span>{cat.name}</span>
                                        </Link>
                                    ))}
                                    <div className="border-t border-gray-100 mt-2 pt-2">
                                        <Link to="/products" className="block px-4 py-2 text-center text-xs font-bold text-primary-600 hover:underline">
                                            View All Products
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link to="/wishlist" className="text-gray-600 hover:text-primary-600 transition-colors relative">
                            <FiHeart size={22} />
                            {totalWishlistItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {totalWishlistItems}
                                </span>
                            )}
                        </Link>

                        {(user?.role === 'admin' || user?.role === 'manager') && (
                            <Link
                                to="/admin"
                                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-full text-sm font-bold hover:bg-amber-600 transition-all shadow-md hover:shadow-lg active:scale-95"
                            >
                                <FiSettings className="animate-spin-slow" /> Admin
                            </Link>
                        )}

                        <Link to="/cart" className="relative text-gray-600 hover:text-primary-600 transition-colors">
                            <FiShoppingCart size={22} />
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {totalItems}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center space-x-2 focus:outline-none"
                                >
                                    <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold border border-primary-200">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-left hidden lg:block">
                                        <p className="text-xs text-gray-500">Welcome</p>
                                        <p className="text-sm font-semibold text-gray-900 leading-none">{user.name.split(' ')[0]}</p>
                                    </div>
                                    <FiChevronDown size={14} className="text-gray-400" />
                                </button>

                                {isUserMenuOpen && (
                                    <div className="absolute top-full right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
                                        <div className="px-4 py-3 border-b border-gray-50">
                                            <p className="text-sm font-bold text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>

                                        <Link to="/dashboard" onClick={() => setIsUserMenuOpen(false)} className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                            <FiUser size={16} />
                                            <span>My Profile</span>
                                        </Link>
                                        <Link to="/dashboard" onClick={() => setIsUserMenuOpen(false)} className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                            <FiBox size={16} />
                                            <span>Orders</span>
                                        </Link>
                                        {(user.role === 'admin' || user.role === 'manager') && (
                                            <Link to="/admin" onClick={() => setIsUserMenuOpen(false)} className="flex items-center space-x-3 px-4 py-3 text-sm text-primary-600 hover:bg-primary-50 transition-colors font-medium">
                                                <FiSettings size={16} />
                                                <span>Manager Panel</span>
                                            </Link>
                                        )}

                                        <div className="border-t border-gray-100 mt-1">
                                            <button
                                                onClick={() => { logout(); navigate('/'); }}
                                                className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                <FiLogOut size={16} />
                                                <span>Log Out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary-600 transition-all shadow-md hover:shadow-lg transform active:scale-95">
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center space-x-4">
                        <Link to="/cart" className="relative text-gray-600 hover:text-primary-600 transition-colors">
                            <FiShoppingCart size={24} />
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                        <button className="text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <FiX size={26} /> : <FiMenu size={26} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 absolute top-full left-0 right-0 shadow-xl border-b z-40 max-h-[90vh] overflow-y-auto">
                        <div className="p-4 space-y-6">
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 transition-all"
                                />
                                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <FiSearch size={20} />
                                </button>
                            </form>

                            <div className="space-y-1">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Menu</p>
                                <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">Home</Link>
                                <Link to="/products" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">All Products</Link>
                                <Link to="/products?category=electronics" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium ml-4 border-l-2 border-gray-100">Electronics</Link>
                                <Link to="/products?category=clothing" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium ml-4 border-l-2 border-gray-100">Clothing</Link>
                                <Link to="/products?category=accessories" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium ml-4 border-l-2 border-gray-100">Accessories</Link>
                                <Link to="/products?category=sports" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium ml-4 border-l-2 border-gray-100">Sports</Link>
                                <Link to="/products?category=beauty & personal care" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium ml-4 border-l-2 border-gray-100">Beauty</Link>
                                <Link to="/products?category=books & media" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium ml-4 border-l-2 border-gray-100">Books</Link>
                            </div>

                            <div className="border-t border-gray-100 pt-4">
                                {user ? (
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Account</p>
                                        <div className="flex items-center space-x-3 px-4 py-3 mb-2">
                                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold border border-primary-200">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                        <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 font-medium">Dashboard</Link>
                                        <button onClick={() => { logout(); navigate('/'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 text-red-500 font-medium">Log Out</button>
                                    </div>
                                ) : (
                                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block w-full text-center bg-primary-600 text-white rounded-xl py-3 font-bold shadow-md">
                                        Login / Sign Up
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </div>
    );
};

export default Navbar;
