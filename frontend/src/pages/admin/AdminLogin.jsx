import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FiLock, FiShield, FiArrowRight, FiMail } from 'react-icons/fi';
import { useState } from 'react';

const AdminLogin = () => {
    const { login, logout } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(() => {
        return localStorage.getItem('shopflow_admin_remember_me') === 'true';
    });

    const formik = useFormik({
        initialValues: { 
            email: localStorage.getItem('shopflow_admin_saved_email') || '', 
            password: localStorage.getItem('shopflow_admin_saved_password') || '' 
        },
        validate: values => {
            const errors = {};
            if (!values.email) {
                errors.email = 'Email is required';
            } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email.trim())) {
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
                const userData = await login(values.email.trim(), values.password);
                if (userData.role === 'admin' || userData.role === 'manager') {
                    if (rememberMe) {
                        localStorage.setItem('shopflow_admin_remember_me', 'true');
                        localStorage.setItem('shopflow_admin_saved_email', values.email.trim());
                        localStorage.setItem('shopflow_admin_saved_password', values.password);
                    } else {
                        localStorage.removeItem('shopflow_admin_remember_me');
                        localStorage.removeItem('shopflow_admin_saved_email');
                        localStorage.removeItem('shopflow_admin_saved_password');
                    }
                    toast.success('Welcome back, Admin!');
                    navigate('/admin');
                } else {
                    // Log out the non-admin user so they don't stay in a bad state
                    logout();
                    toast.error('Access Denied: You do not have admin privileges.');
                }
            } catch (error) {
                const msg = error?.message || 'Invalid admin credentials.';
                toast.error(msg);
            } finally { setIsLoading(false); }
        }
    });

    return (
        <div className="admin-page">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700&display=swap');

                .admin-page {
                    min-height: 100vh;
                    display: flex;
                    font-family: 'Inter', sans-serif;
                    background-color: #0f172a;
                }

                .admin-left {
                    display: none;
                }

                .admin-right {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    background-color: #ffffff;
                }

                @media (min-width: 1024px) {
                    .admin-left {
                        display: flex;
                        flex: 1.2;
                        background-image: url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop');
                        background-size: cover;
                        background-position: center;
                        position: relative;
                        align-items: flex-end;
                        padding: 4rem;
                        color: white;
                    }
                    
                    .admin-left::before {
                        content: '';
                        position: absolute;
                        inset: 0;
                        background: linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.5) 50%, rgba(15, 23, 42, 0.2) 100%);
                    }

                    .admin-left-content {
                        position: relative;
                        z-index: 10;
                        max-width: 500px;
                    }

                    .admin-left-title {
                        font-family: 'Sora', sans-serif;
                        font-size: 3rem;
                        font-weight: 700;
                        margin-bottom: 1rem;
                        line-height: 1.1;
                        letter-spacing: -0.02em;
                    }

                    .admin-left-desc {
                        font-size: 1.125rem;
                        color: #94a3b8;
                        line-height: 1.6;
                    }
                }

                .admin-container {
                    width: 100%;
                    max-width: 440px;
                }

                .admin-header {
                    margin-bottom: 2.5rem;
                }

                .admin-icon-wrap {
                    width: 56px;
                    height: 56px;
                    border-radius: 12px;
                    background-color: #0f172a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    margin-bottom: 1.5rem;
                }

                .admin-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 0.5rem;
                    letter-spacing: -0.02em;
                }

                .admin-subtitle {
                    font-size: 1rem;
                    color: #475569;
                }

                .form-group {
                    margin-bottom: 1.25rem;
                }

                .form-label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #334155;
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
                    color: #94a3b8;
                    pointer-events: none;
                    transition: color 0.2s ease;
                }

                .form-input {
                    width: 100%;
                    padding: 0.875rem 1rem 0.875rem 2.75rem;
                    background: #f8fafc;
                    border: 1px solid #cbd5e1;
                    border-radius: 8px;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.95rem;
                    color: #0f172a;
                    transition: all 0.2s ease;
                }

                .form-input:hover {
                    border-color: #94a3b8;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #0f172a;
                    background: #ffffff;
                    box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1);
                }

                .form-input:focus + .input-icon,
                .input-wrapper:focus-within .input-icon {
                    color: #0f172a;
                }

                .remember-label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    margin-bottom: 1.5rem;
                }

                .remember-checkbox {
                    width: 1rem;
                    height: 1rem;
                    border-radius: 4px;
                    border: 1px solid #cbd5e1;
                    accent-color: #0f172a;
                    cursor: pointer;
                }

                .remember-text {
                    font-size: 0.875rem;
                    color: #475569;
                }

                .admin-btn {
                    width: 100%;
                    padding: 0.875rem;
                    background: #0f172a;
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
                    margin-top: 2rem;
                    transition: background-color 0.2s ease;
                }

                .admin-btn:hover:not(:disabled) {
                    background: #1e293b;
                }

                .admin-btn:disabled {
                    background: #64748b;
                    cursor: not-allowed;
                }

                .admin-divider {
                    margin-top: 2rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #e2e8f0;
                    text-align: center;
                }

                .admin-footer-text {
                    font-size: 0.8125rem;
                    color: #64748b;
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

                @media (max-width: 480px) {
                    .admin-title { font-size: 1.5rem; }
                }

                .dark .admin-right {
                    background-color: #0f172a;
                }
                .dark .admin-title {
                    color: #ffffff;
                }
                .dark .admin-subtitle {
                    color: #cbd5e1;
                }
                .dark .form-label {
                    color: #e2e8f0;
                }
                .dark .form-input {
                    background: #1e293b;
                    border-color: #334155;
                    color: #ffffff;
                }
                .dark .form-input:focus {
                    border-color: #6366f1;
                    background: #0f172a;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
                }
                .dark .form-input:focus + .input-icon,
                .dark .input-wrapper:focus-within .input-icon {
                    color: #6366f1;
                }
                .dark .remember-text {
                    color: #cbd5e1;
                }
                .dark .remember-checkbox {
                    border-color: #334155;
                    accent-color: #6366f1;
                }
                .dark .admin-btn {
                    background: #6366f1;
                }
                .dark .admin-divider {
                    border-color: #334155;
                }
            `}</style>

            <div className="admin-left">
                <div className="admin-left-content">
                    <h1 className="admin-left-title">ShopFlow Command Center.</h1>
                    <p className="admin-left-desc">Secure access for authorized personnel. Manage inventory, process orders, and oversee business operations from a single dashboard.</p>
                </div>
            </div>

            <div className="admin-right">
                <div className="admin-container">
                    <div className="admin-header">
                        <div className="admin-icon-wrap">
                            <FiShield size={24} />
                        </div>
                        <h2 className="admin-title">Admin Portal</h2>
                        <p className="admin-subtitle">Secure access for store management</p>
                    </div>

                    <form onSubmit={formik.handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div className="input-wrapper">
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formik.values.email} 
                                    onChange={formik.handleChange} 
                                    onBlur={formik.handleBlur}
                                    className={`form-input ${formik.touched.email && formik.errors.email ? 'input-error' : ''}`}
                                    placeholder="admin@shop.com" 
                                />
                                <div className="input-icon"><FiMail size={18} /></div>
                            </div>
                            {formik.touched.email && formik.errors.email && <span className="field-error">{formik.errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="input-wrapper">
                                <input 
                                    type="password" 
                                    name="password" 
                                    value={formik.values.password} 
                                    onChange={formik.handleChange} 
                                    onBlur={formik.handleBlur}
                                    className={`form-input ${formik.touched.password && formik.errors.password ? 'input-error' : ''}`}
                                    placeholder="••••••••" 
                                />
                                <div className="input-icon"><FiLock size={18} /></div>
                            </div>
                            {formik.touched.password && formik.errors.password && <span className="field-error">{formik.errors.password}</span>}
                        </div>

                        <label className="remember-label">
                            <input
                                id="remember-me-admin"
                                name="remember-me"
                                type="checkbox"
                                className="remember-checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <span className="remember-text">Remember my credentials</span>
                        </label>

                        <button type="submit" className="admin-btn" disabled={isLoading}>
                            {isLoading ? (
                                <div className="spinner" />
                            ) : (
                                <>
                                    Access Dashboard
                                    <FiArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="admin-divider">
                        <p className="admin-footer-text">Restricted area. Unauthorized access is monitored.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
