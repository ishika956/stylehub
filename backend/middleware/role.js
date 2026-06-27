// Role-based access control middleware.
// Usage: authorize("seller", "admin")
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error("Not authorized, please log in"));
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403);
      return next(
        new Error(`Role '${req.user.role}' is not allowed to access this resource`)
      );
    }
    next();
  };
};

// Checks that the stylist membership is currently active (not just role === 'stylist')
const requireActiveMembership = (req, res, next) => {
  if (req.user.role === "admin") return next(); // admins bypass membership checks
  const m = req.user.membership;
  if (req.user.role !== "stylist" || !m?.isActive || new Date(m.expiresAt) < new Date()) {
    res.status(403);
    return next(new Error("An active stylist membership is required for this action"));
  }
  next();
};

module.exports = { authorize, requireActiveMembership };
