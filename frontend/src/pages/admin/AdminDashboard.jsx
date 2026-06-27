import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Loader from "../../components/Loader";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/admin").then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  const { stats, topStylists } = data;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl">Admin dashboard</h1>
        <div className="flex gap-2">
          <Link to="/admin/users" className="btn-outline">Manage users</Link>
          <Link to="/admin/comments" className="btn-outline">Moderate comments</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          ["Total users", stats.totalUsers],
          ["Customers", stats.totalCustomers],
          ["Sellers", stats.totalSellers],
          ["Stylists", stats.totalStylists],
          ["Products", stats.totalProducts],
          ["Outfits", stats.totalOutfits],
          ["Orders", stats.totalOrders],
          ["Revenue", `₹${stats.totalRevenue}`],
          ["Membership revenue", `₹${stats.membershipRevenue}`],
        ].map(([label, value]) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-ink/50 uppercase">{label}</p>
            <p className="font-display text-2xl mt-1">{value}</p>
          </div>
        ))}
      </div>

      <h2 className="font-display text-xl mb-3">Top stylists by earnings</h2>
      <div className="space-y-2">
        {topStylists.map((s) => (
          <div key={s._id} className="card p-3 flex justify-between text-sm">
            <span>{s.name}</span>
            <span>₹{s.stylistProfile?.earnings || 0} earned</span>
            <span>{s.followers?.length || 0} followers</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
