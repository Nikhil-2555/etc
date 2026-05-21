import { useFormik } from 'formik';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

const Signup = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        },
        validate: values => {
            const errors = {};
            if (values.password !== values.confirmPassword) {
                errors.confirmPassword = 'Passwords do not match';
            }
            if (values.password.length < 6) {
                errors.password = 'Password must be at least 6 characters';
            }
            return errors;
        },
        onSubmit: async (values) => {
            try {
                await register(values.name, values.email, values.password);
                toast.success('Account created successfully!');
                navigate('/');
            } catch (error) {
                toast.error('Failed to create account. Please try again.');
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
                        Create Account
                    </h2>
                    <p className="text-sm text-gray-500">
                        Join us and start shopping smarter today
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                    <form className="space-y-4" onSubmit={formik.handleSubmit}>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <FiUser size={18} />
                                </div>
                                <input
                                    id="name" name="name" type="text" required
                                    value={formik.values.name} onChange={formik.handleChange}
                                    className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <FiMail size={18} />
                                </div>
                                <input
                                    id="email" name="email" type="email" required
                                    value={formik.values.email} onChange={formik.handleChange}
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
                                    id="password" name="password" type="password" required
                                    value={formik.values.password} onChange={formik.handleChange}
                                    className={`block w-full pl-11 pr-4 py-3 bg-white border ${formik.errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500/20'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all text-sm`}
                                    placeholder="Create a strong password"
                                />
                            </div>
                            {formik.errors.password && <p className="mt-1 text-xs text-red-500 ml-1">{formik.errors.password}</p>}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <FiLock size={18} />
                                </div>
                                <input
                                    id="confirmPassword" name="confirmPassword" type="password" required
                                    value={formik.values.confirmPassword} onChange={formik.handleChange}
                                    className={`block w-full pl-11 pr-4 py-3 bg-white border ${formik.errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500/20'} rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all text-sm`}
                                    placeholder="Confirm your password"
                                />
                            </div>
                            {formik.errors.confirmPassword && <p className="mt-1 text-xs text-red-500 ml-1">{formik.errors.confirmPassword}</p>}
                        </div>

                        <div className="flex items-start pt-1">
                            <input
                                id="terms" name="terms" type="checkbox" required
                                className="h-4 w-4 border-gray-300 rounded text-primary-600 focus:ring-primary-500 cursor-pointer mt-0.5"
                            />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-500 cursor-pointer">
                                I agree to the <a href="#" className="font-medium text-primary-600 hover:text-primary-700">Terms of Service</a> and <a href="#" className="font-medium text-primary-600 hover:text-primary-700">Privacy Policy</a>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 mt-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-primary-600 transition-colors shadow-sm"
                        >
                            Create Account
                            <FiArrowRight size={16} />
                        </button>
                    </form>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                            Sign in instead
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
