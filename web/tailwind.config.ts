import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
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
        // sNAKr Grape Purple System (Logo-Matched)
        grape: {
          primary: "#6A33A8",    // Primary Grape - hero purple
          deep: "#652FA4",       // Deep Grape - hover states
          shadow: "#622CA1",     // Shadow Grape - borders, outlines
          soft: "#8B5FC7",       // Soft Grape - secondary, highlights
          hover: "#7A3FC2",      // Dark mode hover
          pressed: "#5B2C91",    // Dark mode pressed
        },
        // Leaf Green Accent (from grape stem)
        leaf: {
          DEFAULT: "#92C22D",    // Use sparingly for positive signals
        },
        // Dark Mode Surfaces
        dark: {
          bg: "#120B1A",         // App background (deep aubergine-black)
          surface: "#1A1026",    // Elevated surface
          card: "#231338",       // Card background
          cardActive: "#2E1B4A", // Selected/active card
        },
        // Dark Mode Text
        darkText: {
          primary: "#F4ECFA",    // Soft white
          secondary: "#C9B3E6",  // Secondary text
          muted: "#9A86B5",      // Muted/meta text
        },
        // Utility colors
        success: "#92C22D",      // Leaf green
        warning: "#F59E0B",      // Soft amber
        danger: "#DC2626",       // Warm red
        info: "#6A33A8",         // Primary grape
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // sNAKr specific radius values
        button: "12px",
        card: "16px",
        modal: "20px",
        chip: "999px",
      },
      spacing: {
        // Keep default Tailwind spacing and add custom ones
        '18': '4.5rem',
        '88': '22rem',
      },
      maxWidth: {
        // sNAKr max content width
        'content': '1100px',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
