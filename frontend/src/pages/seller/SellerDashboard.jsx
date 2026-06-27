import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Loader from "../../components/Loader";

const SellerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/seller").then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const { stats, recentOrders } = data;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl">Seller dashboard</h1>
        <Link to="/seller/products" className="btn-primary">Manage products</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {[
          ["Products", stats.totalProducts],
          ["Low stock", stats.lowStock],
          ["Orders", stats.totalOrders],
          ["Units sold", stats.unitsSold],
          ["Revenue", `₹${stats.revenue}`],
        ].map(([label, value]) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-ink/50 uppercase">{label}</p>
            <p className="font-display text-2xl mt-1">{value}</p>
          </div>
        ))}
      </div>

      <h2 className="font-display text-xl mb-3">Recent orders</h2>
      {recentOrders.length === 0 ? (
        <p className="text-ink/50">No orders yet.</p>
      ) : (
        <div className="space-y-2">
          {recentOrders.map((o) => (
            <div key={o._id} className="card p-3 flex justify-between text-sm">
              <span>Order #{o._id.slice(-6)}</span>
              <span className="capitalize">{o.orderStatus}</span>
              <span>₹{o.totalAmount}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
