import React, { useEffect, useState } from "react";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";
import OutfitCard from "../components/OutfitCard";
import Loader from "../components/Loader";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState({ products: [], outfits: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/wishlist").then(({ data }) => setWishlist(data.wishlist)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Your wishlist</h1>

      <h2 className="font-medium mb-3">Saved outfits</h2>
      {wishlist.outfits.length === 0 ? (
        <p className="text-ink/50 mb-8">No saved outfits yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {wishlist.outfits.map((o) => <OutfitCard key={o._id} outfit={o} />)}
        </div>
      )}

      <h2 className="font-medium mb-3">Saved products</h2>
      {wishlist.products.length === 0 ? (
        <p className="text-ink/50">No saved products yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {wishlist.products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
