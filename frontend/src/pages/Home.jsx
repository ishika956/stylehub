import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import OutfitCard from "../components/OutfitCard";
import ProductCard from "../components/ProductCard";
import Loader from "../components/Loader";

const Home = () => {
  const [outfits, setOutfits]   = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/outfits?sort=popular&limit=8"),
      api.get("/products?sort=rating&limit=4"),
    ])
      .then(([o, p]) => { setOutfits(o.data.outfits); setProducts(p.data.products); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>

      {/* ── HERO with full background image via .hero-section CSS class ── */}
      <section className="hero-section px-8 md:px-16">
        <div className="max-w-lg fade-up">
          <span className="eyebrow mb-4 inline-block">Curated, not just cataloged</span>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.08] mb-5" style={{color:"#2C2C2C"}}>
            Don't shop <em style={{color:"#C4818A"}}>pieces</em>.
            <br />Shop the whole look.
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{color:"rgba(44,44,44,0.65)", maxWidth:"400px"}}>
            Stylists bundle seller pieces into ready-to-wear outfits for college,
            interviews, weddings — buy the complete look in one click.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/outfits" className="btn-primary text-[15px] px-7 py-3">Browse outfits</Link>
            <Link to="/become-stylist" className="btn-outline text-[15px] px-7 py-3">Become a stylist</Link>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ──────────────────────────────────────────────── */}
      <div className="stats-strip grid grid-cols-3 gap-4 text-center mb-14">
        {[
          { n: "500+", label: "Curated looks" },
          { n: "50+",  label: "Expert stylists" },
          { n: "10K+", label: "Happy shoppers" },
        ].map(({ n, label }) => (
          <div key={label}>
            <p className="font-display text-3xl font-bold">{n}</p>
            <p className="text-xs uppercase tracking-widest mt-0.5" style={{color:"rgba(255,255,255,0.65)"}}>{label}</p>
          </div>
        ))}
      </div>

      {loading ? <Loader /> : (
        <>
          {/* ── TRENDING OUTFITS ─────────────────────────────────────── */}
          <section className="mb-16">
            <div className="flex items-end justify-between mb-7">
              <div>
                <span className="eyebrow mb-1">Fresh from our stylists</span>
                <h2 className="font-display text-4xl">Trending outfits</h2>
              </div>
              <Link to="/outfits" className="btn-ghost">View all →</Link>
            </div>
            <div className="masonry">
              {outfits.map((o) => (
                <div className="masonry-item fade-up" key={o._id}>
                  <OutfitCard outfit={o} />
                </div>
              ))}
            </div>
          </section>

          <div className="divider-rose" />

          {/* ── TOP-RATED PRODUCTS ───────────────────────────────────── */}
          <section className="mb-16">
            <div className="flex items-end justify-between mb-7">
              <div>
                <span className="eyebrow mb-1">Loved by buyers</span>
                <h2 className="font-display text-4xl">Top-rated products</h2>
              </div>
              <Link to="/products" className="btn-ghost">View all →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>

          {/* ── CTA BANNER ───────────────────────────────────────────── */}
          <section className="section-band text-center mb-12">
            <span className="eyebrow mb-3 block">Got an eye for style?</span>
            <h2 className="font-display text-4xl mb-4">Become a StyleHub stylist</h2>
            <p className="text-sm mb-8 max-w-sm mx-auto" style={{color:"rgba(44,44,44,0.60)"}}>
              Curate outfits from our marketplace, build your following, and earn
              a commission on every look you sell.
            </p>
            <Link to="/become-stylist" className="btn-primary px-8 py-3 text-[15px]">Apply now</Link>
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
