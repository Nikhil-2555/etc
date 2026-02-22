import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiInstagram } from 'react-icons/fi';

const Footer = () => {
    return (
        <footer className="bg-gray-50 border-t border-gray-100 pt-16 pb-12">
            <div className="max-w-[1600px] mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-primary-600 tracking-tight">ShopFlow</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Experience the future of shopping with our premium curated collection of lifestyle essentials.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 mb-6">Shop</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link to="/products" className="hover:text-primary-600 transition-colors">All Products</Link></li>
                            <li><Link to="/products?category=electronics" className="hover:text-primary-600 transition-colors">Electronics</Link></li>
                            <li><Link to="/products?category=fashion" className="hover:text-primary-600 transition-colors">Fashion</Link></li>
                            <li><Link to="/products?category=home" className="hover:text-primary-600 transition-colors">Home & Living</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 mb-6">Support</h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link to="/contact" className="hover:text-primary-600 transition-colors">Contact Us</Link></li>
                            <li><Link to="/faq" className="hover:text-primary-600 transition-colors">FAQs</Link></li>
                            <li><Link to="/shipping" className="hover:text-primary-600 transition-colors">Shipping & Returns</Link></li>
                            <li><Link to="/privacy" className="hover:text-primary-600 transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/admin/login" className="hover:text-primary-600 transition-colors font-medium text-gray-400">Admin Access</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 mb-6">Connect</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-primary-600 hover:shadow-md transition-all">
                                <FiGithub size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-blue-400 hover:shadow-md transition-all">
                                <FiTwitter size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-pink-500 hover:shadow-md transition-all">
                                <FiInstagram size={20} />
                            </a>
                        </div>
                        <div className="mt-6">
                            <p className="text-sm text-gray-500 mb-2">Subscribe to our newsletter</p>
                            <div className="flex">
                                <input type="email" placeholder="Enter your email" className="bg-white border border-gray-200 rounded-l-lg px-4 py-2 text-sm focus:outline-none focus:border-primary-500 w-full" />
                                <button className="bg-primary-600 text-white px-4 py-2 rounded-r-lg text-sm font-medium hover:bg-primary-700 transition-colors">Subscribe</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-gray-400">© 2026 ShopFlow. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 -mt-1 opacity-50 grayscale hover:grayscale-0 transition-all" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
