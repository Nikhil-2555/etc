import { useFormik } from 'formik';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FiMail, FiLock, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useState } from 'react';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validate: values => {
            const errors = {};
            if (!values.email) {
                errors.email = 'Email is required';
            } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
                errors.email = 'Invalid email address';
            }
            if (!values.password) {
                errors.password = 'Password is required';
            } else if (values.password.length < 6) {
                errors.password = 'Password must be at least 6 characters';
            }
            return errors;
        },
        onSubmit: async (values) => {
            setIsLoading(true);
            try {
                const userData = await login(values.email, values.password);
                toast.success('Successfully logged in!');
                const role = userData.role?.toLowerCase() || 'user';
                if (role === 'admin' || role === 'manager') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            } catch (error) {
                const msg = error?.message || 'Failed to login. Please check your credentials.';
                toast.error(msg);
            } finally {
                setIsLoading(false);
            }
        }
    });

    return (
        <div className="login-page">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700&display=swap');

                .login-page {
                    min-height: 100vh;
                    display: flex;
                    font-family: 'Inter', sans-serif;
                    background-color: #f3f4f6;
                }

                .login-left {
                    display: none;
                }

                .login-right {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    background-color: #ffffff;
                }

                @media (min-width: 1024px) {
                    .login-left {
                        display: flex;
                        flex: 1.2;
                        background-image: url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2000&auto=format&fit=crop');
                        background-size: cover;
                        background-position: center;
                        position: relative;
                        align-items: flex-end;
                        padding: 4rem;
                        color: white;
                    }
                    
                    .login-left::before {
                        content: '';
                        position: absolute;
                        inset: 0;
                        background: linear-gradient(to top, rgba(17, 24, 39, 0.95) 0%, rgba(17, 24, 39, 0.4) 50%, rgba(17, 24, 39, 0.1) 100%);
                    }

                    .login-left-content {
                        position: relative;
                        z-index: 10;
                        max-width: 500px;
                    }

                    .login-left-title {
                        font-family: 'Sora', sans-serif;
                        font-size: 3rem;
                        font-weight: 700;
                        margin-bottom: 1rem;
                        line-height: 1.1;
                        letter-spacing: -0.02em;
                    }

                    .login-left-desc {
                        font-size: 1.125rem;
                        color: #e5e7eb;
                        line-height: 1.6;
                    }
                }

                .login-container {
                    width: 100%;
                    max-width: 440px;
                }

                .login-header {
                    margin-bottom: 2.5rem;
                }

                .login-logo {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    text-decoration: none;
                    margin-bottom: 1.5rem;
                }

                .login-logo-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background-color: #111827;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .login-logo-text {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #111827;
                }

                .login-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #111827;
                    margin-bottom: 0.5rem;
                    letter-spacing: -0.02em;
                }

                .login-subtitle {
                    font-size: 1rem;
                    color: #4b5563;
                }


                .form-group {
                    margin-bottom: 1.25rem;
                }

                .form-label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 0.5rem;
                }

                .input-wrapper {
                    position: relative;
                }

                .input-icon {
                    position: absolute;
                    top: 50%;
                    left: 1rem;
                    transform: translateY(-50%);
                    color: #9ca3af;
                    pointer-events: none;
                    transition: color 0.2s ease;
                }

                .form-input {
                    width: 100%;
                    padding: 0.875rem 1rem 0.875rem 2.75rem;
                    background: #ffffff;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.95rem;
                    color: #111827;
                    transition: all 0.2s ease;
                }

                .form-input:hover {
                    border-color: #9ca3af;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #2563eb;
                    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
                }

                .form-input:focus + .input-icon,
                .input-wrapper:focus-within .input-icon {
                    color: #2563eb;
                }

                .form-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 1.5rem;
                    margin-top: 0.5rem;
                }

                .remember-label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }

                .remember-checkbox {
                    width: 1rem;
                    height: 1rem;
                    border-radius: 4px;
                    border: 1px solid #d1d5db;
                    accent-color: #2563eb;
                    cursor: pointer;
                }

                .remember-text {
                    font-size: 0.875rem;
                    color: #4b5563;
                }

                .forgot-link {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #2563eb;
                    text-decoration: none;
                }

                .forgot-link:hover {
                    text-decoration: underline;
                }

                .login-btn {
                    width: 100%;
                    padding: 0.875rem;
                    background: #111827;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-family: 'Inter', sans-serif;
                    font-size: 1rem;
                    font-weight: 600;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }

                .login-btn:hover:not(:disabled) {
                    background: #1f2937;
                }

                .login-btn:disabled {
                    background: #9ca3af;
                    cursor: not-allowed;
                }

                .login-footer {
                    margin-top: 2rem;
                    text-align: center;
                }

                .login-footer-text {
                    font-size: 0.95rem;
                    color: #4b5563;
                }

                .login-footer-link {
                    font-weight: 600;
                    color: #2563eb;
                    text-decoration: none;
                    margin-left: 0.25rem;
                }

                .login-footer-link:hover {
                    text-decoration: underline;
                }

                .field-error {
                    display: block;
                    color: #ef4444;
                    font-size: 0.75rem;
                    font-weight: 500;
                    margin-top: 0.375rem;
                    animation: shakeIn 0.3s ease;
                }

                .form-input.input-error {
                    border-color: #ef4444;
                    background-color: #fef2f2;
                }

                .form-input.input-error:focus {
                    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
                    border-color: #ef4444;
                }

                @keyframes shakeIn {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }

                .spinner {
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 0.6s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>

            <div className="login-left">
                <div className="login-left-content">
                    <h1 className="login-left-title">Premium Goods, Effortless Experience.</h1>
                    <p className="login-left-desc">Join ShopFlow to discover curated products, seamless checkout, and exclusive member benefits designed just for you.</p>
                </div>
            </div>

            <div className="login-right">
                <div className="login-container">
                    <div className="login-header">
                        <Link to="/" className="login-logo">
                            <div className="login-logo-icon">
                                <FiShoppingBag size={22} />
                            </div>
                            <span className="login-logo-text">ShopFlow</span>
                        </Link>
                        <h2 className="login-title">Welcome Back</h2>
                        <p className="login-subtitle">Sign in to your account to continue</p>
                    </div>



                    <form onSubmit={formik.handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">Email Address</label>
                            <div className="input-wrapper">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`form-input ${formik.touched.email && formik.errors.email ? 'input-error' : ''}`}
                                    placeholder="you@example.com"
                                />
                                <div className="input-icon">
                                    <FiMail size={18} />
                                </div>
                            </div>
                            {formik.touched.email && formik.errors.email && <span className="field-error">{formik.errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">Password</label>
                            <div className="input-wrapper">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`form-input ${formik.touched.password && formik.errors.password ? 'input-error' : ''}`}
                                    placeholder="Enter your password"
                                />
                                <div className="input-icon">
                                    <FiLock size={18} />
                                </div>
                            </div>
                            {formik.touched.password && formik.errors.password && <span className="field-error">{formik.errors.password}</span>}
                        </div>

                        <div className="form-row">
                            <label className="remember-label">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="remember-checkbox"
                                />
                                <span className="remember-text">Remember me</span>
                            </label>
                            <a href="#" className="forgot-link">Forgot password?</a>
                        </div>

                        <button type="submit" className="login-btn" disabled={isLoading}>
                            {isLoading ? (
                                <div className="spinner" />
                            ) : (
                                <>
                                    Log In
                                    <FiArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p className="login-footer-text">
                            Don't have an account?
                            <Link to="/signup" className="login-footer-link">
                                Create account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
