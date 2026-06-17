import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { FiShoppingCart, FiStar, FiHeart, FiLayers } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { addToCompare, removeFromCompare, compareItems } = useCompare();
    const navigate = useNavigate();
    
    const [isHeartPopping, setIsHeartPopping] = useState(false);
    const imgRef = useRef(null);

    const isCompared = compareItems.some((item) => item._id === (product._id || product.id));

    const handleAddToCart = (e) => {
        e.preventDefault();
        const productId = product._id || product.id;
        if (product.sizes && product.sizes.length > 0) {
            navigate(`/products/${productId}`);
            return;
        }

        // Add-to-cart fly effect
        const cartBtn = document.querySelector('#desktop-cart-btn') || document.querySelector('.cart-icon-target');
        const cardImg = imgRef.current;
        if (cartBtn && cardImg) {
            const startRect = cardImg.getBoundingClientRect();
            const endRect = cartBtn.getBoundingClientRect();

            const flyImg = document.createElement('img');
            flyImg.src = product.image;
            flyImg.style.position = 'fixed';
            flyImg.style.left = `${startRect.left}px`;
            flyImg.style.top = `${startRect.top}px`;
            flyImg.style.width = `${startRect.width}px`;
            flyImg.style.height = `${startRect.height}px`;
            flyImg.style.zIndex = '99999';
            flyImg.style.transition = 'all 0.8s cubic-bezier(0.25, 1, 0.5, 1)';
            flyImg.style.borderRadius = '50%';
            flyImg.style.objectFit = 'cover';
            flyImg.style.pointerEvents = 'none';
            document.body.appendChild(flyImg);

            // Force repaint
            flyImg.offsetWidth;

            requestAnimationFrame(() => {
                flyImg.style.left = `${endRect.left + 5}px`;
                flyImg.style.top = `${endRect.top + 5}px`;
                flyImg.style.width = '24px';
                flyImg.style.height = '24px';
                flyImg.style.opacity = '0.15';
                flyImg.style.transform = 'rotate(720deg)';
            });

            setTimeout(() => {
                flyImg.remove();
            }, 800);
        }

        addToCart({ ...product, quantity: 1 });
        toast.success(`${product.title} added to cart!`);
    };

    const handleToggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const productId = product._id || product.id;
        
        setIsHeartPopping(true);
        setTimeout(() => setIsHeartPopping(false), 450);

        if (isInWishlist(productId)) {
            removeFromWishlist(productId);
        } else {
            addToWishlist(product);
        }
    };

    const handleToggleCompare = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const productId = product._id || product.id;
        if (isCompared) {
            removeFromCompare(productId);
        } else {
            addToCompare(product);
        }
    };

    const handleMagneticMove = (e) => {
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
    };

    const handleMagneticLeave = (e) => {
        const btn = e.currentTarget;
        btn.style.transform = 'translate(0px, 0px)';
    };

    const secondaryImage = product.secondaryImage || (product.image && product.image.includes('unsplash.com') ? `${product.image}&auto=format&fit=crop&w=800&q=80` : product.image);

    return (
        <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-100 dark:border-gray-700 relative flex flex-col h-full">
            <Link to={`/products/${product._id || product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-50 dark:bg-gray-700">
                <div className="relative w-full h-full overflow-hidden">
                    {/* Primary Product Image */}
                    <img
                        ref={imgRef}
                        src={product.image}
                        alt={product.title}
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?w=800';
                        }}
                        className="w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-110 group-hover:opacity-0 will-change-transform"
                    />
                    {/* Secondary Product Image (Alternate Angle / Texture) */}
                    {secondaryImage && (
                        <img
                            src={secondaryImage}
                            alt={`${product.title} Alternate View`}
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                            className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out opacity-0 group-hover:opacity-100 group-hover:scale-110 will-change-transform"
                        />
                    )}
                </div>

                {/* Quick-Buy Hover Reveal Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center z-10">
                    <button
                        onMouseMove={handleMagneticMove}
                        onMouseLeave={handleMagneticLeave}
                        onClick={handleAddToCart}
                        className="bg-white text-gray-900 hover:bg-primary-600 hover:text-white px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 transform shadow-md flex items-center gap-1.5"
                    >
                        <FiShoppingCart size={13} />
                        {product.sizes && product.sizes.length > 0 ? 'Select Size' : 'Quick Add'}
                    </button>
                </div>

                {/* Floating Top-Right Action Buttons */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col gap-2">
                    <button
                        onClick={handleToggleWishlist}
                        className={`p-2 rounded-full shadow-md transition-all duration-200 ${
                            isInWishlist(product._id || product.id) 
                                ? 'bg-red-50 dark:bg-red-900/30 text-red-500' 
                                : 'bg-white dark:bg-gray-800 text-gray-500 hover:text-red-500'
                        } ${isHeartPopping ? 'animate-heart-pop' : ''}`}
                        title={isInWishlist(product._id || product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                        <FiHeart size={18} fill={isInWishlist(product._id || product.id) ? "currentColor" : "none"} />
                    </button>
                    <button
                        onClick={handleToggleCompare}
                        className={`p-2 rounded-full shadow-md transition-colors ${isCompared ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500' : 'bg-white dark:bg-gray-800 text-gray-500 hover:text-indigo-500'}`}
                        title={isCompared ? "Remove from Compare" : "Compare Product"}
                    >
                        <FiLayers size={18} />
                    </button>
                </div>
            </Link>

            <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className="text-xs uppercase tracking-wider text-primary-600 dark:text-primary-400 font-semibold mb-1 block">{product.category}</span>
                            <Link to={`/products/${product._id || product.id}`} className="block">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{product.title}</h3>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-1 text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-md">
                            <FiStar size={14} fill="currentColor" />
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-400">{product.rating?.rate || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-end mt-4">
                    <div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{product.price.toLocaleString('en-IN')}</span>
                        {product.originalPrice > product.price && (
                            <span className="text-sm text-gray-400 dark:text-gray-500 line-through ml-2">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                        )}
                    </div>
                    <button
                        onMouseMove={handleMagneticMove}
                        onMouseLeave={handleMagneticLeave}
                        onClick={handleAddToCart}
                        className="bg-gray-900 dark:bg-primary-600 text-white p-3 rounded-xl hover:bg-primary-600 dark:hover:bg-primary-700 transition-all duration-200 transform shadow-md hover:shadow-lg flex items-center justify-center group/btn min-w-[3rem]"
                    >
                        <FiShoppingCart size={20} className={`${product.sizes && product.sizes.length > 0 ? 'hidden' : 'group-hover/btn:hidden'}`} />
                        <span className={`${product.sizes && product.sizes.length > 0 ? 'inline' : 'hidden group-hover/btn:inline'} text-sm font-medium px-2 whitespace-nowrap`}>
                            {product.sizes && product.sizes.length > 0 ? 'Select Size' : 'Add'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Scoped CSS animations */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes heartPop {
                    0% { transform: scale(1); }
                    15% { transform: scale(1.4); }
                    30% { transform: scale(0.85); }
                    45% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }
                .animate-heart-pop {
                    animation: heartPop 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
            `}} />
        </div>
    );
};

export default ProductCard;
