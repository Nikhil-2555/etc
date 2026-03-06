import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    getAdminStats,
    getAllCustomers,
    fetchProducts,
    deleteProduct,
    updateProduct,
    deleteUser,
    getAllOrdersAdmin,
    getAdminAnalytics,
    updateOrderStatus
} from '../../services/api';
import { toast } from 'react-hot-toast';
import {
    FiHome, FiPackage, FiUsers, FiSettings, FiPlus, FiEdit2,
    FiTrash2, FiSearch, FiDollarSign, FiShoppingBag, FiTrendingUp,
    FiArrowUpRight, FiArrowDownRight, FiLogOut, FiMenu, FiX, FiActivity,
    FiUserPlus, FiCreditCard, FiBell, FiShield, FiGlobe, FiSmartphone,
    FiUser, FiMail
} from 'react-icons/fi';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie,
    LineChart, Line, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORY_COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const AdminDashboard = () => {
    const { logout, user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);

    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [adminOrders, setAdminOrders] = useState([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        avgOrder: 0
    });
    const [analytics, setAnalytics] = useState({
        monthlyData: [],
        categoryData: [],
        salesData: [],
        topProducts: [],
        recentOrders: [],
        lowStockProducts: [],
        weeklyData: [],
        dailyData: [],
        metrics: {
            projectedRevenue: 0,
            revenueGrowth: 0,
            conversionRate: 0,
            cartAbandonment: 0
        }
    });
    const [lastRefreshed, setLastRefreshed] = useState(null);

    // Search and modal states
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewProductModal, setShowNewProductModal] = useState(false);
    const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
    const [revenueView, setRevenueView] = useState('monthly'); // for Revenue Analysis: 'monthly' | 'weekly'
    const [growthView, setGrowthView] = useState('daily');     // for Growth Tracker: 'daily' | 'weekly' | 'monthly'

    // Edit product state
    const [showEditProductModal, setShowEditProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Customer detail drawer state
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // New customer form state
    const [newProduct, setNewProduct] = useState({
        title: '',
        price: '',
        category: '',
        stock: '',
        description: '',
        image: ''
    });
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        email: '',
        password: ''
    });

    // Fetch data on mount and poll every 10 seconds for real-time updates
    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(() => {
            fetchDashboardData(true); // silent refresh
        }, 10000); // 10 seconds polling for faster updates

        return () => clearInterval(interval);
    }, []);

    // Refresh analytics data when analytics tab is opened
    useEffect(() => {
        if (activeTab === 'analytics') {
            fetchDashboardData(true);
        }
    }, [activeTab]);



    const fetchDashboardData = async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            }
            const [statsData, productsData, customersData, analyticsData] = await Promise.all([
                getAdminStats(),
                fetchProducts(),
                getAllCustomers(),
                getAdminAnalytics()
            ]);

            setStats(statsData);
            setProducts(productsData);
            setCustomers(customersData);

            // Fetch orders too
            try {
                const ordersData = await getAllOrdersAdmin();
                setAdminOrders(ordersData);
            } catch (_) { /* orders may fail silently */ }

            // Add colors to category data for visualization
            const coloredCategoryData = analyticsData.categoryData.map((cat, index) => ({
                ...cat,
                color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
            }));

            setAnalytics({
                ...analyticsData,
                categoryData: coloredCategoryData
            });
            setLastRefreshed(new Date());
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            if (!silent) {
                toast.error('Failed to load dashboard data');
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteProduct(id);
            setProducts(products.filter(p => p._id !== id));
            toast.success('Product deleted successfully');
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct({
            _id: product._id || product.id,
            title: product.title || product.name || '',
            price: product.price || '',
            category: product.category || '',
            stock: product.stock ?? product.countInStock ?? '',
            description: product.description || '',
            image: product.image || '',
        });
        setShowEditProductModal(true);
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        try {
            const updated = await updateProduct(editingProduct._id, {
                title: editingProduct.title,
                price: Number(editingProduct.price),
                category: editingProduct.category,
                stock: Number(editingProduct.stock),
                description: editingProduct.description,
                image: editingProduct.image,
            });
            setProducts(prev => prev.map(p => (p._id || p.id) === editingProduct._id ? { ...p, ...updated } : p));
            toast.success('Product updated successfully');
            setShowEditProductModal(false);
            setEditingProduct(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update product');
        }
    };

    const handleCreateCustomer = async (e) => {
        e.preventDefault();
        try {
            const { createCustomer } = await import('../../services/api');
            await createCustomer(newCustomer);
            toast.success('Customer added successfully');
            setShowNewCustomerModal(false);
            setNewCustomer({ name: '', email: '', password: '' });
            fetchDashboardData();
        } catch (error) {
            console.error('Error creating customer:', error);
            toast.error(error.response?.data?.message || 'Failed to create customer');
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            const { createProduct } = await import('../../services/api');
            await createProduct(newProduct);
            toast.success('Product created successfully');
            setShowNewProductModal(false);
            setNewProduct({
                title: '',
                price: '',
                category: '',
                stock: '',
                description: '',
                image: ''
            });
            fetchDashboardData();
        } catch (error) {
            console.error('Error creating product:', error);
            toast.error('Failed to create product');
        }
    };

    // Filter products based on search query
    const filteredProducts = products.filter(product => {
        const searchLower = searchQuery.toLowerCase();
        return (
            (product.name || product.title || '').toLowerCase().includes(searchLower) ||
            (product.category || '').toLowerCase().includes(searchLower) ||
            (product._id || product.id || '').toLowerCase().includes(searchLower)
        );
    });

    const sidebarItems = [
        { id: 'overview', label: 'Overview', icon: <FiHome /> },
        { id: 'products', label: 'Products', icon: <FiPackage /> },
        { id: 'orders', label: 'Orders', icon: <FiShoppingBag /> },
        { id: 'customers', label: 'Customers', icon: <FiUsers /> },
        { id: 'analytics', label: 'Analytics', icon: <FiActivity /> },
        { id: 'settings', label: 'Settings', icon: <FiSettings /> },
    ];

    const [settings, setSettings] = useState({
        siteName: 'ShopFlow',
        email: 'admin@shopflow.com',
        notifications: true,
        maintenance: false,
        paymentGateway: 'Stripe',
        currency: 'INR'
    });

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Sidebar Overlay for Mobile */}
            <AnimatePresence>
                {!isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsSidebarOpen(true)}
                        className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex-shrink-0 relative z-30 flex flex-col`}
            >
                <div className="p-6 flex items-center justify-between">
                    {isSidebarOpen && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-2xl font-black bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent"
                        >
                            ShopFlow
                        </motion.span>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        {isSidebarOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-4">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${activeTab === item.id
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            {isSidebarOpen && <span className="font-semibold">{item.label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="p-4 mt-auto border-t border-gray-800">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-4 px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors font-semibold shadow-rose-500/10"
                    >
                        <FiLogOut className="text-xl" />
                        {isSidebarOpen && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
                {/* Navbar/Header */}
                <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100 px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 capitalize">{activeTab.replace(/([A-Z])/g, ' $1')}</h1>
                        <p className="text-sm text-gray-500">Welcome back, {user?.name || 'Admin'}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden sm:block">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={activeTab === 'products' ? "Search products..." : "Search everything..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 w-64 transition-all"
                            />
                        </div>
                        <div className="p-0.5 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500">
                            <img
                                src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=fff&color=6366f1`}
                                className="w-9 h-9 rounded-full border-2 border-white"
                                alt="avatar"
                            />
                        </div>
                    </div>
                </header>

                {/* Dashboard Screens */}
                <div className="p-8 pb-12">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8"
                            >
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        {
                                            title: 'Total Revenue',
                                            value: `₹${stats.totalRevenue?.toLocaleString('en-IN') || '0'}`,
                                            icon: <FiDollarSign />,
                                            trend: '+12.5%',
                                            isUp: true
                                        },
                                        {
                                            title: 'Total Orders',
                                            value: stats.totalOrders || '0',
                                            icon: <FiShoppingBag />,
                                            trend: '+8.2%',
                                            isUp: true
                                        },
                                        {
                                            title: 'Total Customers',
                                            value: stats.totalCustomers || '0',
                                            icon: <FiUsers />,
                                            trend: '+15.3%',
                                            isUp: true
                                        },
                                        {
                                            title: 'Average Order',
                                            value: `₹${stats.avgOrder?.toLocaleString('en-IN') || '0'}`,
                                            icon: <FiTrendingUp />,
                                            trend: '-2.4%',
                                            isUp: false
                                        }
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`p-3 rounded-2xl bg-gray-50 group-hover:bg-primary-50 transition-colors`}>
                                                    <span className={`text-2xl text-gray-600 group-hover:text-primary-600`}>{stat.icon}</span>
                                                </div>
                                                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${stat.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    {stat.isUp ? <FiArrowUpRight /> : <FiArrowDownRight />} {stat.trend}
                                                </div>
                                            </div>
                                            <h4 className="text-gray-500 text-sm font-medium">{stat.title}</h4>
                                            <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Charts Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Sales Area Chart */}
                                    <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-center mb-8">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">Revenue Growth</h3>
                                                <p className="text-sm text-gray-500">Weekly sales data performance</p>
                                            </div>
                                            <select className="bg-gray-50 border-none text-sm font-bold text-gray-600 rounded-xl px-4 py-2">
                                                <option>Last 7 Days</option>
                                                <option>Last 30 Days</option>
                                            </select>
                                        </div>
                                        <div className="h-[400px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={analytics.salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} tickFormatter={(val) => `₹${val / 1000}k`} />
                                                    <Tooltip
                                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                        cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                                                    />
                                                    <Area
                                                        type="monotone"
                                                        dataKey="sales"
                                                        stroke="#6366f1"
                                                        strokeWidth={4}
                                                        fillOpacity={1}
                                                        fill="url(#colorSales)"
                                                        animationDuration={1500}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Pie Chart / Stats Sidebar */}
                                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Category Split</h3>
                                        <p className="text-sm text-gray-500 mb-8">Sales distribution by category</p>
                                        <div className="flex-1 flex flex-col justify-center items-center">
                                            <div className="relative w-full aspect-square max-w-[200px]">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={analytics.categoryData}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={60}
                                                            outerRadius={80}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                        >
                                                            {analytics.categoryData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                                            ))}
                                                        </Pie>
                                                    </PieChart>
                                                </ResponsiveContainer>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                    <span className="text-2xl font-black text-gray-900">
                                                        {analytics.categoryData.reduce((acc, curr) => acc + curr.value, 0)}
                                                    </span>
                                                    <span className="text-[10px] uppercase font-bold text-gray-400">Total</span>
                                                </div>
                                            </div>
                                            <div className="w-full mt-8 space-y-4">
                                                {analytics.categoryData.map((entry, i) => (
                                                    <div key={i} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                                            <span className="text-sm font-bold text-gray-700">{entry.name}</span>
                                                        </div>
                                                        <span className="text-sm font-black text-gray-900">{entry.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Top Products */}
                                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                                        <h3 className="text-xl font-bold text-gray-900 mb-6">Top Selling Products</h3>
                                        <div className="space-y-6">
                                            {analytics.topProducts?.length > 0 ? analytics.topProducts.map((product, i) => (
                                                <div key={i} className="flex items-center gap-4">
                                                    <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                                                        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-gray-900 truncate">{product.title}</h4>
                                                        <p className="text-sm text-gray-500">{product.totalSold} sales</p>
                                                    </div>
                                                    <div className="font-black text-primary-600">
                                                        ₹{product.totalRevenue.toLocaleString('en-IN')}
                                                    </div>
                                                </div>
                                            )) : (
                                                <p className="text-gray-500 text-center py-8">No sales data yet</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Recent Orders */}
                                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                                        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Orders</h3>
                                        <div className="space-y-6">
                                            {analytics.recentOrders?.length > 0 ? analytics.recentOrders.map((order, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-600' :
                                                            order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                                                order.status === 'shipped' ? 'bg-blue-100 text-blue-600' :
                                                                    order.status === 'processing' ? 'bg-indigo-100 text-indigo-600' :
                                                                        'bg-amber-100 text-amber-600'
                                                            }`}>
                                                            {order.user?.name?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-900">{order.user?.name || 'Unknown'}</h4>
                                                            <p className="text-xs text-gray-500 font-medium">#{order._id?.slice(-6).toUpperCase()} • {new Date(order.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-gray-900">₹{order.totalPrice.toLocaleString('en-IN')}</p>
                                                        <span className={`text-[10px] uppercase font-bold tracking-wider ${order.status === 'delivered' ? 'text-emerald-500' :
                                                            order.status === 'cancelled' ? 'text-red-500' :
                                                                order.status === 'shipped' ? 'text-blue-500' :
                                                                    order.status === 'processing' ? 'text-indigo-500' :
                                                                        'text-amber-500'
                                                            }`}>
                                                            {order.status || 'Pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )) : (
                                                <p className="text-gray-500 text-center py-8">No orders yet</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Inventory Health - Low Stock Alerts */}
                                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm mt-8">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-4 bg-rose-50 rounded-2xl text-rose-600">
                                            <FiActivity size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">Inventory Health - Critical Alerts</h3>
                                            <p className="text-sm text-gray-500">Products requiring immediate restocking (less than 10 units remaining)</p>
                                        </div>
                                    </div>

                                    {analytics.lowStockProducts?.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {analytics.lowStockProducts.map((product, i) => (
                                                <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 hover:shadow-lg transition-all hover:border-rose-100 group">
                                                    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 mb-4">
                                                        <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        <div className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
                                                            Low Stock
                                                        </div>
                                                    </div>
                                                    <h4 className="font-bold text-gray-900 truncate mb-2" title={product.title}>{product.title}</h4>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-500">{product.category}</span>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                                            <span className="text-sm font-black text-rose-600">{product.stock} units left</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-rose-500 rounded-full transition-all duration-1000"
                                                            style={{ width: `${(product.stock / 10) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                                            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 text-3xl shadow-lg shadow-emerald-100">
                                                <FiShield />
                                            </div>
                                            <h4 className="text-xl font-bold text-gray-900 mb-2">Inventory Looks Perfect!</h4>
                                            <p className="text-gray-500 max-w-sm">All products are well-stocked. Great job maintaining your inventory levels.</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'products' && (
                            <motion.div
                                key="products"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <h3 className="text-xl font-bold text-gray-900">Inventory Management</h3>
                                    <button
                                        onClick={() => setShowNewProductModal(true)}
                                        className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 flex items-center gap-2 active:scale-95"
                                    >
                                        <FiPlus /> New Product
                                    </button>
                                </div>

                                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-widest">
                                            <tr>
                                                <th className="px-8 py-6 font-black">Product</th>
                                                <th className="px-8 py-6 font-black">Category</th>
                                                <th className="px-8 py-6 font-black">Price</th>
                                                <th className="px-8 py-6 font-black">Stock</th>
                                                <th className="px-8 py-6 font-black text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredProducts?.length > 0 ? filteredProducts.map(product => (
                                                <tr key={product._id || product.id} className="hover:bg-gray-50/80 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <p className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{product.name || product.title || 'N/A'}</p>
                                                        <p className="text-xs text-gray-400 font-mono mt-0.5">#{product._id || product.id}</p>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{product.category || 'N/A'}</span>
                                                    </td>
                                                    <td className="px-8 py-6 font-black text-gray-900">₹{(product.price || 0).toLocaleString('en-IN')}</td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-2 h-2 rounded-full ${(product.stock || product.countInStock || 0) > 20 ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                                                            <span className="text-gray-600 font-bold text-sm">{product.stock || product.countInStock || 0} Units</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleEditProduct(product)}
                                                                className="p-3 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                                                                title="Edit Product"
                                                            >
                                                                <FiEdit2 />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(product._id || product.id)}
                                                                className="p-3 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                                title="Delete Product"
                                                            >
                                                                <FiTrash2 />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="5" className="px-8 py-12 text-center text-gray-500">
                                                        No products found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'orders' && (
                            <motion.div
                                key="orders"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Order Management</h3>
                                        <p className="text-sm text-gray-500 mt-0.5">{adminOrders.length} total orders</p>
                                    </div>
                                    <button
                                        onClick={() => fetchDashboardData(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-primary-50 text-gray-600 hover:text-primary-600 rounded-xl font-bold text-sm transition-all"
                                    >
                                        <FiActivity size={16} /> Refresh
                                    </button>
                                </div>

                                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-widest">
                                            <tr>
                                                <th className="px-6 py-5 font-black">Order ID</th>
                                                <th className="px-6 py-5 font-black">Customer</th>
                                                <th className="px-6 py-5 font-black">Date</th>
                                                <th className="px-6 py-5 font-black">Total</th>
                                                <th className="px-6 py-5 font-black">Status</th>
                                                <th className="px-6 py-5 font-black text-right">Update</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {adminOrders.length > 0 ? adminOrders.map(order => {
                                                const statusColors = {
                                                    pending: 'bg-amber-100 text-amber-700',
                                                    processing: 'bg-indigo-100 text-indigo-700',
                                                    shipped: 'bg-blue-100 text-blue-700',
                                                    delivered: 'bg-emerald-100 text-emerald-700',
                                                    cancelled: 'bg-red-100 text-red-700',
                                                };
                                                return (
                                                    <tr key={order._id} className="hover:bg-gray-50/80 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">#{order._id.slice(-8).toUpperCase()}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="font-bold text-gray-900">{order.user?.name || 'Unknown'}</p>
                                                            <p className="text-xs text-gray-400">{order.user?.email || ''}</p>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </td>
                                                        <td className="px-6 py-4 font-black text-gray-900">
                                                            ₹{order.totalPrice.toLocaleString('en-IN')}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                                                {order.status || 'pending'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                                                <select
                                                                    defaultValue=""
                                                                    onChange={async (e) => {
                                                                        const newStatus = e.target.value;
                                                                        if (!newStatus) return;
                                                                        try {
                                                                            await updateOrderStatus(order._id, newStatus);
                                                                            setAdminOrders(prev => prev.map(o =>
                                                                                o._id === order._id ? { ...o, status: newStatus } : o
                                                                            ));
                                                                            toast.success(`Order updated to ${newStatus}`);
                                                                        } catch (err) {
                                                                            toast.error('Failed to update order status');
                                                                        }
                                                                        e.target.value = '';
                                                                    }}
                                                                    className="text-xs font-bold bg-gray-100 border-none rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-500 cursor-pointer"
                                                                >
                                                                    <option value="">Update Status</option>
                                                                    {order.status === 'pending' && <option value="processing">Processing</option>}
                                                                    {(order.status === 'pending' || order.status === 'processing') && <option value="shipped">Shipped</option>}
                                                                    {(order.status === 'pending' || order.status === 'processing' || order.status === 'shipped') && <option value="delivered">Delivered</option>}
                                                                    {order.status === 'pending' && <option value="cancelled">Cancelled</option>}
                                                                </select>
                                                            )}
                                                            {(order.status === 'delivered' || order.status === 'cancelled') && (
                                                                <span className="text-xs text-gray-400 italic">Finalized</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            }) : (
                                                <tr>
                                                    <td colSpan="6" className="px-8 py-16 text-center">
                                                        <FiShoppingBag className="mx-auto text-4xl text-gray-200 mb-3" />
                                                        <p className="text-gray-400 font-medium">No orders yet</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'customers' && (
                            <motion.div
                                key="customers"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Customer List</h3>
                                        <p className="text-sm text-gray-500 mt-0.5">{customers.length} registered customers</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowNewCustomerModal(true);
                                        }}
                                        className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 flex items-center gap-2 active:scale-95"
                                    >
                                        <FiUserPlus /> Add Customer
                                    </button>
                                </div>

                                <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-widest">
                                            <tr>
                                                <th className="px-8 py-5 font-black">Customer</th>
                                                <th className="px-8 py-5 font-black">Status</th>
                                                <th className="px-8 py-5 font-black">Total Spent</th>
                                                <th className="px-8 py-5 font-black">Orders</th>
                                                <th className="px-8 py-5 font-black">Last Order</th>
                                                <th className="px-8 py-5 font-black text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {customers?.length > 0 ? customers.map(customer => {
                                                const statusStyle = {
                                                    active: 'bg-emerald-100 text-emerald-700',
                                                    inactive: 'bg-gray-100 text-gray-600',
                                                    new: 'bg-blue-100 text-blue-700',
                                                }[customer.status] || 'bg-gray-100 text-gray-600';

                                                const statusDot = {
                                                    active: 'bg-emerald-500',
                                                    inactive: 'bg-gray-400',
                                                    new: 'bg-blue-500',
                                                }[customer.status] || 'bg-gray-400';

                                                return (
                                                    <tr key={customer._id} className="hover:bg-gray-50/80 transition-colors group">
                                                        {/* Customer info */}
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-4">
                                                                <div className="relative">
                                                                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-md">
                                                                        {(customer.name || 'U').charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${statusDot}`} />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{customer.name || 'Unknown'}</p>
                                                                    <p className="text-xs text-gray-400 font-medium">{customer.email || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Status */}
                                                        <td className="px-8 py-5">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusStyle}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${statusDot} animate-pulse`} />
                                                                {customer.status || 'inactive'}
                                                            </span>
                                                        </td>

                                                        {/* Spent */}
                                                        <td className="px-8 py-5">
                                                            <div>
                                                                <p className="font-black text-gray-900 text-base">₹{(customer.totalSpent || 0).toLocaleString('en-IN')}</p>
                                                                {customer.totalSpent > 0 && (
                                                                    <p className="text-[10px] text-emerald-500 font-bold mt-0.5">↑ verified spend</p>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Orders */}
                                                        <td className="px-8 py-5">
                                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-black ${customer.totalOrders > 0 ? 'bg-primary-50 text-primary-700' : 'bg-gray-50 text-gray-400'
                                                                }`}>
                                                                <FiShoppingBag size={13} />
                                                                {customer.totalOrders || 0}
                                                            </div>
                                                        </td>

                                                        {/* Last Order */}
                                                        <td className="px-8 py-5 text-sm text-gray-500">
                                                            {customer.lastOrderDate
                                                                ? new Date(customer.lastOrderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                                                                : <span className="text-gray-300 italic">—</span>
                                                            }
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="px-8 py-5 text-right">
                                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => setSelectedCustomer(customer)}
                                                                    className="px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5 border border-primary-100"
                                                                    title="View Details"
                                                                >
                                                                    <FiUser size={13} /> View
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        try {
                                                                            await deleteUser(customer._id);
                                                                            setCustomers(prev => prev.filter(c => c._id !== customer._id));
                                                                            toast.success('Customer deleted');
                                                                        } catch (err) {
                                                                            toast.error(err.response?.data?.message || 'Failed to delete');
                                                                        }
                                                                    }}
                                                                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                                    title="Delete Customer"
                                                                >
                                                                    <FiTrash2 size={15} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            }) : (
                                                <tr>
                                                    <td colSpan="6" className="px-8 py-16 text-center">
                                                        <FiUsers className="mx-auto text-4xl text-gray-200 mb-3" />
                                                        <p className="text-gray-400 font-medium">No customers found</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Customer Detail Drawer */}
                                {selectedCustomer && (
                                    <div
                                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end"
                                        onClick={() => setSelectedCustomer(null)}
                                    >
                                        <motion.div
                                            initial={{ x: '100%' }}
                                            animate={{ x: 0 }}
                                            exit={{ x: '100%' }}
                                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                                            onClick={e => e.stopPropagation()}
                                            className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto"
                                        >
                                            {/* Drawer Header */}
                                            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-8">
                                                <div className="flex justify-between items-start mb-6">
                                                    <span className="text-primary-100 text-xs font-bold uppercase tracking-widest">Customer Profile</span>
                                                    <button
                                                        onClick={() => setSelectedCustomer(null)}
                                                        className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                                                    >
                                                        <FiX size={16} />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-5">
                                                    <div className="w-18 h-18 w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white font-black text-3xl border-2 border-white/30">
                                                        {(selectedCustomer.name || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h2 className="text-2xl font-black text-white">{selectedCustomer.name}</h2>
                                                        <p className="text-primary-100 text-sm">{selectedCustomer.email}</p>
                                                        <span className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedCustomer.status === 'active' ? 'bg-emerald-400/20 text-emerald-100' :
                                                            selectedCustomer.status === 'new' ? 'bg-blue-400/20 text-blue-100' :
                                                                'bg-white/10 text-white/60'
                                                            }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${selectedCustomer.status === 'active' ? 'bg-emerald-400' :
                                                                selectedCustomer.status === 'new' ? 'bg-blue-400' : 'bg-white/40'
                                                                } animate-pulse`} />
                                                            {selectedCustomer.status || 'inactive'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Drawer Stats */}
                                            <div className="grid grid-cols-2 gap-4 p-6 border-b border-gray-100">
                                                <div className="bg-primary-50 rounded-2xl p-5">
                                                    <p className="text-xs font-black text-primary-400 uppercase tracking-widest mb-1">Total Spent</p>
                                                    <p className="text-2xl font-black text-primary-700">₹{(selectedCustomer.totalSpent || 0).toLocaleString('en-IN')}</p>
                                                </div>
                                                <div className="bg-indigo-50 rounded-2xl p-5">
                                                    <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Total Orders</p>
                                                    <p className="text-2xl font-black text-indigo-700">{selectedCustomer.totalOrders || 0}</p>
                                                </div>
                                            </div>

                                            {/* Drawer Info */}
                                            <div className="p-6 space-y-4">
                                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Account Info</h4>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                                        <span className="text-sm text-gray-500 font-medium">Customer ID</span>
                                                        <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">#{selectedCustomer._id?.slice(-8).toUpperCase()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                                        <span className="text-sm text-gray-500 font-medium">Account Role</span>
                                                        <span className="font-bold text-gray-800 uppercase text-xs bg-gray-100 px-3 py-1 rounded-full">{selectedCustomer.role}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                                        <span className="text-sm text-gray-500 font-medium">Last Order</span>
                                                        <span className="text-sm font-bold text-gray-800">
                                                            {selectedCustomer.lastOrderDate
                                                                ? new Date(selectedCustomer.lastOrderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                                                                : 'No orders yet'
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-3">
                                                        <span className="text-sm text-gray-500 font-medium">Avg. Order Value</span>
                                                        <span className="text-sm font-bold text-gray-800">
                                                            {selectedCustomer.totalOrders > 0
                                                                ? `₹${Math.round(selectedCustomer.totalSpent / selectedCustomer.totalOrders).toLocaleString('en-IN')}`
                                                                : '—'
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                )}

                            </motion.div>
                        )}

                        {activeTab === 'analytics' && (
                            <motion.div
                                key="analytics"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">Revenue Analysis</h3>
                                                <p className="text-sm text-gray-500">Performance compared to previous period</p>
                                            </div>
                                            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                                                <button
                                                    onClick={() => setRevenueView('weekly')}
                                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${revenueView === 'weekly'
                                                        ? 'bg-white text-primary-600 shadow-sm'
                                                        : 'text-gray-600 hover:text-gray-900'
                                                        }`}
                                                >
                                                    Weekly
                                                </button>
                                                <button
                                                    onClick={() => setRevenueView('monthly')}
                                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${revenueView === 'monthly'
                                                        ? 'bg-white text-primary-600 shadow-sm'
                                                        : 'text-gray-600 hover:text-gray-900'
                                                        }`}
                                                >
                                                    Monthly
                                                </button>
                                            </div>
                                        </div>
                                        <div className="h-[350px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={revenueView === 'monthly' ? analytics.monthlyData : analytics.weeklyData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey={revenueView === 'monthly' ? 'month' : 'week'} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} tickFormatter={(val) => `₹${val / 1000}k`} />
                                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                                    <Bar dataKey="revenue" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                                        <div className="flex items-start justify-between mb-5">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">Growth Tracker</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <p className="text-xs text-gray-400 font-medium">
                                                        {lastRefreshed
                                                            ? `Live · Updated ${lastRefreshed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
                                                            : 'Loading...'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                                                    {['daily', 'weekly', 'monthly'].map(v => (
                                                        <button
                                                            key={v}
                                                            onClick={() => setGrowthView(v)}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${growthView === v
                                                                ? 'bg-white text-rose-600 shadow-sm'
                                                                : 'text-gray-500 hover:text-gray-800'
                                                                }`}
                                                        >
                                                            {v}
                                                        </button>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={() => fetchDashboardData(true)}
                                                    className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                                    title="Refresh Now"
                                                >
                                                    <FiActivity size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Summary pills */}
                                        {(() => {
                                            const data = growthView === 'monthly'
                                                ? analytics.monthlyData
                                                : growthView === 'weekly'
                                                    ? analytics.weeklyData
                                                    : analytics.dailyData;
                                            const latestGrowth = data?.length > 1
                                                ? data[data.length - 1]?.growth ?? 0
                                                : 0;
                                            const totalRev = data?.reduce((s, d) => s + (d.revenue || 0), 0) || 0;
                                            return (
                                                <div className="flex gap-3 mb-5">
                                                    <div className="flex-1 bg-rose-50 rounded-2xl px-4 py-3">
                                                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-0.5">Latest Growth</p>
                                                        <p className={`text-lg font-black ${latestGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                            {latestGrowth >= 0 ? '+' : ''}{latestGrowth}%
                                                        </p>
                                                    </div>
                                                    <div className="flex-1 bg-indigo-50 rounded-2xl px-4 py-3">
                                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Period Revenue</p>
                                                        <p className="text-lg font-black text-indigo-700">₹{totalRev.toLocaleString('en-IN')}</p>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        <div className="h-[260px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={
                                                        growthView === 'monthly'
                                                            ? analytics.monthlyData
                                                            : growthView === 'weekly'
                                                                ? analytics.weeklyData
                                                                : analytics.dailyData
                                                    }
                                                    margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                                                >
                                                    <defs>
                                                        <linearGradient id="growthBarGrad" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                                                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.05} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis
                                                        dataKey={growthView === 'monthly' ? 'month' : growthView === 'weekly' ? 'week' : 'day'}
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                                                        dy={8}
                                                        interval={growthView === 'daily' ? Math.floor((analytics.dailyData?.length || 1) / 6) : 0}
                                                    />
                                                    <YAxis
                                                        yAxisId="rev"
                                                        orientation="left"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                                                        dx={-4}
                                                        tickFormatter={v => v === 0 ? '₹0' : `₹${(v / 1000).toFixed(0)}k`}
                                                        width={42}
                                                    />
                                                    <YAxis
                                                        yAxisId="growth"
                                                        orientation="right"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fill: '#f43f5e', fontSize: 10 }}
                                                        dx={4}
                                                        tickFormatter={v => `${v}%`}
                                                        width={36}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{ borderRadius: '14px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: '12px' }}
                                                        formatter={(value, name) => [
                                                            name === 'revenue' ? `₹${Number(value).toLocaleString('en-IN')}` : `${value}%`,
                                                            name === 'revenue' ? 'Revenue' : 'Growth'
                                                        ]}
                                                        labelStyle={{ fontWeight: 700, color: '#374151', marginBottom: 4 }}
                                                    />
                                                    <Bar yAxisId="rev" dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={growthView === 'daily' ? 8 : 28} opacity={0.85} />
                                                    <Line yAxisId="growth" type="monotone" dataKey="growth" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-8 rounded-[2rem] text-white shadow-xl shadow-primary-600/20">
                                        <FiTrendingUp className="text-3xl mb-4 opacity-50" />
                                        <h4 className="text-primary-100 font-medium tracking-wide uppercase text-xs mb-2">Projected Revenue</h4>
                                        <p className="text-3xl font-black mb-4">₹{analytics.metrics.projectedRevenue.toLocaleString('en-IN')}</p>
                                        <div className={`flex items-center gap-2 text-primary-100 text-sm font-bold bg-white/10 w-fit px-3 py-1 rounded-full`}>
                                            {analytics.metrics.revenueGrowth >= 0 ? <FiArrowUpRight /> : <FiArrowDownRight />}
                                            {analytics.metrics.revenueGrowth >= 0 ? '+' : ''}{analytics.metrics.revenueGrowth}%
                                        </div>
                                    </div>

                                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                                        <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600 w-fit mb-4">
                                            <FiActivity className="text-2xl" />
                                        </div>
                                        <h4 className="text-gray-500 font-medium tracking-wide uppercase text-xs mb-2">Conversion Rate</h4>
                                        <p className="text-3xl font-black text-gray-900">{analytics.metrics.conversionRate}%</p>
                                    </div>

                                    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                                        <div className="p-3 bg-amber-100 rounded-xl text-amber-600 w-fit mb-4">
                                            <FiShoppingBag className="text-2xl" />
                                        </div>
                                        <h4 className="text-gray-500 font-medium tracking-wide uppercase text-xs mb-2">Cart Abandonment</h4>
                                        <p className="text-3xl font-black text-gray-900">{analytics.metrics.cartAbandonment}%</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'settings' && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="max-w-4xl mx-auto space-y-8"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="md:col-span-1">
                                        <h3 className="text-xl font-bold text-gray-900">General Settings</h3>
                                        <p className="text-sm text-gray-500 mt-1">Configure your store's identity and basic information.</p>
                                    </div>
                                    <div className="md:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                                        <div>
                                            <label className="block text-sm font-black text-gray-900 uppercase tracking-widest mb-2">Store Name</label>
                                            <input
                                                type="text"
                                                value={settings.siteName}
                                                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-black text-gray-900 uppercase tracking-widest mb-2">Support Email</label>
                                            <input
                                                type="email"
                                                value={settings.email}
                                                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                                className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-primary-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-gray-100">
                                    <div className="md:col-span-1">
                                        <h3 className="text-xl font-bold text-gray-900">Payment & Currency</h3>
                                        <p className="text-sm text-gray-500 mt-1">Manage transactional settings and supported providers.</p>
                                    </div>
                                    <div className="md:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6">
                                        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-white rounded-xl shadow-sm text-primary-600">
                                                    <FiCreditCard size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 uppercase text-xs tracking-widest">Payment Gateway</p>
                                                    <p className="text-sm text-gray-500">{settings.paymentGateway}</p>
                                                </div>
                                            </div>
                                            <button className="text-primary-600 font-black text-xs uppercase tracking-widest hover:underline">Change</button>
                                        </div>

                                        <div className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-white rounded-xl shadow-sm text-emerald-600">
                                                    <FiShield size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 uppercase text-xs tracking-widest">Maintenance Mode</p>
                                                    <p className="text-sm text-gray-500">{settings.maintenance ? 'Enabled' : 'Disabled'}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSettings({ ...settings, maintenance: !settings.maintenance })}
                                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.maintenance ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.maintenance ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4 pt-8">
                                    <button className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-colors">Discard</button>
                                    <button className="px-8 py-4 bg-primary-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-primary-700 shadow-xl shadow-primary-600/20 transition-all active:scale-95">Save Changes</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* New Product Modal */}
            <AnimatePresence>
                {showNewProductModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowNewProductModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-3xl">
                                <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
                                <button
                                    onClick={() => setShowNewProductModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    <FiX className="text-xl" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateProduct} className="p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-black text-gray-900 uppercase tracking-widest mb-2">
                                        Product Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={newProduct.title}
                                        onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-primary-500"
                                        placeholder="Enter product title"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-black text-gray-900 uppercase tracking-widest mb-2">
                                            Price (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={newProduct.price}
                                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-primary-500"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-black text-gray-900 uppercase tracking-widest mb-2">
                                            Stock *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={newProduct.stock}
                                            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-primary-500"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-gray-900 uppercase tracking-widest mb-2">
                                        Category *
                                    </label>
                                    <select
                                        required
                                        value={newProduct.category}
                                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Select a category</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Clothing">Clothing</option>
                                        <option value="Accessories">Accessories</option>
                                        <option value="Footwear">Footwear</option>
                                        <option value="Home & Kitchen">Home & Kitchen</option>
                                        <option value="Sports">Sports</option>
                                        <option value="Books">Books</option>
                                        <option value="Beauty">Beauty</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-gray-900 uppercase tracking-widest mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        rows="4"
                                        value={newProduct.description}
                                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-primary-500 resize-none"
                                        placeholder="Enter product description"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-gray-900 uppercase tracking-widest mb-2">
                                        Image URL
                                    </label>
                                    <input
                                        type="url"
                                        value={newProduct.image}
                                        onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-primary-500"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowNewProductModal(false)}
                                        className="flex-1 px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-8 py-4 bg-primary-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-primary-700 shadow-xl shadow-primary-600/20 transition-all active:scale-95"
                                    >
                                        Create Product
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* New Customer Modal */}
            {showNewCustomerModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowNewCustomerModal(false)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-gray-50 p-8 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Add New Customer</h3>
                            <button
                                onClick={() => setShowNewCustomerModal(false)}
                                className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateCustomer} className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-black text-gray-900 uppercase tracking-widest mb-2">Full Name</label>
                                <div className="relative">
                                    <FiUser className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        value={newCustomer.name}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                                        placeholder="Enter full name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-gray-900 uppercase tracking-widest mb-2">Email Address</label>
                                <div className="relative">
                                    <FiMail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={newCustomer.email}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                                        placeholder="Enter email address"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-black text-gray-900 uppercase tracking-widest mb-2">Password</label>
                                <div className="relative">
                                    <FiSettings className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        value={newCustomer.password}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, password: e.target.value })}
                                        className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                                        placeholder="Enter password"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowNewCustomerModal(false)}
                                    className="flex-1 px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-8 py-4 bg-primary-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-primary-700 shadow-xl shadow-primary-600/20 transition-all active:scale-95"
                                >
                                    Create Customer
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* ── Edit Product Modal ── */}
            {showEditProductModal && editingProduct && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => { setShowEditProductModal(false); setEditingProduct(null); }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-8 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight">Edit Product</h3>
                                <p className="text-primary-100 text-sm mt-1">Update product information</p>
                            </div>
                            <button
                                onClick={() => { setShowEditProductModal(false); setEditingProduct(null); }}
                                className="w-10 h-10 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveProduct} className="p-8 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Title */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Product Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingProduct.title}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                                        className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                        placeholder="Product title"
                                    />
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Price (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={editingProduct.price}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                                        className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                        placeholder="e.g. 1999"
                                    />
                                </div>

                                {/* Stock */}
                                <div>
                                    <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Stock</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={editingProduct.stock}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                                        className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                        placeholder="e.g. 50"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Category</label>
                                    <input
                                        type="text"
                                        required
                                        value={editingProduct.category}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                        className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                        placeholder="e.g. Men's Clothing"
                                    />
                                </div>

                                {/* Image URL */}
                                <div>
                                    <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Image URL</label>
                                    <input
                                        type="text"
                                        value={editingProduct.image}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                                        className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                                        placeholder="https://..."
                                    />
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Description</label>
                                    <textarea
                                        rows={3}
                                        value={editingProduct.description}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                        className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                                        placeholder="Product description..."
                                    />
                                </div>
                            </div>

                            {/* Image Preview */}
                            {editingProduct.image && (
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <img
                                        src={editingProduct.image}
                                        alt="preview"
                                        className="w-16 h-16 object-contain rounded-xl bg-white border border-gray-100 p-1"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    <p className="text-xs text-gray-500 font-medium">Image preview</p>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-4 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setShowEditProductModal(false); setEditingProduct(null); }}
                                    className="flex-1 px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-8 py-4 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:from-primary-700 hover:to-indigo-700 shadow-xl shadow-primary-600/20 transition-all active:scale-95"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

        </div>
    );
};

export default AdminDashboard;
