import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/axios";

const CATEGORIES = ["T-Shirts", "Shirts", "Hoodies", "Jeans", "Trousers", "Jackets", "Shoes", "Accessories", "Top", "Dress"];

const emptyForm = {
  name: "", description: "", category: "T-Shirts", brand: "",
  price: "", discountPrice: "", color: "", sizes: "", stock: "",
  images: [], gender: "unisex",
};

const ProductForm = () => {
  const { id }  = useParams();
  const isEdit  = Boolean(id);
  const navigate = useNavigate();
  const dropRef  = useRef(null);
  const [form, setForm]         = useState(emptyForm);
  const [loading, setLoading]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/products/${id}`).then(({ data }) => {
        const p = data.product;
        setForm({ ...p, sizes: (p.sizes || []).join(", "), images: p.images || [] });
      });
    }
  }, [id]);

  const uploadFiles = async (files) => {
    if (!files.length) return;
    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));
    setUploading(true);
    try {
      const { data } = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, images: [...prev.images, ...data.urls] }));
      toast.success(`${data.urls.length} image${data.urls.length > 1 ? "s" : ""} uploaded`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Image upload failed");
    } finally { setUploading(false); }
  };

  const handleImageSelect = async (e) => {
    await uploadFiles(Array.from(e.target.files || []));
    e.target.value = "";
  };

  const handleDrop = async (e) => {
    e.preventDefault(); setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    await uploadFiles(files);
  };

  const removeImage = (url) =>
    setForm((prev) => ({ ...prev, images: prev.images.filter((u) => u !== url) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.images.length === 0) return toast.error("Please upload at least one product image");
    setLoading(true);
    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
      stock: Number(form.stock),
      sizes: form.sizes ? form.sizes.split(",").map((s) => s.trim()).filter(Boolean) : [],
    };
    try {
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        toast.success("Product updated");
      } else {
        await api.post("/products", payload);
        toast.success("Product created");
      }
      navigate("/seller/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally { setLoading(false); }
  };
  const [aiLoading, setAiLoading] = useState(false);
  const generateDescription = async () => {
    if (!form.name) return toast.error("Enter a product name first");
    setAiLoading(true);
    try {
      const { data } = await api.post("/ai/product-description", {
        name: form.name, category: form.category, brand: form.brand, color: form.color,
      });
      setForm((f) => ({ ...f, description: data.description }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not generate");
    } finally {
      setAiLoading(false);
    }
  };

  const field = (key, placeholder, type = "text", req = false, extra = {}) => (
    <input
      required={req}
      type={type}
      placeholder={placeholder}
      className="input"
      value={form[key]}
      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      {...extra}
    />
  );

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <p className="eyebrow mb-2">{isEdit ? "Edit product" : "New product"}</p>
        <h1 className="font-display text-4xl">{isEdit ? "Update product" : "Add a product"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Image upload — drag-and-drop zone */}
        <div>
          <label className="text-sm font-medium block mb-2">
            Product images <span className="text-clay">*</span>
          </label>

          <div
            ref={dropRef}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 ${
              dragActive
                ? "border-moss bg-moss/5 scale-[1.01]"
                : "border-ink/15 hover:border-moss/40 hover:bg-sand/30"
            }`}
          >
            {form.images.length > 0 ? (
              <div className="p-3">
                <div className="grid grid-cols-4 gap-2">
                  {form.images.map((url, i) => (
                    <div key={url} className="relative group aspect-square">
                      <img
                        src={url} alt={`Product ${i + 1}`}
                        className="w-full h-full object-cover rounded-xl border border-ink/8"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-clay text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* Add more slot */}
                  <label className="aspect-square rounded-xl border-2 border-dashed border-ink/15 flex flex-col items-center justify-center cursor-pointer hover:border-moss/40 hover:bg-sand/30 transition-colors">
                    <svg className="w-5 h-5 text-ink/30 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span className="text-[10px] text-ink/35">Add more</span>
                    <input type="file" multiple accept="image/*" onChange={handleImageSelect} disabled={uploading} className="sr-only" />
                  </label>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center py-14 cursor-pointer">
                <div className="w-14 h-14 rounded-full bg-sand flex items-center justify-center mb-3">
                  <svg className="w-7 h-7 text-ink/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <p className="font-medium text-sm">Drag & drop or click to upload</p>
                <p className="text-xs text-ink/35 mt-1">JPG, PNG, WEBP up to 10MB each</p>
                <input type="file" multiple accept="image/*" onChange={handleImageSelect} disabled={uploading} className="sr-only" />
              </label>
            )}

            {uploading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-ink/60">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Uploading to Cloudinary…
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Basic info */}
        {/* Basic info */}
        {field("name", "Product name", "text", true)}
        <button type="button" onClick={generateDescription} disabled={aiLoading}
          className="text-xs font-medium text-moss hover:underline mb-1 self-start">
          {aiLoading ? "Generating…" : "✨ Generate with AI"}
        </button>
        <textarea
          rows={3}
          placeholder="Description — fabric, fit, features…"
          className="input"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
          <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option value="unisex">Unisex</option>
            <option value="male">Men</option>
            <option value="female">Women</option>
          </select>
        </div>

        {field("brand", "Brand")}

        <div className="grid grid-cols-2 gap-3">
          {field("price", "Price (₹)", "number", true)}
          {field("discountPrice", "Discount price (optional)", "number")}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {field("color", "Colour")}
          {field("stock", "Stock quantity", "number", true)}
        </div>

        {field("sizes", "Sizes, comma separated — S, M, L, XL")}

        <button disabled={loading || uploading} className="btn-primary w-full py-3 text-[15px]">
          {loading ? "Saving…" : isEdit ? "Save changes" : "Create product"}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
