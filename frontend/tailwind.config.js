/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink:    "#2C2C2C",   /* soft charcoal — not harsh black */
        bone:   "#FDF8F3",   /* warm ivory page bg */
        cream:  "#F5EDE3",   /* slightly deeper cream for sections */
        petal:  "#F2D4D7",   /* dusty rose — newme primary accent */
        blush:  "#FAE8EB",   /* lightest rose tint for hover/fill */
        mauve:  "#C4818A",   /* deeper rose for text/borders */
        clay:   "#C97B5A",   /* warm terracotta CTA */
        sage:   "#8BAF8D",   /* muted green accent */
        sand:   "#EDE0D4",   /* warm sand for tags / chips */
        rose:   "#D64E6F",   /* like/heart active color */
        mist:   "#F0EBE8",   /* card background tint */
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body:    ["'DM Sans'", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "hero-pattern": "url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80&auto=format&fit=crop')",
      },
    },
  },
  plugins: [],
};
