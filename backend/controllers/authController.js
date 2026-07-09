const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateTokens");

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Password policy: min 8 chars + lowercase + uppercase + number + special char
const validatePassword = (password) => {
  if (!password || password.length < 8) return "Password must be at least 8 characters long";
  if (!/[a-z]/.test(password)) return "Password must include a lowercase letter";
  if (!/[A-Z]/.test(password)) return "Password must include an uppercase letter";
  if (!/[0-9]/.test(password)) return "Password must include a number";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password must include a special character";
  return null;
};

const issueTokensAndRespond = async (user, res, statusCode = 200) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

  res.status(statusCode).json({
    success: true,
    accessToken,
    user: user.toPublicJSON(),
  });
};

// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }
  const pwError = validatePassword(password);
  if (pwError) {
    res.status(400);
    throw new Error(pwError);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  // Only allow self-signup as customer or seller; "stylist" requires membership payment, "admin" is never self-assigned
  const allowedSelfRoles = ["customer", "seller"];
  const finalRole = allowedSelfRoles.includes(role) ? role : "customer";

  const user = await User.create({ name, email, password, role: finalRole });

  // Email verification token (sent via email; verification route below)
  const verifyToken = crypto.randomBytes(32).toString("hex");
  user.emailVerificationToken = crypto.createHash("sha256").update(verifyToken).digest("hex");
  await user.save();

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
  await sendEmail({
    to: user.email,
    subject: "Verify your StyleHub account",
    html: `<p>Hi ${user.name}, click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
  });

  await issueTokensAndRespond(user, res, 201);
});

// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  await issueTokensAndRespond(user, res, 200);
});

// @route POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401);
    throw new Error("No refresh token provided");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    res.status(401);
    throw new Error("Refresh token invalid or expired");
  }

  const user = await User.findById(decoded.id).select("+refreshToken");
  if (!user || user.refreshToken !== token) {
    res.status(401);
    throw new Error("Refresh token does not match");
  }

  const accessToken = generateAccessToken(user._id);
  res.json({ success: true, accessToken });
});

// @route POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    const user = await User.findOne({ refreshToken: token });
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
  }
  res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
  res.json({ success: true, message: "Logged out" });
});

// @route POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  // Always respond success-shaped to avoid leaking which emails exist
  if (!user) {
    return res.json({ success: true, message: "If that email exists, a code was sent" });
  }

  const otp = String(crypto.randomInt(100000, 1000000)); // 6-digit code
  user.resetPasswordToken = crypto.createHash("sha256").update(otp).digest("hex");
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
  await user.save();

  // Visible in the backend console even when SMTP isn't configured
  console.log(`[password reset OTP] ${user.email} -> ${otp}`);

  await sendEmail({
    to: user.email,
    subject: "Your StyleHub password reset code",
    html: `<p>Hi ${user.name}, your password reset code is <b style="font-size:20px;letter-spacing:3px">${otp}</b>. It expires in 10 minutes.</p>`,
  });

  res.json({ success: true, message: "If that email exists, a code was sent" });
});

// Finds a user whose stored OTP hash + expiry still match
const findUserByOtp = async (email, otp) => {
  if (!email || !otp) return null;
  const hashed = crypto.createHash("sha256").update(String(otp)).digest("hex");
  return User.findOne({
    email,
    resetPasswordToken: hashed,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+resetPasswordToken +resetPasswordExpire");
};

// @route POST /api/auth/verify-otp  { email, otp }
// Lets the frontend confirm the code before showing the new-password step
const verifyResetOtp = asyncHandler(async (req, res) => {
  const user = await findUserByOtp(req.body.email, req.body.otp);
  if (!user) {
    res.status(400);
    throw new Error("Code is invalid or has expired");
  }
  res.json({ success: true, message: "Code verified" });
});

// @route POST /api/auth/reset-password  { email, otp, password }
const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;
  const pwError = validatePassword(password);
  if (pwError) {
    res.status(400);
    throw new Error(pwError);
  }

  const user = await findUserByOtp(email, otp);
  if (!user) {
    res.status(400);
    throw new Error("Code is invalid or has expired");
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ success: true, message: "Password reset successful, please log in" });
});

// @route GET /api/auth/verify-email/:token
const verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({ emailVerificationToken: hashedToken }).select(
    "+emailVerificationToken"
  );

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired verification link");
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  await user.save();

  res.json({ success: true, message: "Email verified" });
});

// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toPublicJSON() });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  verifyResetOtp,   // <-- add this line
  resetPassword,
  verifyEmail,
  getMe,
};
