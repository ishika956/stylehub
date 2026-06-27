import React, { useEffect, useState } from "react";
import api from "../api/axios";
import OutfitCard from "../components/OutfitCard";
import Loader from "../components/Loader";

const OCCASIONS = ["College", "Office", "Wedding", "Interview", "Party", "Casual", "Date", "Festive"];
const STYLES    = ["Streetwear", "Formal", "Casual", "Ethnic", "Athleisure", "Minimal"];

const Outfits = () => {
  const [outfits, setOutfits]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filters, setFilters]   = useState({ occasion: "", style: "", maxBudget: "", sort: "" });
  const [page, setPage]         = useState(1);
  const [pages, setPages]       = useState(1);

  const fetchOutfits = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await api.get("/outfits", { params });
      setOutfits(data.outfits);
      setPages(data.pages);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOutfits(); }, [page]);

  const handleFilterSubmit = (e) => { e.preventDefault(); setPage(1); fetchOutfits(); };

  const clearFilters = () => {
    setFilters({ occasion: "", style: "", maxBudget: "", sort: "" });
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div>
      {/* Page header */}
      <div className="py-8 border-b border-ink/8 mb-8">
        <p className="eyebrow mb-2">Styled by real people</p>
        <h1 className="font-display text-4xl md:text-5xl">Discover outfits</h1>
        <p className="text-ink/50 mt-2 text-[15px]">
          Curated looks from verified stylists — find your next outfit for any occasion.
        </p>
      </div>

      {/* Filters */}
      <form onSubmit={handleFilterSubmit} className="flex flex-wrap gap-2.5 mb-8 items-center">
        <select
          className="input !w-auto min-w-[130px] cursor-pointer"
          value={filters.occasion}
          onChange={(e) => setFilters({ ...filters, occasion: e.target.value })}
        >
          <option value="">Any occasion</option>
          {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <select
          className="input !w-auto min-w-[120px] cursor-pointer"
          value={filters.style}
          onChange={(e) => setFilters({ ...filters, style: e.target.value })}
        >
          <option value="">Any style</option>
          {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input
          type="number"
          placeholder="Max budget (₹)"
          className="input !w-auto min-w-[140px]"
          value={filters.maxBudget}
          onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })}
        />
        <select
          className="input !w-auto min-w-[140px] cursor-pointer"
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
        >
          <option value="">Sort: newest</option>
          <option value="popular">Most liked</option>
          <option value="bestselling">Best selling</option>
          <option value="price_asc">Budget: low to high</option>
        </select>
        <button type="submit" className="btn-primary">Apply</button>
        {hasActiveFilters && (
          <button type="button" onClick={clearFilters} className="btn-ghost text-clay">
            Clear
          </button>
        )}
      </form>

      {loading ? (
        <Loader />
      ) : outfits.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🪴</p>
          <p className="font-display text-xl mb-1">No outfits found</p>
          <p className="text-ink/40 text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="masonry">
            {outfits.map((o) => (
              <div className="masonry-item" key={o._id}>
                <OutfitCard outfit={o} />
              </div>
            ))}
          </div>

          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-outline py-2 px-4 disabled:opacity-40"
              >←</button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                    n === page
                      ? "bg-ink text-bone shadow-sm"
                      : "hover:bg-sand text-ink/60"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="btn-outline py-2 px-4 disabled:opacity-40"
              >→</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Outfits;
