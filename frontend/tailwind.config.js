/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
      },
      colors: {
        ink: {
          50: "#f6f7fb",
          100: "#e7ebf5",
          200: "#cfd8ea",
          300: "#aab8d7",
          400: "#7e8eb8",
          500: "#566487",
          600: "#3f4a66",
          700: "#2d3551",
          800: "#1d2438",
          900: "#111725",
          950: "#0b0f1a"
        },
        accent: {
          50: "#eefbf8",
          100: "#d5f5ec",
          200: "#a8ead9",
          300: "#6dd7bd",
          400: "#34c49d",
          500: "#1aa37f",
          600: "#118069",
          700: "#0f6454",
          800: "#0f5145",
          900: "#0d4339"
        },
        status: {
          todo: "#6878a8",
          "todo-bg": "rgba(104, 120, 168, 0.12)",
          progress: "#e2a545",
          "progress-bg": "rgba(226, 165, 69, 0.12)",
          done: "#34c49d",
          "done-bg": "rgba(52, 196, 157, 0.12)"
        }
      },
      boxShadow: {
        soft: "0 18px 50px rgba(17, 23, 37, 0.12)",
        glow: "0 0 20px rgba(26, 163, 127, 0.15)",
        "glow-lg": "0 0 40px rgba(26, 163, 127, 0.2)",
        card: "0 4px 24px rgba(0, 0, 0, 0.25)",
        "card-hover": "0 8px 32px rgba(0, 0, 0, 0.35)"
      },
      borderRadius: {
        xl2: "1rem"
      },
      backdropBlur: {
        xs: "2px"
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out both",
        "slide-up": "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-down": "slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) both",
        "scale-in": "scaleIn 0.2s ease-out both",
        shimmer: "shimmer 2s infinite linear",
        "pulse-dot": "pulseDot 1.4s infinite ease-in-out both",
        float: "float 6s ease-in-out infinite"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        pulseDot: {
          "0%, 80%, 100%": { transform: "scale(0.6)", opacity: "0.4" },
          "40%": { transform: "scale(1)", opacity: "1" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" }
        }
      }
    }
  },
  plugins: []
};
