import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { items, clearCart } = useCart();
  const [open, setOpen]       = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate              = useNavigate();
  const location              = useLocation();
  const menuRef               = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => { clearCart(); await logout(); navigate("/"); };
  const navLink = (to, label) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors ${
        location.pathname === to ? "text-moss" : "hover:text-moss text-ink/70"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 ${
        scrolled
          ? "bg-bone/95 backdrop-blur-md shadow-[0_1px_12px_rgba(0,0,0,0.06)] border-b border-ink/8"
          : "bg-bone/80 backdrop-blur border-b border-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="font-display text-2xl tracking-tight shrink-0">
          Style<span className="text-moss">Hub</span>
        </Link>

        {/* Centre nav links */}
        <div className="hidden md:flex items-center gap-6">
          {navLink("/products", "Products")}
          {navLink("/outfits", "Outfits")}
          {!user && navLink("/become-stylist", "Become a Stylist")}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          {user && (
          <Link to="/cart" className="relative icon-btn shadow-none hover:bg-sand">
            <svg className="w-5 h-5 text-ink/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
            </svg>
            {items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-clay text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                {items.length}
              </span>
            )}
          </Link>
          )}

          {/* User menu */}
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 rounded-full hover:bg-sand/60 pl-1 pr-3 py-1 transition-colors"
              >
                <span className="w-8 h-8 rounded-full bg-moss text-white flex items-center justify-center text-sm font-semibold shadow-sm">
                  {user.name?.[0]?.toUpperCase()}
                </span>
                <span className="hidden sm:block text-sm font-medium text-ink/80 max-w-[100px] truncate">
                  {user.name?.split(" ")[0]}
                </span>
                <svg
                  className={`w-3.5 h-3.5 text-ink/50 hidden sm:block transition-transform ${open ? "rotate-180" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-52 card shadow-xl p-1.5 text-sm animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-2 border-b border-ink/8 mb-1">
                    <p className="font-semibold text-xs truncate">{user.name}</p>
                    <p className="text-[11px] text-ink/40 truncate">{user.email}</p>
                  </div>
                  {[
                    { to: "/profile",              label: "Profile",           icon: "👤" },
                    { to: "/wishlist",             label: "Wishlist",          icon: "♡" },
                    { to: "/notifications",        label: "Notifications",     icon: "🔔" },
                  ].map(({ to, label, icon }) => (
                    <Link key={to} to={to} className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-sand/60 transition-colors">
                      <span className="text-base">{icon}</span> {label}
                    </Link>
                  ))}
                  {user.role === "seller" && (
                    <Link to="/seller/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-sand/60 transition-colors">
                      <span className="text-base">🏪</span> Seller Dashboard
                    </Link>
                  )}
                  {user.role === "stylist" && (
                    <Link to="/stylist/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-sand/60 transition-colors">
                      <span className="text-base">✨</span> Stylist Dashboard
                    </Link>
                  )}
                  {user.role === "admin" && (
                    <Link to="/admin/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-sand/60 transition-colors">
                      <span className="text-base">⚙️</span> Admin Dashboard
                    </Link>
                  )}
                  {user.role === "customer" && (
                    <Link to="/become-stylist" className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-sand/60 transition-colors">
                      <span className="text-base">🎨</span> Become a Stylist
                    </Link>
                  )}
                  <div className="border-t border-ink/8 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl hover:bg-clay/10 text-clay/80 hover:text-clay transition-colors"
                    >
                      <span className="text-base">↩</span> Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary text-sm py-2 px-4">
              Log in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
