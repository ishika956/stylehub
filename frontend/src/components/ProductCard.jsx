import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const ProductCard = ({ product }) => {
  const { user }  = useAuth();
  const navigate   = useNavigate();
  const price      = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discount   = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null;
  const [saved, setSaved] = useState(Boolean(product.isSaved));
  const [busy, setBusy]   = useState(false);

  const handleSave = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { toast.error("Log in to save products"); return navigate("/login"); }
    if (busy) return;
    setBusy(true);
    setSaved((s) => !s);
    try {
      const { data } = await api.post(`/wishlist/products/${product._id}`);
      setSaved(data.inWishlist);
      toast.success(data.inWishlist ? "Saved to wishlist" : "Removed from wishlist");
    } catch (err) {
      setSaved((s) => !s);
      toast.error(err.response?.data?.message || "Couldn't update wishlist");
    } finally { setBusy(false); }
  };

  return (
    <Link to={`/products/${product._id}`} className="pin-card group block">
      <div className="aspect-[3/4] bg-sand overflow-hidden relative">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-ink/20 gap-1">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5M4.5 3v18m15-18v18" />
            </svg>
            <span className="text-xs">No image</span>
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          className="icon-btn absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
        >
          <svg
            className={`w-4 h-4 transition-colors ${saved ? "text-rose fill-rose" : "text-ink/60"}`}
            fill={saved ? "currentColor" : "none"}
            stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        {/* Discount badge */}
        {discount && (
          <span className="absolute top-3 left-3 tag bg-clay text-white shadow-sm">
            -{discount}%
          </span>
        )}

        {/* Quick add overlay on hover */}
        <div className="absolute bottom-0 inset-x-0 p-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="btn-primary w-full text-center text-xs py-2 shadow-lg">
            View product
          </div>
        </div>
      </div>

      <div className="px-3 py-2.5">
        <p className="eyebrow mb-0.5">{product.category}</p>
        <h3 className="font-medium text-[13px] leading-snug truncate">{product.name}</h3>
        {product.brand && (
          <p className="text-[11px] text-ink/40 truncate">{product.brand}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-semibold text-[13px]">₹{price.toLocaleString("en-IN")}</span>
          {hasDiscount && (
            <span className="text-[11px] text-ink/35 line-through">₹{product.price.toLocaleString("en-IN")}</span>
          )}
        </div>
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[11px] text-amber-500">{"★".repeat(Math.round(product.rating))}</span>
            <span className="text-[10px] text-ink/40">({product.numReviews})</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
