import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';
import { CompareProvider } from './context/CompareContext';
import NotificationManager from './components/NotificationManager';

// ── Lazy-loaded pages (code-split into separate chunks) ──
const Home = lazy(() => import('./pages/Home'));
const ProductList = lazy(() => import('./pages/ProductList'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Sales = lazy(() => import('./pages/Sales'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Compare = lazy(() => import('./pages/Compare'));
const CustomerSupport = lazy(() => import('./pages/CustomerSupport'));
const NotFound = lazy(() => import('./pages/NotFound'));

// ── Heavy pages — only downloaded when navigated to ──
const UserDashboard = lazy(() => import('./pages/dashboard/UserDashboard'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const PaymentGateway = lazy(() => import('./pages/PaymentGateway'));
const ProcessingPayment = lazy(() => import('./pages/Payment'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentFailed = lazy(() => import('./pages/PaymentFailed'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const Receipt = lazy(() => import('./pages/Receipt'));

// ── Premium loading spinner shown during chunk downloads ──
const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-[3px] border-gray-200 dark:border-gray-700" />
      <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary-600 animate-spin" />
    </div>
    <p className="text-sm text-gray-400 dark:text-gray-500 font-medium tracking-wide">Loading...</p>
  </div>
);

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <WishlistProvider>
            <CompareProvider>
              <CartProvider>
                <Router>
                  <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans">
                    <Navbar />
                    <main className="flex-grow">
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/products" element={<ProductList />} />
                          <Route path="/products/:id" element={<ProductDetail />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/compare" element={<Compare />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/signup" element={<Signup />} />
                          <Route path="/sales" element={<Sales />} />
                          <Route path="/wishlist" element={
                            <ProtectedRoute>
                              <Wishlist />
                            </ProtectedRoute>
                          } />

                          <Route path="/checkout" element={
                            <ProtectedRoute>
                              <Checkout />
                            </ProtectedRoute>
                          } />

                          <Route path="/dashboard" element={
                            <ProtectedRoute>
                              <UserDashboard />
                            </ProtectedRoute>
                          } />

                          {/* Payment Flow Routes */}
                          <Route path="/payment/:orderId" element={
                            <ProtectedRoute>
                              <PaymentGateway />
                            </ProtectedRoute>
                          } />

                          <Route path="/payment/processing/:orderId" element={
                            <ProtectedRoute>
                              <ProcessingPayment />
                            </ProtectedRoute>
                          } />

                          <Route path="/payment/success/:orderId" element={
                            <ProtectedRoute>
                              <PaymentSuccess />
                            </ProtectedRoute>
                          } />

                          <Route path="/payment/failed/:orderId" element={
                            <ProtectedRoute>
                              <PaymentFailed />
                            </ProtectedRoute>
                          } />

                          <Route path="/order-confirmation/:orderId" element={
                            <ProtectedRoute>
                              <OrderConfirmation />
                            </ProtectedRoute>
                          } />

                          <Route path="/receipt/:orderId" element={
                            <ProtectedRoute>
                              <Receipt />
                            </ProtectedRoute>
                          } />

                          <Route path="/admin/login" element={<AdminLogin />} />
                          <Route path="/admin" element={
                            <ProtectedRoute role={['admin', 'manager']}>
                              <AdminDashboard />
                            </ProtectedRoute>
                          } />

                          <Route path="/support" element={<CustomerSupport />} />

                          {/* 404 Catch-all */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                    </main>
                    <Footer />
                    <Toaster position="bottom-right" toastOptions={{
                      style: {
                        background: '#333',
                        color: '#fff',
                      },
                      success: {
                        duration: 3000,
                        iconTheme: {
                          primary: '#6366f1',
                          secondary: '#fff',
                        },
                      },
                    }} />
                    <NotificationManager />
                  </div>
                </Router>
              </CartProvider>
            </CompareProvider>
          </WishlistProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
