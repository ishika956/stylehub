import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const { items, subtotal, toCartPayload, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [loading, setLoading] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create the order on our backend (validates stock, locks in price)
      const { data: orderData } = await api.post("/orders", {
        cartItems: toCartPayload(),
        shippingAddress: address,
      });
      const order = orderData.order;

      // 2. Create a Razorpay order for that amount
      const { data: rzpData } = await api.post(`/payments/order/${order._id}/create`);

      // 3. Load checkout.js and open the widget
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Could not load Razorpay. Check your connection.");
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: rzpData.key,
        amount: rzpData.amount,
        currency: rzpData.currency,
        order_id: rzpData.razorpayOrderId,
        name: "StyleHub",
        description: `Order #${order._id.slice(-6)}`,
        prefill: { name: address.fullName, contact: address.phone, email: user?.email },
        theme: { color: "#566246" },
        handler: async (response) => {
          try {
            await api.post("/payments/order/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            clearCart();
            toast.success("Payment successful!");
            navigate(`/order-success/${order._id}`);
          } catch (err) {
            toast.error("Payment verification failed. Contact support.");
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Checkout failed");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="font-display text-3xl mb-6">Checkout</h1>

      <form onSubmit={handlePay} className="space-y-4">
        <h2 className="font-medium">Shipping address</h2>
        <input
          required
          placeholder="Full name"
          className="input"
          value={address.fullName}
          onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
        />
        <input
          required
          placeholder="Phone"
          className="input"
          value={address.phone}
          onChange={(e) => setAddress({ ...address, phone: e.target.value })}
        />
        <input
          required
          placeholder="Address"
          className="input"
          value={address.addressLine}
          onChange={(e) => setAddress({ ...address, addressLine: e.target.value })}
        />
        <div className="grid grid-cols-3 gap-3">
          <input
            required
            placeholder="City"
            className="input"
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
          />
          <input
            required
            placeholder="State"
            className="input"
            value={address.state}
            onChange={(e) => setAddress({ ...address, state: e.target.value })}
          />
          <input
            required
            placeholder="Pincode"
            className="input"
            value={address.pincode}
            onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-between border-t border-ink/10 pt-4">
          <span className="font-medium">Total</span>
          <span className="text-xl font-semibold">₹{subtotal}</span>
        </div>

        <button disabled={loading} className="btn-primary w-full">
          {loading ? "Processing..." : "Pay with Razorpay"}
        </button>
        <p className="text-xs text-ink/50 text-center">
          Supports UPI (GPay, PhonePe, Paytm), cards, netbanking, and wallets.
        </p>
      </form>
    </div>
  );
};

export default Checkout;
