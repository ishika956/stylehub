import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Loader from "../../components/Loader";

const ManageOutfits = () => {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get("/outfits/stylist/mine").then(({ data }) => setOutfits(data.outfits)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this outfit?")) return;
    await api.delete(`/outfits/${id}`);
    toast.success("Outfit deleted");
    load();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl">Your outfits</h1>
        <Link to="/stylist/outfits/new" className="btn-primary">+ Build an outfit</Link>
      </div>

      {outfits.length === 0 ? (
        <p className="text-ink/50">You haven't created any outfits yet.</p>
      ) : (
        <div className="space-y-2">
          {outfits.map((o) => (
            <div key={o._id} className="card p-3 flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium">{o.title}</p>
                <p className="text-sm text-ink/50">
                  {o.occasion} · ₹{o.totalPrice} · {o.salesCount} sold · {o.isPublished ? "published" : "draft"}
                </p>
              </div>
              <Link to={`/stylist/outfits/${o._id}/edit`} className="btn-outline text-sm py-1.5">Edit</Link>
              <button onClick={() => handleDelete(o._id)} className="text-clay text-sm">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageOutfits;
