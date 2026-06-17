import { useFormik } from 'formik';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useState } from 'react';

const Signup = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const formik = useFormik({
        initialValues: { name: '', email: '', password: '', confirmPassword: '' },
        validate: values => {
            const errors = {};
            if (!values.name) {
                errors.name = 'Full name is required';
            } else if (values.name.trim().length < 2) {
                errors.name = 'Name must be at least 2 characters';
            }
            if (!values.email) {
                errors.email = 'Email is required';
<<<<<<< HEAD
            } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email.trim())) {
=======
            } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
>>>>>>> ac794f6acd6f07d555238c252853f4601e063236
                errors.email = 'Invalid email address';
            }
            if (!values.password) {
                errors.password = 'Password is required';
            } else if (values.password.length < 6) {
                errors.password = 'Password must be at least 6 characters';
            }
            if (!values.confirmPassword) {
                errors.confirmPassword = 'Please confirm your password';
            } else if (values.password !== values.confirmPassword) {
                errors.confirmPassword = 'Passwords do not match';
            }
            return errors;
        },
        onSubmit: async (values) => {
            setIsLoading(true);
            try {
<<<<<<< HEAD
                await register(values.name.trim(), values.email.trim(), values.password);
=======
                await register(values.name, values.email, values.password);
>>>>>>> ac794f6acd6f07d555238c252853f4601e063236
                toast.success('Account created successfully!');
                navigate('/');
            } catch (error) {
                const msg = error?.message || 'Failed to create account. Please try again.';
                toast.error(msg);
            } finally { setIsLoading(false); }
        }
    });

    return (
        <div className="signup-page">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700&display=swap');

                .signup-page {
                    min-height: 100vh;
                    display: flex;
                    font-family: 'Inter', sans-serif;
                    background-color: #f3f4f6;
                }

                .signup-left {
                    display: none;
                }

                .signup-right {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    background-color: #ffffff;
                }

                @media (min-width: 1024px) {
                    .signup-left {
                        display: flex;
                        flex: 1.2;
                        background-image: url('https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=2000&auto=format&fit=crop');
                        background-size: cover;
                        background-position: center;
                        position: relative;
                        align-items: flex-end;
                        padding: 4rem;
                        color: white;
                    }
                    
                    .signup-left::before {
                        content: '';
                        position: absolute;
                        inset: 0;
                        background: linear-gradient(to top, rgba(17, 24, 39, 0.95) 0%, rgba(17, 24, 39, 0.4) 50%, rgba(17, 24, 39, 0.1) 100%);
                    }

                    .signup-left-content {
                        position: relative;
                        z-index: 10;
                        max-width: 500px;
                    }

                    .signup-left-title {
                        font-family: 'Sora', sans-serif;
                        font-size: 3rem;
                        font-weight: 700;
                        margin-bottom: 1rem;
                        line-height: 1.1;
                        letter-spacing: -0.02em;
                    }

                    .signup-left-desc {
                        font-size: 1.125rem;
                        color: #e5e7eb;
                        line-height: 1.6;
                    }
                }

                .signup-container {
                    width: 100%;
                    max-width: 440px;
                }

                .signup-header {
                    margin-bottom: 2rem;
                }

                .signup-logo {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    text-decoration: none;
                    margin-bottom: 1.5rem;
                }

                .signup-logo-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background-color: #111827;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .signup-logo-text {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #111827;
                }

                .signup-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #111827;
                    margin-bottom: 0.5rem;
                    letter-spacing: -0.02em;
                }

                .signup-subtitle {
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

                .error-message {
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

                .signup-btn {
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
                    margin-top: 1.5rem;
                    transition: background-color 0.2s ease;
                }

                .signup-btn:hover:not(:disabled) {
                    background: #1f2937;
                }

                .signup-btn:disabled {
                    background: #9ca3af;
                    cursor: not-allowed;
                }

                .signup-footer {
                    margin-top: 1.5rem;
                    text-align: center;
                }

                .signup-footer-text {
                    font-size: 0.95rem;
                    color: #4b5563;
                }

                .signup-footer-link {
                    font-weight: 600;
                    color: #2563eb;
                    text-decoration: none;
                    margin-left: 0.25rem;
                }

                .signup-footer-link:hover {
                    text-decoration: underline;
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

                @media (max-width: 480px) {
                    .signup-title { font-size: 1.5rem; }
                }
            `}</style>

            <div className="signup-left">
                <div className="signup-left-content">
                    <h1 className="signup-left-title">Start Your Journey.</h1>
                    <p className="signup-left-desc">Join millions of shoppers discovering unique products and personalized deals every day.</p>
                </div>
            </div>

            <div className="signup-right">
                <div className="signup-container">
                    <div className="signup-header">
                        <Link to="/" className="signup-logo">
                            <div className="signup-logo-icon">
                                <FiShoppingBag size={22} />
                            </div>
                            <span className="signup-logo-text">ShopFlow</span>
                        </Link>
                        <h2 className="signup-title">Create Account</h2>
                        <p className="signup-subtitle">Join us and start shopping smarter today</p>
                    </div>

                    <form onSubmit={formik.handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">Full Name</label>
                            <div className="input-wrapper">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`form-input ${formik.touched.name && formik.errors.name ? 'input-error' : ''}`}
                                    placeholder="John Doe"
                                />
                                <div className="input-icon"><FiUser size={18} /></div>
                            </div>
                            {formik.touched.name && formik.errors.name && <span className="error-message">{formik.errors.name}</span>}
                        </div>

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
                                <div className="input-icon"><FiMail size={18} /></div>
                            </div>
                            {formik.touched.email && formik.errors.email && <span className="error-message">{formik.errors.email}</span>}
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
                                    placeholder="Create a strong password"
                                />
                                <div className="input-icon"><FiLock size={18} /></div>
                            </div>
                            {formik.touched.password && formik.errors.password && <span className="error-message">{formik.errors.password}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                            <div className="input-wrapper">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={formik.values.confirmPassword}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`form-input ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'input-error' : ''}`}
                                    placeholder="Confirm your password"
                                />
                                <div className="input-icon"><FiLock size={18} /></div>
                            </div>
                            {formik.touched.confirmPassword && formik.errors.confirmPassword && <span className="error-message">{formik.errors.confirmPassword}</span>}
                        </div>

                        <button type="submit" className="signup-btn" disabled={isLoading}>
                            {isLoading ? (
                                <div className="spinner" />
                            ) : (
                                <>
                                    Create Account
                                    <FiArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="signup-footer">
                        <p className="signup-footer-text">
                            Already have an account?
                            <Link to="/login" className="signup-footer-link">
                                Sign in instead
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
