import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Cart = () => {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) return navigate("/login", { state: { from: "/checkout" } });
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-ink/50 mb-4">Your cart is empty.</p>
        <Link to="/outfits" className="btn-primary">Browse outfits</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-3xl mb-6">Your cart</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item._localId} className="card p-4 flex gap-4">
            <div className="w-20 h-24 bg-sand rounded-lg overflow-hidden flex-shrink-0">
              {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase text-ink/40">
                {item.itemType === "outfit" ? "Complete outfit" : "Product"}
              </p>
              <p className="font-medium">{item.name}</p>
              {item.size && <p className="text-sm text-ink/50">Size: {item.size}</p>}
              <div className="flex items-center justify-between mt-2">
                {item.itemType === "product" ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item._localId, item.quantity - 1)}
                      className="w-7 h-7 border border-ink/20 rounded-full"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._localId, item.quantity + 1)}
                      className="w-7 h-7 border border-ink/20 rounded-full"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <span className="text-sm text-ink/50">All pieces included</span>
                )}
                <span className="font-semibold">₹{item.price * item.quantity}</span>
              </div>
            </div>
            <button onClick={() => removeItem(item._localId)} className="text-clay text-sm self-start">
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-8 border-t border-ink/10 pt-4">
        <span className="font-medium">Subtotal</span>
        <span className="text-xl font-semibold">₹{subtotal}</span>
      </div>
      <p className="text-xs text-ink/50 mt-1">Shipping and any discounts are calculated at checkout.</p>

      <button onClick={handleCheckout} className="btn-primary w-full mt-6">
        Proceed to checkout
      </button>
    </div>
  );
};

export default Cart;
