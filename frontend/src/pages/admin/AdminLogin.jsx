import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FiLock, FiShield, FiArrowRight, FiActivity } from 'react-icons/fi';

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
                }
            } catch (error) {
                toast.error('Invalid admin credentials.');
            }
        }
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12">
            <div className="w-full max-w-[420px]">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-12 h-12 mb-5 rounded-xl bg-primary-600 flex items-center justify-center">
                        <FiShield size={24} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                        Admin Portal
                    </h2>
                    <p className="text-sm text-gray-400">
                        Secure access for store management
                    </p>
                </div>

                {/* Card */}
                <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8">
                    <form onSubmit={formik.handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                                    <FiActivity size={18} />
                                </div>
                                <input
                                    type="email" name="email" required
                                    value={formik.values.email} onChange={formik.handleChange}
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm"
                                    placeholder="admin@shop.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                                    <FiLock size={18} />
                                </div>
                                <input
                                    type="password" name="password" required
                                    value={formik.values.password} onChange={formik.handleChange}
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 mt-2 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
                        >
                            Access Dashboard <FiArrowRight size={16} />
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-gray-700 text-center">
                        <p className="text-xs text-gray-500">
                            Restricted area. Unauthorized access is monitored.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
