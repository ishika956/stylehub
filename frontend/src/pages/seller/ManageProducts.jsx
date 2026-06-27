import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";
import Loader from "../../components/Loader";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get("/products/seller/mine").then(({ data }) => setProducts(data.products)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await api.delete(`/products/${id}`);
    toast.success("Product deleted");
    load();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl">Your products</h1>
        <Link to="/seller/products/new" className="btn-primary">+ Add product</Link>
      </div>

      {products.length === 0 ? (
        <p className="text-ink/50">You haven't listed any products yet.</p>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <div key={p._id} className="card p-3 flex items-center gap-4">
              <div className="w-14 h-16 bg-sand rounded-lg overflow-hidden flex-shrink-0">
                {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1">
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-ink/50">{p.category} · ₹{p.price} · stock {p.stock}</p>
              </div>
              <Link to={`/seller/products/${p._id}/edit`} className="btn-outline text-sm py-1.5">Edit</Link>
              <button onClick={() => handleDelete(p._id)} className="text-clay text-sm">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
