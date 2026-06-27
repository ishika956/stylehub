import React from "react";

const Loader = ({ text = "Loading…" }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 rounded-full border-2 border-sand" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-moss animate-spin" />
    </div>
    <p className="text-sm text-ink/40">{text}</p>
  </div>
);

export default Loader;
