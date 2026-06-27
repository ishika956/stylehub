import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="text-center py-24">
    <h1 className="font-display text-4xl mb-2">404</h1>
    <p className="text-ink/60 mb-6">This page doesn't exist.</p>
    <Link to="/" className="btn-primary">Go home</Link>
  </div>
);

export default NotFound;
