import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const Profile = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders/my").then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));
  }, []);

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <span className="w-16 h-16 rounded-full bg-moss text-white flex items-center justify-center text-2xl font-semibold">
          {user.name?.[0]?.toUpperCase()}
        </span>
        <div>
          <h1 className="font-display text-2xl">{user.name}</h1>
          <p className="text-ink/60 text-sm">{user.email}</p>
          <span className="inline-block mt-1 text-xs bg-sand px-2 py-0.5 rounded-full capitalize">
            {user.role}
          </span>
        </div>
      </div>

      {user.role === "stylist" && user.membership && (
        <div className="card p-4 mb-8 text-sm">
          <p className="font-medium mb-1">Stylist membership</p>
          <p className="text-ink/60">
            {user.membership.plan} plan · {user.membership.isActive ? "active" : "inactive"} · expires{" "}
            {new Date(user.membership.expiresAt).toLocaleDateString()}
          </p>
        </div>
      )}

      <h2 className="font-display text-xl mb-4">Order history</h2>
      {loading ? (
        <Loader />
      ) : orders.length === 0 ? (
        <p className="text-ink/50">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o._id} className="card p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">Order #{o._id.slice(-6)}</p>
                <p className="text-sm text-ink/50">
                  {o.items.length} item(s) · {new Date(o.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">₹{o.totalAmount}</p>
                <p className="text-xs text-ink/50 capitalize">{o.orderStatus}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
