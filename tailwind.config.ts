import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom event company colors - Modern Light Theme
        coral: {
          DEFAULT: "hsl(var(--navy))",
          light: "hsl(var(--navy-light))",
        },
        amber: {
          DEFAULT: "hsl(var(--gold))",
          light: "hsl(var(--gold-light))",
        },
        // Aliases to match component usage
        navy: "hsl(var(--navy))",
        "navy-light": "hsl(var(--navy-light))",
        "navy-dark": "hsl(var(--navy-dark))",
        gold: "hsl(var(--gold))",
        "gold-light": "hsl(var(--gold-light))",
        "gold-dark": "hsl(var(--gold-dark))",
        cream: "hsl(var(--cream))",
        "white-soft": "hsl(var(--white-soft))",
        "gray-light": "hsl(var(--gray-light))",
        "gray-medium": "hsl(var(--gray-medium))",
        "gray-dark": "hsl(var(--gray-dark))",
        // Admin colors
        "admin-bg": "hsl(var(--admin-bg))",
        "admin-card": "hsl(var(--admin-card))",
        "admin-border": "hsl(var(--admin-border))",
        "admin-accent": "hsl(var(--admin-accent))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in": {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "slide-in": {
          from: {
            transform: "translateX(-100%)",
          },
          to: {
            transform: "translateX(0)",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0) scale(1)",
          },
          "50%": {
            transform: "translateY(-8px) scale(1.05)",
          },
        },
        heartbeat: {
          "0%, 100%": {
            transform: "scale(1)",
          },
          "14%": {
            transform: "scale(1.1)",
          },
          "28%": {
            transform: "scale(1)",
          },
          "42%": {
            transform: "scale(1.1)",
          },
          "70%": {
            transform: "scale(1)",
          },
        },
        "glow-pulse": {
          "0%, 100%": {
            opacity: "0.8",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "1",
            transform: "scale(1.1)",
          },
        },
        sparkle: {
          "0%, 100%": {
            transform: "rotate(0deg) scale(1)",
            opacity: "0.7",
          },
          "25%": {
            transform: "rotate(90deg) scale(1.2)",
            opacity: "1",
          },
          "50%": {
            transform: "rotate(180deg) scale(0.8)",
            opacity: "0.5",
          },
          "75%": {
            transform: "rotate(270deg) scale(1.1)",
            opacity: "0.9",
          },
        },
        "gradient-shift": {
          "0%": {
            background: "linear-gradient(135deg, hsl(35 85% 55%), hsl(40 90% 65%))",
          },
          "50%": {
            background: "linear-gradient(135deg, hsl(40 90% 65%), hsl(35 85% 55%), hsl(220 25% 20%))",
          },
          "100%": {
            background: "linear-gradient(135deg, hsl(35 85% 55%), hsl(40 90% 65%))",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out",
        "slide-in": "slide-in 0.5s ease-out",
        float: "float 3s ease-in-out infinite",
        heartbeat: "heartbeat 2s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        sparkle: "sparkle 4s ease-in-out infinite",
        "gradient-shift": "gradient-shift 6s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-hero": "var(--gradient-hero)",
        "gradient-gold": "var(--gradient-gold)",
        "gradient-subtle": "var(--gradient-subtle)",
      },
      boxShadow: {
        elegant: "var(--shadow-elegant)",
        gold: "var(--shadow-gold)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
