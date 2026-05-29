import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiInstagram, FiMail, FiArrowRight } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="relative bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 pt-20 pb-10 overflow-hidden transition-colors duration-300">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-[30%] h-[50%] bg-primary-100/40 dark:bg-primary-900/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[30%] h-[50%] bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
                    {/* Brand Section */}
                    <div className="lg:col-span-4 space-y-6">
                        <h3 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-blue-600 dark:from-primary-400 dark:to-blue-400 tracking-tight flex items-center gap-2">
                            ShopFlow
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-sm">
                            Experience the future of shopping with our premium curated collection of lifestyle essentials. Designed for those who demand excellence.
                        </p>
                        <div className="flex space-x-3 pt-2">
                            <a href="#" className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-white hover:text-primary-600 dark:hover:text-primary-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <FiGithub size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-white hover:text-blue-500 dark:hover:text-blue-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <FiTwitter size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-white hover:text-pink-500 dark:hover:text-pink-400 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                <FiInstagram size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Links Section 1 */}
                    <div className="lg:col-span-2">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider text-xs">Shop Categories</h4>
                        <ul className="space-y-3 flex flex-col">
                            {['All Products', 'Electronics', 'Clothing', 'Furniture'].map((item) => (
                                <Link key={item} to={`/products${item !== 'All Products' ? `?category=${item.toLowerCase()}` : ''}`} className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:translate-x-1 transition-all duration-300 w-fit">
                                    {item}
                                </Link>
                            ))}
                        </ul>
                    </div>

                    {/* Links Section 2 */}
                    <div className="lg:col-span-2">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider text-xs">Support & Help</h4>
                        <ul className="space-y-3 flex flex-col">
                            {[
                                { name: 'Browse Products', path: '/products' },
                                { name: 'Sales & Deals', path: '/sales' },
                                { name: 'Shopping Cart', path: '/cart' },
                                { name: 'Admin Portal', path: '/admin/login' }
                            ].map((item) => (
                                <Link key={item.name} to={item.path} className={`text-sm hover:translate-x-1 transition-all duration-300 w-fit ${item.name === 'Admin Portal' ? 'text-primary-600/70 hover:text-primary-600 dark:text-primary-400/70 font-semibold' : 'text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'}`}>
                                    {item.name}
                                </Link>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter Section */}
                    <div className="lg:col-span-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <FiMail className="text-primary-500" /> Stay in the loop
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
                            Subscribe to our newsletter for exclusive offers, early access to new collections, and styling tips.
                        </p>
                        <div className="relative group">
                            <input 
                                type="email" 
                                placeholder="Enter your email address" 
                                className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3.5 pr-12 text-sm focus:outline-none focus:border-primary-500 dark:focus:border-primary-500 dark:text-white transition-colors shadow-sm group-hover:shadow-md" 
                            />
                            <button className="absolute right-1.5 top-1.5 bottom-1.5 aspect-square bg-gradient-to-br from-primary-500 to-blue-600 hover:from-primary-600 hover:to-blue-700 text-white rounded-lg flex items-center justify-center transition-all shadow-md active:scale-95">
                                <FiArrowRight />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                        © {new Date().getFullYear()} ShopFlow Inc. All rights reserved.
                    </p>
                    <div className="flex items-center space-x-6">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-3.5 opacity-40 hover:opacity-100 transition-opacity dark:invert" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5 opacity-40 hover:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
