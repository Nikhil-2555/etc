import { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState(() => {
        try {
            const savedWishlist = localStorage.getItem('wishlist');
            return savedWishlist ? JSON.parse(savedWishlist) : [];
        } catch (error) {
            console.error("Failed to load wishlist from local storage", error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        } catch (error) {
            console.error("Failed to save wishlist to local storage", error);
        }
    }, [wishlist]);

    const addToWishlist = (product) => {
        if (wishlist.some(item => (item._id || item.id) === (product._id || product.id))) {
            toast.error("Item already in wishlist!");
            return;
        }
        setWishlist([...wishlist, product]);
        toast.success("Added to wishlist!");
    };

    const removeFromWishlist = (productId) => {
        setWishlist(wishlist.filter(item => (item._id || item.id) !== productId));
        toast.success("Removed from wishlist!");
    };

    const isInWishlist = (productId) => {
        return wishlist.some(item => (item._id || item.id) === productId);
    };

    const value = {
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        totalWishlistItems: wishlist.length
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};
