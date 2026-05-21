import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCompare } from '../context/CompareContext';
import {
    FiShoppingCart, FiUser, FiLogOut, FiMenu, FiSearch, FiHeart, FiBell,
    FiChevronDown, FiGrid, FiBox, FiSettings, FiX, FiSun, FiMoon, FiMessageCircle, FiLayers, FiMic
} from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';
import { searchProducts, parseVoiceCommand, transcribeAudio } from '../services/api';

const Navbar = () => {
    const { totalItems } = useCart();
    const { totalWishlistItems } = useWishlist();
    const { compareItems } = useCompare();
    const { user, logout } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [voiceText, setVoiceText] = useState('');
    const [voiceError, setVoiceError] = useState('');
    const [voiceStatus, setVoiceStatus] = useState(''); // 'recording', 'processing'
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const userMenuRef = useRef(null);
    const categoryMenuRef = useRef(null);
    const searchRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
            if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target)) {
                setIsCategoryMenuOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.trim().length >= 2) {
                try {
                    const data = await searchProducts(searchQuery);
                    setSuggestions(data);
                    setShowSuggestions(true);
                } catch (error) {
                    console.error('Error fetching suggestions:', error);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        const debounceTimer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
            setIsMenuOpen(false);
            setShowSuggestions(false);
        }
    };

    // Stop voice recording
    const stopListening = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        } else {
            setIsListening(false);
            setVoiceStatus('');
        }
    };

    // Voice Search Handler using MediaRecorder + GROQ Whisper
    const handleVoiceSearch = async () => {
        // If already listening, stop
        if (isListening) {
            stopListening();
            return;
        }

        // Check if MediaRecorder is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setVoiceError('Voice search is not supported in this browser.');
            setTimeout(() => setVoiceError(''), 4000);
            return;
        }

        setVoiceText('');
        setVoiceError('');
        setVoiceStatus('recording');
        audioChunksRef.current = [];

        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                    ? 'audio/webm;codecs=opus'
                    : 'audio/webm'
            });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstart = () => {
                console.log('Voice recording started');
                setIsListening(true);
            };

            mediaRecorder.onstop = async () => {
                console.log('Voice recording stopped');
                // Stop all mic tracks
                stream.getTracks().forEach(track => track.stop());

                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

                if (audioBlob.size < 1000) {
                    // Too short/empty recording
                    setIsListening(false);
                    setVoiceStatus('');
                    setVoiceError('Recording too short. Please try again and speak clearly.');
                    setTimeout(() => setVoiceError(''), 4000);
                    return;
                }

                setVoiceStatus('processing');
                setVoiceText('Processing your voice...');

                try {
                    // Send audio to backend for GROQ Whisper transcription
                    const result = await transcribeAudio(audioBlob);
                    const transcript = result.text?.trim();

                    if (!transcript) {
                        setVoiceError('Could not understand. Please try again.');
                        setTimeout(() => setVoiceError(''), 4000);
                        setIsListening(false);
                        setVoiceStatus('');
                        return;
                    }

                    console.log('Whisper transcription:', transcript);
                    setVoiceText(transcript);
                    setSearchQuery(transcript);

                    // Parse the voice command using AI
                    try {
                        const parsed = await parseVoiceCommand(transcript);
                        const params = new URLSearchParams();
                        if (parsed.query) params.set('search', parsed.query);
                        if (parsed.maxPrice) params.set('maxPrice', parsed.maxPrice);
                        if (parsed.minPrice) params.set('minPrice', parsed.minPrice);
                        if (parsed.category) params.set('category', parsed.category);
                        if (parsed.sortBy) params.set('sort', parsed.sortBy);
                        navigate(`/products?${params.toString()}`);
                        setIsMenuOpen(false);
                        setShowSuggestions(false);
                    } catch (err) {
                        console.log('AI parse failed, using raw transcript:', err);
                        navigate(`/products?search=${encodeURIComponent(transcript)}`);
                        setIsMenuOpen(false);
                    }
                } catch (err) {
                    console.error('Transcription failed:', err);
                    const errorMessage = err.response?.data?.message || 'Voice transcription failed. Please try again.';
                    setVoiceError(errorMessage);
                    setTimeout(() => setVoiceError(''), 7000);
                } finally {
                    setIsListening(false);
                    setVoiceStatus('');
                }
            };

            mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event.error);
                stream.getTracks().forEach(track => track.stop());
                setIsListening(false);
                setVoiceStatus('');
                setVoiceError('Recording failed. Please try again.');
                setTimeout(() => setVoiceError(''), 4000);
            };

            // Start recording
            mediaRecorder.start();

            // Auto-stop after 10 seconds
            setTimeout(() => {
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
            }, 10000);

        } catch (err) {
            console.error('Microphone access error:', err);
            setIsListening(false);
            setVoiceStatus('');
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setVoiceError('Microphone access denied. Please allow mic access in browser settings.');
            } else if (err.name === 'NotFoundError') {
                setVoiceError('No microphone found. Please connect a microphone.');
            } else {
                setVoiceError('Failed to access microphone. Please try again.');
            }
            setTimeout(() => setVoiceError(''), 5000);
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
        { name: 'Toys & Games', icon: <FiGrid />, path: '/products?category=toys & games' },
        { name: 'Automotive', icon: <FiGrid />, path: '/products?category=automotive' },
    ];

    return (
        <div className="navbar-sticky relative z-[100]">

            {/* Voice Listening Overlay */}
            {isListening && (
                <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center" onClick={voiceStatus === 'recording' ? stopListening : undefined}>
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-10 flex flex-col items-center gap-5 shadow-2xl animate-fade-in max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                            <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg ${
                                    voiceStatus === 'processing' 
                                        ? 'bg-amber-500' 
                                        : 'bg-primary-600'
                            }`}>
                                {voiceStatus === 'processing' ? (
                                    <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <FiMic size={40} className="text-white" />
                                )}
                            </div>
                            {voiceStatus === 'recording' && (
                                <>
                                    <div className="absolute inset-0 rounded-full bg-primary-400 opacity-50 animate-ping" />
                                    <div className="absolute -inset-2 rounded-full border-4 border-primary-300 opacity-40 animate-pulse" />
                                </>
                            )}
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {voiceStatus === 'processing' ? 'Transcribing...' : 'Listening...'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                            {voiceStatus === 'processing' 
                                ? 'Converting your speech to text using AI' 
                                : 'Speak now, e.g. "Show laptops under 50000"'}
                        </p>
                        {voiceText && <p className="text-sm font-medium text-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:text-primary-300 px-4 py-2 rounded-full">"{voiceText}"</p>}
                        {voiceStatus === 'recording' && (
                            <button 
                                onClick={stopListening}
                                className="mt-2 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-medium transition-colors shadow-md"
                            >
                                Stop Recording
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Voice Error Toast */}
            {voiceError && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[201] bg-red-500 text-white px-6 py-3 rounded-xl shadow-xl text-sm font-medium animate-fade-in flex items-center gap-2">
                    <FiMic size={16} /> {voiceError}
                </div>
            )}


            {/* Main Navbar */}
            <nav className="relative z-[100] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-300">
                <div className="max-w-[1920px] mx-auto px-6 h-20 flex items-center justify-between gap-4 md:gap-8">

                    {/* Logo */}
                    <Link to="/" className="text-2xl font-bold text-primary-600 tracking-tight flex-shrink-0">
                        ShopFlow
                    </Link>

                    {/* Desktop Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-2xl relative" ref={searchRef}>
                        <form onSubmit={handleSearch} className="w-full relative flex items-center">
                            <input
                                type="text"
                                placeholder={isListening ? '🎤 Listening... speak now' : 'Search for products, brands and more...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                className={`w-full pl-5 pr-24 py-2.5 bg-gray-50 border rounded-full focus:outline-none focus:border-primary-500 focus:bg-white transition-all text-sm ${
                                    isListening ? 'border-red-400 ring-2 ring-red-200 bg-red-50/30' : 'border-gray-200'
                                }`}
                            />
                            <button type="submit" className="absolute right-10 top-1/2 -translate-y-1/2 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors">
                                <FiSearch size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={handleVoiceSearch}
                                className={`absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-200 ${
                                    isListening
                                        ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40'
                                        : 'bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-600'
                                }`}
                                title="Voice Search"
                            >
                                <FiMic size={16} />
                            </button>
                        </form>

                        {/* Search Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 max-h-[300px] overflow-y-auto w-full">
                                {suggestions.map((product) => (
                                    <button
                                        key={product._id}
                                        onClick={() => {
                                            navigate(`/products/${product._id}`);
                                            setShowSuggestions(false);
                                            setSearchQuery('');
                                        }}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                                    >
                                        <img src={product.image} alt={product.title} className="w-10 h-10 object-cover rounded-md shrink-0" />
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-sm font-semibold text-gray-800 line-clamp-1 truncate">{product.title}</p>
                                            <p className="text-xs text-primary-600 font-bold">₹{product.price.toLocaleString('en-IN')}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
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
                                <div className="absolute top-full right-0 mt-4 w-60 z-50 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
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

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                            aria-label="Toggle dark mode"
                        >
                            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
                        </button>

                        <Link to="/support" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors relative" aria-label="Customer Support">
                            <FiMessageCircle size={22} />
                        </Link>

                        <Link to="/wishlist" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors relative">
                            <FiHeart size={22} />
                            {totalWishlistItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {totalWishlistItems}
                                </span>
                            )}
                        </Link>

                        <Link to="/compare" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors relative" aria-label="Compare Products">
                            <FiLayers size={22} />
                            {compareItems.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {compareItems.length}
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
                                    <div className="absolute top-full right-0 mt-3 w-56 z-50 bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden animate-in fade-in zoom-in duration-200">
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
                        <Link to="/compare" className="relative text-gray-600 hover:text-primary-600 transition-colors">
                            <FiLayers size={24} />
                            {compareItems.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {compareItems.length}
                                </span>
                            )}
                        </Link>
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
                            <div className="relative">
                                <form onSubmit={handleSearch} className="relative">
                                    <input
                                        type="text"
                                        placeholder={isListening ? '🎤 Listening...' : 'Search products...'}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                        className={`w-full pl-4 pr-20 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:border-primary-500 transition-all ${
                                            isListening ? 'border-red-400 ring-2 ring-red-200 bg-red-50/30' : 'border-gray-200'
                                        }`}
                                    />
                                    <button type="submit" className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400">
                                        <FiSearch size={20} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleVoiceSearch}
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-all duration-200 ${
                                            isListening
                                                ? 'bg-red-500 text-white animate-pulse'
                                                : 'text-gray-400 hover:text-primary-600'
                                        }`}
                                        title="Voice Search"
                                    >
                                        <FiMic size={20} />
                                    </button>
                                </form>
                                {/* Search Suggestions Dropdown Mobile */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 max-h-[250px] overflow-y-auto w-full">
                                        {suggestions.map((product) => (
                                            <button
                                                key={product._id}
                                                onClick={() => {
                                                    navigate(`/products/${product._id}`);
                                                    setShowSuggestions(false);
                                                    setIsMenuOpen(false);
                                                    setSearchQuery('');
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 transition-colors border-b border-gray-50 last:border-0"
                                            >
                                                <img src={product.image} alt={product.title} className="w-8 h-8 object-cover rounded-md shrink-0" />
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="text-sm font-semibold text-gray-800 line-clamp-1 truncate">{product.title}</p>
                                                    <p className="text-xs text-primary-600 font-bold">₹{product.price.toLocaleString('en-IN')}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

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

                            {/* Mobile Dark Mode Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium transition-colors"
                            >
                                {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
                                {darkMode ? 'Light Mode' : 'Dark Mode'}
                            </button>

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
