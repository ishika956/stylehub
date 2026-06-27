import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
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

const PLANS = [
  { id: "monthly", label: "Monthly", price: 499, sub: "/month" },
  { id: "yearly", label: "Yearly", price: 1999, sub: "/year", badge: "Best value" },
];

const BecomeStylist = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (plan) => {
    setLoading(true);
    try {
      const { data } = await api.post("/payments/membership/create", { plan });

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Could not load Razorpay");
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpayOrderId,
        name: "StyleHub Stylist Membership",
        description: `${plan} plan`,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#566246" },
        handler: async (response) => {
          try {
            await api.post("/payments/membership/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan,
            });
            await refreshUser();
            toast.success("You're now a StyleHub stylist!");
            navigate("/stylist/dashboard");
          } catch {
            toast.error("Payment verification failed");
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  if (user?.role === "stylist") {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <h1 className="font-display text-3xl mb-2">You're already a stylist!</h1>
        <p className="text-ink/60">Head to your dashboard to create outfits.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="font-display text-3xl mb-2">Become a stylist</h1>
      <p className="text-ink/60 mb-8">
        Curate outfits from existing products, earn a 10% commission on every outfit sale, and build a
        following of people who trust your taste.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {PLANS.map((p) => (
          <div key={p.id} className="card p-6 relative">
            {p.badge && (
              <span className="absolute top-4 right-4 text-xs bg-clay text-white px-2 py-1 rounded-full">
                {p.badge}
              </span>
            )}
            <p className="font-medium text-ink/60">{p.label}</p>
            <p className="font-display text-3xl mt-1">
              ₹{p.price}
              <span className="text-base text-ink/50">{p.sub}</span>
            </p>
            <button onClick={() => handleSubscribe(p.id)} disabled={loading} className="btn-primary w-full mt-5">
              {loading ? "Processing..." : `Subscribe ${p.label.toLowerCase()}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BecomeStylist;
