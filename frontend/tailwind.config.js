/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        panel: "#f5f5f5",
        electric: "#1a1a1a",
        neon: "#444444",
      },
      boxShadow: {
        glass: "0 8px 30px rgba(0, 0, 0, 0.08)",
      },
      backgroundImage: {
        "mesh-gradient":
          "radial-gradient(circle at 18% 14%, rgba(0,0,0,0.04), transparent 40%), radial-gradient(circle at 85% 20%, rgba(0,0,0,0.03), transparent 32%), radial-gradient(circle at 50% 85%, rgba(0,0,0,0.04), transparent 40%)",
      },
      fontFamily: {
        display: ["Poppins", "ui-sans-serif", "system-ui"],
        body: ["Inter", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
}
