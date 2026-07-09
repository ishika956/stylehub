import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";

const OCCASIONS = ["College", "Office", "Wedding", "Interview", "Party", "Casual", "Date", "Festive"];
const STYLES    = ["Streetwear", "Formal", "Casual", "Ethnic", "Athleisure", "Minimal"];
const SEASONS   = ["Summer", "Winter", "Monsoon", "All-Season"];

const OutfitForm = () => {
  const { id }  = useParams();
  const isEdit  = Boolean(id);
  const navigate = useNavigate();

  const [search, setSearch]           = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching]     = useState(false);
  const [selected, setSelected]       = useState([]);
  const [form, setForm]               = useState({
    title: "", description: "", coverImage: "",
    occasion: "", style: "", season: "",
    gender: "unisex", budget: "", stylistNote: "",
  });
  const [loading, setLoading]         = useState(false);
  const [uploading, setUploading]     = useState(false);
  const searchRef                     = useRef(null);

  useEffect(() => {
    if (isEdit) {
      api.get(`/outfits/${id}`).then(({ data }) => {
        const o = data.outfit;
        setForm({ ...o });
        setSelected(o.products.map((p) => ({ product: p.product, size: p.size })));
      });
    }
  }, [id]);

  // ── BUG FIX: NOT a <form> submit — just a plain async function ──────
  const handleSearch = async () => {
    const q = search.trim();
    if (!q) return;
    setSearching(true);
    try {
      const { data } = await api.get("/products", { params: { keyword: q, limit: 8 } });
      setSearchResults(data.products || []);
    } catch {
      toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  };

  const [aiLoading, setAiLoading] = useState(false);
  const generateDescription = async () => {
    if (!form.title) return toast.error("Enter an outfit title first");
    setAiLoading(true);
    try {
      const { data } = await api.post("/ai/outfit-description", {
        title: form.title,
        productNames: selected.map((p) => p.name || p.product?.name).filter(Boolean),
        occasion: form.occasion, style: form.style, season: form.season,
      });
      setForm((f) => ({ ...f, description: data.description }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not generate");
    } finally {
      setAiLoading(false);
    }
  };

  // Allow pressing Enter in the search input without submitting the outer form
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const addProduct = (product) => {
    if (selected.some((s) => s.product._id === product._id)) return;
    setSelected([...selected, { product, size: product.sizes?.[0] || "" }]);
  };

  const handleCoverImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("images", file);
    setUploading(true);
    try {
      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, coverImage: data.urls[0] }));
      toast.success("Cover photo uploaded");
    } catch (err) {
      toast.error(err.response?.data?.message || "Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeProduct = (productId) =>
    setSelected(selected.filter((s) => s.product._id !== productId));

  const totalPrice = selected.reduce(
    (sum, s) => sum + (s.product.discountPrice || s.product.price), 0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selected.length === 0) return toast.error("Add at least one product to the outfit");
    setLoading(true);
    const payload = {
      ...form,
      budget: form.budget ? Number(form.budget) : undefined,
      products: selected.map((s) => ({ product: s.product._id, size: s.size })),
    };
    try {
      if (isEdit) {
        await api.put(`/outfits/${id}`, payload);
        toast.success("Outfit updated");
      } else {
        await api.post("/outfits", payload);
        toast.success("Outfit published ✨");
      }
      navigate("/stylist/outfits");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <p className="eyebrow mb-2">{isEdit ? "Edit look" : "New look"}</p>
        <h1 className="font-display text-4xl leading-tight">
          {isEdit ? "Update your outfit" : "Build an outfit"}
        </h1>
        <p className="text-ink/50 mt-2 text-sm">
          Pick products from the marketplace and bundle them into one shoppable look.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Cover photo — Pinterest-style prominent upload */}
        <div className="card border-dashed border-2 border-ink/15 hover:border-moss/40 transition-colors">
          {form.coverImage ? (
            <div className="relative group">
              <img
                src={form.coverImage}
                alt="Outfit cover"
                className="w-full max-h-80 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <label className="btn-primary cursor-pointer text-xs">
                  Change photo
                  <input
                    type="file" accept="image/*"
                    onChange={handleCoverImageSelect}
                    disabled={uploading}
                    className="sr-only"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, coverImage: "" })}
                  className="btn-outline text-white border-white/50 hover:bg-white/20 text-xs"
                >
                  Remove
                </button>
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <span className="text-sm text-ink/60 animate-pulse">Uploading…</span>
                </div>
              )}
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center py-12 cursor-pointer group">
              <div className="w-14 h-14 rounded-full bg-sand flex items-center justify-center mb-3 group-hover:bg-moss/10 transition-colors">
                <svg className="w-6 h-6 text-ink/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <span className="font-medium text-sm">Upload cover photo</span>
              <span className="text-xs text-ink/40 mt-1">The hero image people see first in the feed</span>
              <input
                type="file" accept="image/*"
                onChange={handleCoverImageSelect}
                disabled={uploading}
                className="sr-only"
              />
              {uploading && <p className="text-xs text-ink/50 mt-3 animate-pulse">Uploading…</p>}
            </label>
          )}
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <input
            required
            placeholder="Outfit title — e.g. 'College Casual Look'"
            className="input text-base font-medium"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <button type="button" onClick={generateDescription} disabled={aiLoading}
            className="text-xs font-medium text-moss hover:underline mb-1">
            {aiLoading ? "Generating…" : "✨ Generate with AI"}
          </button>
          <textarea
            rows={3}
            placeholder="Describe this look — the vibe, the occasion, who it's for…"
            className="input"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Tags row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: "occasion", label: "Occasion", opts: OCCASIONS },
            { key: "style",    label: "Style",    opts: STYLES    },
            { key: "season",   label: "Season",   opts: SEASONS   },
          ].map(({ key, label, opts }) => (
            <select
              key={key}
              className="input"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            >
              <option value="">{label}</option>
              {opts.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ))}
          <select
            className="input"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="unisex">Unisex</option>
            <option value="male">Men</option>
            <option value="female">Women</option>
          </select>
        </div>

        {/* Stylist note */}
        <textarea
          rows={2}
          placeholder="Stylist note — e.g. 'Great for daily college wear. Pair with white sneakers.'"
          className="input"
          value={form.stylistNote}
          onChange={(e) => setForm({ ...form, stylistNote: e.target.value })}
        />

        {/* ── Product search panel ───────────────────────────────────── */}
        <div className="card p-5 space-y-4">
          <p className="font-display text-lg">Add products to this look</p>

          {/* Search row — NOT a <form> to avoid page refresh bug */}
          <div className="flex gap-2">
            <input
              ref={searchRef}
              placeholder="Search by product name or brand…"
              className="input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            <button
              type="button"          /* ← critical: prevent outer form submit */
              onClick={handleSearch}
              disabled={searching}
              className="btn-primary shrink-0"
            >
              {searching ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              ) : "Search"}
            </button>
          </div>

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {searchResults.map((p) => {
                const alreadyAdded = selected.some((s) => s.product._id === p._id);
                return (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => addProduct(p)}
                    disabled={alreadyAdded}
                    className={`text-left rounded-2xl overflow-hidden border transition-all duration-150 ${
                      alreadyAdded
                        ? "border-moss/40 bg-moss/5 opacity-60 cursor-default"
                        : "border-ink/10 hover:border-moss hover:shadow-md"
                    }`}
                  >
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt={p.name} className="w-full aspect-square object-cover" />
                    ) : (
                      <div className="w-full aspect-square bg-sand flex items-center justify-center text-ink/20 text-xs">No image</div>
                    )}
                    <div className="p-2">
                      <p className="text-xs font-medium truncate">{p.name}</p>
                      <p className="text-[11px] text-ink/50 mt-0.5">₹{p.discountPrice || p.price}</p>
                      {alreadyAdded && (
                        <p className="text-[10px] text-moss font-semibold mt-0.5">✓ Added</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Selected products list */}
          <div>
            <p className="text-sm font-medium text-ink/60 mb-2">
              In this outfit <span className="text-ink font-semibold">{selected.length > 0 ? `(${selected.length})` : ""}</span>
            </p>
            {selected.length === 0 ? (
              <p className="text-sm text-ink/35 italic py-4 text-center border border-dashed border-ink/10 rounded-2xl">
                No products added yet — search above to find items.
              </p>
            ) : (
              <div className="space-y-1.5">
                {selected.map((s) => (
                  <div
                    key={s.product._id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-sand/40 hover:bg-sand/70 transition-colors"
                  >
                    {s.product.images?.[0] && (
                      <img src={s.product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.product.name}</p>
                      <p className="text-xs text-ink/50">₹{s.product.discountPrice || s.product.price}</p>
                    </div>
                    {s.product.sizes?.length > 0 && (
                      <select
                        className="input py-1 px-2 text-xs w-16 !rounded-lg"
                        value={s.size}
                        onChange={(e) =>
                          setSelected(selected.map((x) =>
                            x.product._id === s.product._id ? { ...x, size: e.target.value } : x
                          ))
                        }
                      >
                        {s.product.sizes.map((sz) => <option key={sz} value={sz}>{sz}</option>)}
                      </select>
                    )}
                    <button
                      type="button"
                      onClick={() => removeProduct(s.product._id)}
                      className="w-7 h-7 rounded-full hover:bg-clay/10 flex items-center justify-center text-ink/40 hover:text-clay transition-colors shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 px-1 font-semibold text-sm">
                  <span className="text-ink/60">Total outfit price</span>
                  <span>₹{totalPrice.toLocaleString("en-IN")}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || uploading}
          className="btn-primary w-full py-3 text-base"
        >
          {loading ? "Publishing…" : isEdit ? "Save changes" : "Publish outfit ✨"}
        </button>
      </form>
    </div>
  );
};

export default OutfitForm;
