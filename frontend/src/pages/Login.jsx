import { useFormik } from 'formik';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FiMail, FiLock, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            email: 'user@shop.com',
            password: 'password123'
        },
        onSubmit: async (values) => {
            try {
                const userData = await login(values.email, values.password);
                toast.success('Successfully logged in!');
                const role = userData.role?.toLowerCase() || 'user';
                if (role === 'admin' || role === 'manager') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            } catch (error) {
                toast.error('Failed to login. Please try again.');
            }
        }
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-[420px]">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
                            <FiShoppingBag size={20} className="text-white" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900 tracking-tight">ShopFlow</span>
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        Welcome Back
                    </h2>
                    <p className="text-sm text-gray-500">
                        Sign in to continue your shopping journey
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                    {/* Demo Quick Login */}
                    <div className="mb-6 p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest text-center mb-2">Quick Demo Access</p>
                        <div className="flex gap-2">
                            {['admin', 'manager', 'user'].map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => formik.setValues({ email: `${role}@shop.com`, password: 'password123' })}
                                    className="flex-1 py-1.5 px-2 bg-white text-gray-600 text-xs font-medium rounded-lg border border-gray-200 hover:border-primary-300 hover:text-primary-600 transition-colors capitalize"
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Form */}
                    <form className="space-y-5" onSubmit={formik.handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <FiMail size={18} />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <FiLock size={18} />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 border-gray-300 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-500 cursor-pointer">
                                    Remember me
                                </label>
                            </div>
                            <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                                Forgot password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-primary-600 transition-colors shadow-sm"
                        >
                            Log In
                            <FiArrowRight size={16} />
                        </button>
                    </form>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        Don't have an account?{' '}
                        <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
