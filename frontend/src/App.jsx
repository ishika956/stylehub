import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
// import ResetPassword from "./pages/ResetPassword";

import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Outfits from "./pages/Outfits";
import OutfitDetails from "./pages/OutfitDetails";
import StylistProfile from "./pages/StylistProfile";

import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";

import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import Notifications from "./pages/Notifications";
import BecomeStylist from "./pages/BecomeStylist";

import SellerDashboard from "./pages/seller/SellerDashboard";
import ManageProducts from "./pages/seller/ManageProducts";
import ProductForm from "./pages/seller/ProductForm";

import StylistDashboard from "./pages/stylist/StylistDashboard";
import ManageOutfits from "./pages/stylist/ManageOutfits";
import OutfitForm from "./pages/stylist/OutfitForm";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminComments from "./pages/admin/AdminComments";

import NotFound from "./pages/NotFound";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 w-full py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* <Route path="/reset-password/:token" element={<ResetPassword />} /> */}

          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/outfits" element={<Outfits />} />
          <Route path="/outfits/:id" element={<OutfitDetails />} />
          <Route path="/stylists/:id" element={<StylistProfile />} />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route path="/order-success/:id" element={<OrderSuccess />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/become-stylist"
            element={
              <ProtectedRoute>
                <BecomeStylist />
              </ProtectedRoute>
            }
          />

          {/* Seller */}
          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute roles={["seller", "admin"]}>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/products"
            element={
              <ProtectedRoute roles={["seller", "admin"]}>
                <ManageProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/products/new"
            element={
              <ProtectedRoute roles={["seller", "admin"]}>
                <ProductForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller/products/:id/edit"
            element={
              <ProtectedRoute roles={["seller", "admin"]}>
                <ProductForm />
              </ProtectedRoute>
            }
          />

          {/* Stylist */}
          <Route
            path="/stylist/dashboard"
            element={
              <ProtectedRoute roles={["stylist", "admin"]}>
                <StylistDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stylist/outfits"
            element={
              <ProtectedRoute roles={["stylist", "admin"]}>
                <ManageOutfits />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stylist/outfits/new"
            element={
              <ProtectedRoute roles={["stylist", "admin"]}>
                <OutfitForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stylist/outfits/:id/edit"
            element={
              <ProtectedRoute roles={["stylist", "admin"]}>
                <OutfitForm />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/comments"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminComments />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
