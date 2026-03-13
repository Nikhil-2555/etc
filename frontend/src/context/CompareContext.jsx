import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
    const [compareItems, setCompareItems] = useState(() => {
        try {
            const item = localStorage.getItem('compare');
            return item ? JSON.parse(item) : [];
        } catch (error) {
            console.error('Failed to parse compare items from localStorage', error);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('compare', JSON.stringify(compareItems));
    }, [compareItems]);

    const addToCompare = (product) => {
        if (compareItems.length >= 4) {
            toast.error('You can compare up to 4 products at a time.');
            return;
        }
        const exists = compareItems.find((item) => item._id === product._id);
        if (exists) {
            toast.error('Product already in comparison list.');
            return;
        }
        setCompareItems([...compareItems, product]);
        toast.success('Added to comparison.');
    };

    const removeFromCompare = (productId) => {
        setCompareItems(compareItems.filter((item) => item._id !== productId));
        toast.success('Removed from comparison.');
    };

    const clearCompare = () => {
        setCompareItems([]);
        toast.success('Comparison list cleared.');
    };

    return (
        <CompareContext.Provider
            value={{ compareItems, addToCompare, removeFromCompare, clearCompare }}
        >
            {children}
        </CompareContext.Provider>
    );
};

export const useCompare = () => {
    const context = useContext(CompareContext);
    if (!context) {
        throw new Error('useCompare must be used within a CompareProvider');
    }
    return context;
};
