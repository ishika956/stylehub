import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { validatePassword } from "../utils/validatePassword";
import PasswordChecklist from "../components/PasswordChecklist";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "customer" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!validatePassword(form.password)) {
        return toast.error("Password doesn't meet the requirements");
      }
      await register(form);
      toast.success("Account created!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="font-display text-3xl mb-1">Create your account</h1>
      <p className="text-ink/60 mb-6">Buy, sell, or style — choose how you want to join.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Full name</label>
          <input
            required
            className="input mt-1"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            required
            className="input mt-1"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            required
            minLength={8}
            className="input mt-1"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <PasswordChecklist password={form.password} />
        </div>
        <div>
          <label className="text-sm font-medium">I want to join as</label>
          <select
            className="input mt-1"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="customer">Customer — buy clothes &amp; outfits</option>
            <option value="seller">Seller — list my own products</option>
          </select>
          <p className="text-xs text-ink/50 mt-1">
            You can upgrade to Stylist any time from your profile.
          </p>
        </div>
        <button disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm mt-6 text-ink/60">
        Already have an account?{" "}
        <Link to="/login" className="text-moss font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default Register;
