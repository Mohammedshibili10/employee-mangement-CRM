/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // Use Inter as the primary UI font (loaded in index.html).
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      // Brand palette (emerald-based green) so we can use bg-brand-500 etc.
      colors: {
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
      },

      // Soft, layered shadows for a premium, depth-rich look.
      boxShadow: {
        soft: "0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)",
        card: "0 6px 24px -10px rgba(15,23,42,0.12)",
        premium: "0 18px 50px -16px rgba(15,23,42,0.22)",
        glow: "0 10px 30px -8px rgba(16,185,129,0.45)",
        "glow-sm": "0 6px 18px -6px rgba(16,185,129,0.40)",
      },

      // Reusable gradients.
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #34d399 0%, #10b981 45%, #059669 100%)",
        "brand-gradient-soft": "linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)",
        "app-radial":
          "radial-gradient(1200px 600px at 100% -10%, rgba(16,185,129,0.10), transparent 60%), radial-gradient(900px 500px at -10% 10%, rgba(45,212,191,0.10), transparent 55%)",
        shimmer:
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.65) 50%, transparent 100%)",
      },

      // Entrance + loading animations.
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        "fade-in-up": "fade-in-up 0.5s ease-out both",
        "scale-in": "scale-in 0.22s ease-out both",
        "slide-in-left": "slide-in-left 0.4s ease-out both",
        shimmer: "shimmer 1.6s infinite",
        "spin-slow": "spin 1.2s linear infinite",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
