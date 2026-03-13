import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FiLock, FiShield, FiArrowRight, FiActivity } from 'react-icons/fi';
import { motion } from 'framer-motion';

const AdminLogin = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        onSubmit: async (values) => {
            try {
                const userData = await login(values.email, values.password);

                if (userData.role === 'admin' || userData.role === 'manager') {
                    toast.success('Welcome back, Admin!');
                    navigate('/admin');
                } else {
                    toast.error('Access Denied: You do not have admin privileges.');
                    // Optionally logout immediately if you don't want them logged in as user here
                }
            } catch (error) {
                toast.error('Invalid admin credentials.');
            }
        }
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-700"
            >
                <div className="p-8 sm:p-12">
                    <div className="text-center mb-10">
                        <div className="mx-auto w-16 h-16 bg-primary-600/20 rounded-2xl flex items-center justify-center mb-6 text-primary-500">
                            <FiShield size={32} />
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                            Admin Portal
                        </h2>
                        <p className="text-gray-400">
                            Secure access for store management
                        </p>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                                    <FiActivity />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    onChange={formik.handleChange}
                                    value={formik.values.email}
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                                    placeholder="admin@shop.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                                    <FiLock />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    onChange={formik.handleChange}
                                    value={formik.values.password}
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-lg transition-all transform hover:-translate-y-1 hover:shadow-lg shadow-primary-600/30"
                        >
                            Access Dashboard <FiArrowRight />
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            Restricted area. Unauthorized access is monitored.
                        </p>
                    </div>
                </div>

                <div className="h-2 bg-gradient-to-r from-primary-600 via-purple-600 to-indigo-600"></div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
