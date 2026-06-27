import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Loader from "../components/Loader";

const OutfitDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [outfit, setOutfit] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([api.get(`/outfits/${id}`), api.get(`/social/outfits/${id}/comments`)])
      .then(([o, c]) => {
        setOutfit(o.data.outfit);
        setComments(c.data.comments);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleLike = async () => {
    if (!user) return toast.error("Log in to like outfits");
    const { data } = await api.post(`/social/outfits/${id}/like`);
    setLiked(data.liked);
    setOutfit((prev) => ({ ...prev, likesCount: data.likesCount }));
  };

  const handleFollow = async () => {
    if (!user) return toast.error("Log in to follow stylists");
    await api.post(`/social/follow/${outfit.stylist._id}`);
    toast.success("Following updated");
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Log in to comment");
    if (!commentText.trim()) return;
    await api.post(`/social/outfits/${id}/comments`, { text: commentText });
    setCommentText("");
    load();
  };

  const toggleWishlist = async () => {
    if (!user) return toast.error("Log in to use your wishlist");
    await api.post(`/wishlist/outfits/${id}`);
    toast.success("Wishlist updated");
  };

  const handleBuyOutfit = () => {
    addItem({
      itemType: "outfit",
      outfitId: outfit._id,
      name: outfit.title,
      image: outfit.coverImage || outfit.products[0]?.product?.images?.[0],
      price: outfit.totalPrice,
      quantity: 1,
    });
    toast.success("Complete outfit added to cart");
  };

  if (loading) return <Loader />;
  if (!outfit) return null;

  const outOfStock = outfit.products.some((p) => !p.product || p.product.stock < 1);

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div className="aspect-[4/5] bg-sand rounded-2xl overflow-hidden mb-3">
            {outfit.coverImage ? (
              <img src={outfit.coverImage} alt={outfit.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid grid-cols-2 gap-1 p-1">
                {outfit.products.map((entry, idx) => (
                  <div key={idx} className="bg-white overflow-hidden rounded-lg">
                    {entry.product?.images?.[0] && (
                      <img src={entry.product.images[0]} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {outfit.products.map((entry) => (
              <Link
                key={entry.product?._id}
                to={`/products/${entry.product?._id}`}
                className="aspect-square bg-white border border-ink/10 rounded-lg overflow-hidden"
              >
                {entry.product?.images?.[0] && (
                  <img src={entry.product.images[0]} alt="" className="w-full h-full object-cover" />
                )}
              </Link>
            ))}
          </div>
        </div>

        <div>
          {outfit.occasion && (
            <span className="inline-block bg-sand text-ink text-xs px-3 py-1 rounded-full mb-3">
              {outfit.occasion}
            </span>
          )}
          <h1 className="font-display text-3xl">{outfit.title}</h1>

          <Link to={`/stylists/${outfit.stylist?._id}`} className="flex items-center gap-2 mt-3 group">
            <span className="w-8 h-8 rounded-full bg-moss text-white flex items-center justify-center text-sm font-semibold">
              {outfit.stylist?.name?.[0]?.toUpperCase()}
            </span>
            <span className="text-sm group-hover:underline">by {outfit.stylist?.name}</span>
          </Link>

          {outfit.stylistNote && <p className="text-ink/70 mt-4 italic">"{outfit.stylistNote}"</p>}

          <div className="mt-5">
            <p className="text-sm font-medium mb-2">In this look</p>
            <ul className="space-y-1 text-sm text-ink/70">
              {outfit.products.map((entry) => (
                <li key={entry.product?._id} className="flex justify-between">
                  <span>{entry.product?.name}{entry.size ? ` (${entry.size})` : ""}</span>
                  <span>₹{entry.product?.discountPrice || entry.product?.price}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-baseline justify-between mt-4 border-t border-ink/10 pt-3">
            <span className="font-medium">Total outfit price</span>
            <span className="text-2xl font-semibold">₹{outfit.totalPrice}</span>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleBuyOutfit} disabled={outOfStock} className="btn-primary flex-1">
              {outOfStock ? "An item is out of stock" : "Buy complete outfit"}
            </button>
            <button onClick={toggleWishlist} className="btn-outline">♡</button>
          </div>

          <div className="flex gap-3 mt-3">
            <button onClick={handleLike} className="text-sm">
              {liked ? "♥" : "♡"} {outfit.likesCount} likes
            </button>
            <button onClick={handleFollow} className="text-sm text-moss hover:underline">
              Follow stylist
            </button>
          </div>
        </div>
      </div>

      <section className="mt-14 max-w-2xl">
        <h2 className="font-display text-2xl mb-4">Comments</h2>
        {user && (
          <form onSubmit={handleComment} className="flex gap-2 mb-6">
            <input
              className="input"
              placeholder="Share a styling idea..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <button className="btn-primary">Post</button>
          </form>
        )}
        {comments.length === 0 ? (
          <p className="text-ink/50">No comments yet.</p>
        ) : (
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c._id} className="border-b border-ink/10 pb-3">
                <p className="font-medium text-sm">{c.user?.name}</p>
                <p className="text-ink/70 text-sm mt-1">{c.text}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default OutfitDetails;
