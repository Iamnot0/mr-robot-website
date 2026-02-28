/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],           // toggled by adding/removing .dark
	content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
	theme: {
	  extend: {
		fontFamily: {
		  playfair: ["Playfair Display", "serif"],
		  sans: ["Inter", "system-ui", "sans-serif"],
		},
		borderRadius: {
		  lg: "var(--radius)",
		  md: "calc(var(--radius) - 2px)",
		  sm: "calc(var(--radius) - 4px)",
		},
		colors: {
		  // Brand palette (optional direct hex access)
		  "oxford-blue": {
			DEFAULT: "#002147",
			600: "#001B36",
			700: "#002147",
			800: "#001A39",
			900: "#000C1D",
		  },
		  tan: {
			DEFAULT: "#d2b48c",
			600: "#b89a6b",
			700: "#9e8054",
			800: "#846a47",
			900: "#6b553a",
		  },
  
		  // CSS-variable driven tokens (match master.css)
		  background: "var(--background)",
		  foreground: "var(--foreground)",
		  card: { DEFAULT: "var(--card)", foreground: "var(--card-foreground)" },
		  popover: { DEFAULT: "var(--popover)", foreground: "var(--popover-foreground)" },
		  primary: { DEFAULT: "var(--primary)", foreground: "var(--primary-foreground)" },
		  secondary: { DEFAULT: "var(--secondary)", foreground: "var(--secondary-foreground)" },
		  muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)", light: "var(--muted-light)" },
		  accent: { DEFAULT: "var(--accent)", foreground: "var(--accent-foreground)" },
		  destructive: { DEFAULT: "var(--destructive)", foreground: "var(--destructive-foreground)" },
		  border: "var(--border)",
		  input: "var(--input)",
		  ring: "var(--ring)",
  
		  // Section-specific
		  "navbar-bg": "var(--navbar-bg)",
		  "navbar-text": "var(--navbar-text)",
		  "navbar-hover": "var(--navbar-hover)",
		  "hero-bg": "var(--hero-bg)",
		  "hero-text": "var(--hero-text)",
		  "hero-subtext": "var(--hero-subtext)",
		  "services-bg": "var(--services-bg)",
		  "services-card-bg": "var(--services-card-bg)",
		  "testimonials-bg": "var(--testimonials-bg)",
		  "testimonials-card-bg": "var(--testimonials-card-bg)",
		  "footer-bg": "var(--footer-bg)",
		  "footer-text": "var(--footer-text)",
		  "footer-hover": "var(--footer-hover)",
  
		  // Chart slots (fixed extra ')')
		  chart: {
			1: "var(--chart-1)",
			2: "var(--chart-2)",
			3: "var(--chart-3)",
			4: "var(--chart-4)",
			5: "var(--chart-5)",
		  },
		},
		keyframes: {
		  "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
		  "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
		},
		animation: {
		  "accordion-down": "accordion-down 0.2s ease-out",
		  "accordion-up": "accordion-up 0.2s ease-out",
		},
	  },
	},
	plugins: [require("tailwindcss-animate")],
  };
  