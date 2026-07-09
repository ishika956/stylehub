export const passwordRules = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
  { label: "One special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export const validatePassword = (p) => passwordRules.every((r) => r.test(p));