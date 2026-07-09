import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { validatePassword } from "../utils/validatePassword";
import PasswordChecklist from "../components/PasswordChecklist";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = email, 2 = code + new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const sendCode = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("If that email exists, a code was sent");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast.error("Passwords do not match");
    if (!validatePassword(password)) {
      return toast.error("Password doesn't meet the requirements");
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email, otp, password });
      toast.success("Password reset! Please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Code is invalid or expired");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="font-display text-3xl mb-1">Reset your password</h1>
      <p className="text-ink/60 mb-6">
        {step === 1
          ? "Enter your email and we'll send you a 6-digit code."
          : `Enter the code sent to ${email} and choose a new password.`}
      </p>

      {step === 1 ? (
        <form onSubmit={sendCode} className="space-y-4">
          <input
            type="email"
            required
            placeholder="you@example.com"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button disabled={loading} className="btn-primary w-full">
            {loading ? "Sending..." : "Send code"}
          </button>
        </form>
      ) : (
        <form onSubmit={submitReset} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            required
            maxLength={6}
            placeholder="6-digit code"
            className="input tracking-[0.4em] text-center text-lg"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="New password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordChecklist password={password} />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Confirm new password"
            className="input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <button disabled={loading} className="btn-primary w-full">
            {loading ? "Saving..." : "Reset password"}
          </button>

          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={() => setStep(1)} className="text-ink/60 hover:underline">
              ← Change email
            </button>
            <button type="button" onClick={sendCode} disabled={loading} className="text-moss hover:underline">
              Resend code
            </button>
          </div>
        </form>
      )}

      <p className="text-center text-sm mt-6 text-ink/60">
        Remembered it?{" "}
        <Link to="/login" className="text-moss font-medium hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;