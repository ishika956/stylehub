import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "stylehub_cart";

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // item: { itemType: "product"|"outfit", productId?, outfitId?, name, image, price, size?, quantity? }
  const addItem = (item) => {
    setItems((prev) => {
      const key = item.itemType === "product" ? item.productId : item.outfitId;
      const existingIndex = prev.findIndex(
        (i) => (i.itemType === "product" ? i.productId : i.outfitId) === key && i.size === item.size
      );
      if (existingIndex > -1 && item.itemType === "product") {
        const copy = [...prev];
        copy[existingIndex].quantity += item.quantity || 1;
        return copy;
      }
      return [...prev, { ...item, quantity: item.quantity || 1, _localId: `${key}-${Date.now()}` }];
    });
  };

  const removeItem = (localId) => {
    setItems((prev) => prev.filter((i) => i._localId !== localId));
  };

  const updateQuantity = (localId, quantity) => {
    setItems((prev) =>
      prev.map((i) => (i._localId === localId ? { ...i, quantity: Math.max(1, quantity) } : i))
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity * (i.itemType === "outfit" ? 1 : 1), 0);

  // Builds the payload the backend's POST /api/orders expects
  const toCartPayload = () =>
    items.map((i) => ({
      itemType: i.itemType,
      productId: i.itemType === "product" ? i.productId : undefined,
      outfitId: i.itemType === "outfit" ? i.outfitId : undefined,
      size: i.size,
      quantity: i.itemType === "product" ? i.quantity : 1,
    }));

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, subtotal, toCartPayload }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
