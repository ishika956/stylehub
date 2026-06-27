import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Loader from "../../components/Loader";

const StylistDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/stylist").then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const { stats, topOutfits } = data;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl">Stylist dashboard</h1>
        <Link to="/stylist/outfits" className="btn-primary">Manage outfits</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {[
          ["Outfits", stats.totalOutfits],
          ["Views", stats.totalViews],
          ["Likes", stats.totalLikes],
          ["Sales", stats.totalSales],
          ["Earnings", `₹${stats.earnings}`],
        ].map(([label, value]) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-ink/50 uppercase">{label}</p>
            <p className="font-display text-2xl mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="card p-4 mb-10 text-sm">
        <p className="font-medium mb-1">Membership</p>
        <p className="text-ink/60">
          {stats.membership?.plan} plan · expires{" "}
          {stats.membership?.expiresAt ? new Date(stats.membership.expiresAt).toLocaleDateString() : "—"}
        </p>
      </div>

      <h2 className="font-display text-xl mb-3">Best-selling outfits</h2>
      {topOutfits.length === 0 ? (
        <p className="text-ink/50">Create your first outfit to see stats here.</p>
      ) : (
        <div className="space-y-2">
          {topOutfits.map((o) => (
            <div key={o._id} className="card p-3 flex justify-between text-sm">
              <span>{o.title}</span>
              <span>{o.salesCount} sold</span>
              <span>₹{o.totalPrice}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StylistDashboard;
