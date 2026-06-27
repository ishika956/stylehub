import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const OutfitCard = ({ outfit }) => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [liked, setLiked]         = useState(Boolean(outfit.isLiked));
  const [likesCount, setLikesCount] = useState(outfit.likesCount || 0);
  const [busy, setBusy]           = useState(false);

  const handleLike = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { toast.error("Log in to like outfits"); return navigate("/login"); }
    if (busy) return;
    setBusy(true);
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((c) => nextLiked ? c + 1 : Math.max(0, c - 1));
    try {
      const { data } = await api.post(`/social/outfits/${outfit._id}/like`);
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (err) {
      setLiked(liked);
      setLikesCount(outfit.likesCount || 0);
      toast.error(err.response?.data?.message || "Couldn't like this outfit");
    } finally { setBusy(false); }
  };

  return (
    <Link to={`/outfits/${outfit._id}`} className="pin-card group block">
      {/* Image area */}
      <div className="bg-sand overflow-hidden relative">
        {outfit.coverImage ? (
          <img
            src={outfit.coverImage}
            alt={outfit.title}
            className="w-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
            style={{ aspectRatio: "auto", minHeight: "180px" }}
            loading="lazy"
          />
        ) : (
          <div className="grid grid-cols-2 gap-px p-px aspect-[4/5]">
            {outfit.products?.slice(0, 4).map((entry, idx) => (
              <div key={idx} className="bg-white overflow-hidden">
                {entry.product?.images?.[0] ? (
                  <img src={entry.product.images[0]} alt="" className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-sand/60" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {outfit.occasion && (
          <span className="tag-dark absolute top-3 left-3 shadow-sm">
            {outfit.occasion}
          </span>
        )}

        {/* Like overlay button */}
        <button
          onClick={handleLike}
          className="icon-btn absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-label={liked ? "Unlike outfit" : "Like outfit"}
        >
          <svg
            className={`w-4 h-4 transition-colors ${liked ? "text-rose fill-rose" : "text-ink/60"}`}
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        {/* Price + style chip at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-3 pt-8 pb-2.5 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-white text-sm font-semibold drop-shadow">
            ₹{outfit.totalPrice?.toLocaleString("en-IN")}
          </span>
          {outfit.style && (
            <span className="tag-light text-[10px]">{outfit.style}</span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2.5">
        <h3 className="font-medium text-[13px] leading-snug line-clamp-2 mb-1.5">{outfit.title}</h3>

        <div className="flex items-center justify-between">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/stylists/${outfit.stylist?._id}`); }}
            className="flex items-center gap-1.5 min-w-0 group/stylist"
          >
            <span className="w-5 h-5 rounded-full bg-moss text-white text-[9px] font-bold flex items-center justify-center shrink-0">
              {outfit.stylist?.name?.[0]?.toUpperCase() || "S"}
            </span>
            <span className="text-[11px] text-ink/50 truncate group-hover/stylist:text-moss transition-colors">
              {outfit.stylist?.name || "StyleHub stylist"}
            </span>
          </button>

          <button onClick={handleLike} className={`like-btn shrink-0 ${liked ? "is-liked" : ""}`}>
            <svg
              className={`w-3.5 h-3.5 ${liked ? "fill-current" : ""}`}
              fill={liked ? "currentColor" : "none"}
              stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <span className="text-[11px]">{likesCount}</span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default OutfitCard;
