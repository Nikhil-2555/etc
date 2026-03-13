import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const cartReducer = (state, action) => {
    const getItemId = (item) => item._id || item.id;

    switch (action.type) {
        case 'ADD_TO_CART': {
            const payloadId = getItemId(action.payload);
            const existing = state.items.find(
                item => getItemId(item) === payloadId && item.size === action.payload.size
            );
            if (existing) {
                return {
                    ...state,
                    items: state.items.map(item =>
                        getItemId(item) === payloadId && item.size === action.payload.size
                            ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
                            : item
                    ),
                };
            }
            return { ...state, items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }] };
        }
        case 'REMOVE_FROM_CART': {
            const payloadId = action.payload.id;
            return {
                ...state,
                items: state.items.filter(
                    item => !(getItemId(item) === payloadId && item.size === action.payload.size)
                ),
            };
        }
        case 'UPDATE_QUANTITY': {
            const payloadId = action.payload.id;
            return {
                ...state,
                items: state.items.map(item =>
                    getItemId(item) === payloadId && item.size === action.payload.size
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                ).filter(item => item.quantity > 0),
            };
        }
        case 'CLEAR_CART':
            return { ...state, items: [] };
        default:
            return state;
    }
};

export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, { items: [] }, (initial) => {
        const localData = localStorage.getItem('cart');
        return localData ? JSON.parse(localData) : initial;
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(state));
    }, [state]);

    const addToCart = (product) => dispatch({ type: 'ADD_TO_CART', payload: product });
    const removeFromCart = (id, size) => dispatch({ type: 'REMOVE_FROM_CART', payload: { id, size } });
    const updateQuantity = (id, size, quantity) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, size, quantity } });
    const clearCart = () => dispatch({ type: 'CLEAR_CART' });

    const totalItems = state.items.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = state.items.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart: state.items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
};
