import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-ink/8 mt-20 py-10 text-sm text-ink/50">
    <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <Link to="/" className="font-display text-xl text-ink">
        Style<span className="text-moss">Hub</span>
      </Link>
      <div className="flex gap-6">
        <Link to="/outfits"  className="hover:text-ink transition-colors">Outfits</Link>
        <Link to="/products" className="hover:text-ink transition-colors">Products</Link>
        <Link to="/become-stylist" className="hover:text-ink transition-colors">Become a stylist</Link>
      </div>
      <p className="text-ink/30 text-xs">© {new Date().getFullYear()} StyleHub</p>
    </div>
  </footer>
);

export default Footer;
