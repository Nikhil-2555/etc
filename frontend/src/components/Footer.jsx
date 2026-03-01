import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiInstagram } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-16 pb-12 transition-colors duration-300">
            <div className="max-w-[1600px] mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-primary-600 tracking-tight">ShopFlow</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                            Experience the future of shopping with our premium curated collection of lifestyle essentials.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-6">Shop</h4>
                        <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
                            <li><Link to="/products" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">All Products</Link></li>
                            <li><Link to="/products?category=electronics" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Electronics</Link></li>
                            <li><Link to="/products?category=clothing" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Clothing</Link></li>
                            <li><Link to="/products?category=furniture" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Furniture</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-6">Support</h4>
                        <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
                            <li><Link to="/products" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Browse Products</Link></li>
                            <li><Link to="/sales" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Sales & Deals</Link></li>
                            <li><Link to="/cart" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Shopping Cart</Link></li>
                            <li><Link to="/admin/login" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium text-gray-400 dark:text-gray-500">Admin Access</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-6">Connect</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm dark:shadow-none dark:border dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:shadow-md transition-all">
                                <FiGithub size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm dark:shadow-none dark:border dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-blue-400 hover:shadow-md transition-all">
                                <FiTwitter size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm dark:shadow-none dark:border dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-pink-500 hover:shadow-md transition-all">
                                <FiInstagram size={20} />
                            </a>
                        </div>
                        <div className="mt-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Subscribe to our newsletter</p>
                            <div className="flex">
                                <input type="email" placeholder="Enter your email" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-l-lg px-4 py-2 text-sm focus:outline-none focus:border-primary-500 w-full dark:text-gray-200 dark:placeholder-gray-500" />
                                <button className="bg-primary-600 text-white px-4 py-2 rounded-r-lg text-sm font-medium hover:bg-primary-700 transition-colors">Subscribe</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-gray-400 dark:text-gray-500">© 2026 ShopFlow. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all dark:invert" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 -mt-1 opacity-50 grayscale hover:grayscale-0 transition-all" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
