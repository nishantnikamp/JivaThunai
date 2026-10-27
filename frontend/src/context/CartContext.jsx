import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const { showToast } = useNotification();
    
    // State for cart
    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem('petcare_cart');
        if (saved) {
            try {
                let parsed = JSON.parse(saved);
                parsed = parsed.map(i => ({ ...i, quantity: isNaN(Number(i.quantity)) ? 1 : Number(i.quantity) }));
                return parsed;
            } catch (e) {
                return [];
            }
        }
        return [];
    });

    // State for saved/liked items
    const [savedItems, setSavedItems] = useState(() => {
        const saved = localStorage.getItem('petcare_saved');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('petcare_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        localStorage.setItem('petcare_saved', JSON.stringify(savedItems));
    }, [savedItems]);

    const addToCart = (item, quantity = 1) => {
        const existing = cartItems.find(i => i.id === item.id);
        const itemName = item.title || item.name || item.breed;
        const isPet = item.type === 'pet' || item.species || item.breed;
        
        if (existing) {
            // If it's a pet, max quantity is 1
            if (isPet) {
                showToast('This pet is already in your cart.', 'info');
                return;
            }
            showToast(`Updated ${itemName} quantity.`, 'success');
            setCartItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i));
        } else {
            showToast(`Added ${itemName} to cart.`, 'success');
            setCartItems(prev => [...prev, { ...item, quantity }]);
        }
    };

    const removeFromCart = (itemId) => {
        setCartItems(prev => prev.filter(i => i.id !== itemId));
        showToast('Item removed from cart.', 'info');
    };

    const updateQuantity = (itemId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const toggleSave = (item) => {
        const isExisting = savedItems.some(i => i.id === item.id);
        if (isExisting) {
            showToast('Removed from saved items.', 'info');
            setSavedItems(prev => prev.filter(i => i.id !== item.id));
        } else {
            showToast('Added to saved items.', 'success');
            setSavedItems(prev => [...prev, item]);
        }
    };

    const isSaved = (itemId) => {
        return savedItems.some(i => i.id === itemId);
    };

    const cartTotal = cartItems.reduce((total, item) => total + (Number(item.discountedActivePrice || item.retailPrice || item.price || item.askingPrice || 0) * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            savedItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            toggleSave,
            isSaved,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};
