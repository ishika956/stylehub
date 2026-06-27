import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Loader from "../components/Loader";

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [size, setSize] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: "" });

  const load = () => {
    Promise.all([api.get(`/products/${id}`), api.get(`/reviews/products/${id}`)])
      .then(([p, r]) => {
        setProduct(p.data.product);
        setReviews(r.data.reviews);
        setSize(p.data.product.sizes?.[0] || "");
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleAddToCart = () => {
    addItem({
      itemType: "product",
      productId: product._id,
      name: product.name,
      image: product.images?.[0],
      price: product.discountPrice || product.price,
      size,
      quantity: 1,
    });
    toast.success("Added to cart");
  };

  const toggleWishlist = async () => {
    if (!user) return toast.error("Log in to use your wishlist");
    await api.post(`/wishlist/products/${id}`);
    toast.success("Wishlist updated");
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Log in to leave a review");
    await api.post(`/reviews/products/${id}`, reviewForm);
    toast.success("Review submitted");
    setReviewForm({ rating: 5, text: "" });
    load();
  };

  if (loading) return <Loader />;
  if (!product) return null;

  const price = product.discountPrice || product.price;

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-10">
        <div className="aspect-[3/4] bg-sand rounded-2xl overflow-hidden">
          {product.images?.[0] && (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/50">{product.category}</p>
          <h1 className="font-display text-3xl mt-1">{product.name}</h1>
          <p className="text-ink/60 mt-1">
            Sold by {product.seller?.sellerProfile?.brandName || product.seller?.name}
          </p>

          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-2xl font-semibold">₹{price}</span>
            {product.discountPrice && (
              <span className="text-ink/40 line-through">₹{product.price}</span>
            )}
          </div>

          {product.avgRating > 0 && (
            <p className="text-sm text-ink/60 mt-1">
              ★ {product.avgRating} ({product.numReviews} reviews)
            </p>
          )}

          <p className="text-ink/70 mt-4">{product.description}</p>

          {product.sizes?.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-medium mb-2">Size</p>
              <div className="flex gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`w-10 h-10 rounded-full border text-sm ${
                      size === s ? "bg-ink text-bone border-ink" : "border-ink/20"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-sm mt-4 text-ink/60">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          <div className="flex gap-3 mt-6">
            <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn-primary flex-1">
              Add to cart
            </button>
            <button onClick={toggleWishlist} className="btn-outline">♡ Save</button>
          </div>
        </div>
      </div>

      <section className="mt-14 max-w-2xl">
        <h2 className="font-display text-2xl mb-4">Reviews</h2>
        {user && (
          <form onSubmit={submitReview} className="card p-4 mb-6 space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Your rating</label>
              <select
                className="input w-24"
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
              >
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
              </select>
            </div>
            <textarea
              className="input"
              placeholder="Share your thoughts on the fit, quality, sizing..."
              value={reviewForm.text}
              onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
            />
            <button className="btn-primary">Submit review</button>
          </form>
        )}
        {reviews.length === 0 ? (
          <p className="text-ink/50">No reviews yet — be the first.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="border-b border-ink/10 pb-3">
                <p className="font-medium text-sm">{r.user?.name} · ★ {r.rating}</p>
                <p className="text-ink/70 text-sm mt-1">{r.text}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductDetails;
