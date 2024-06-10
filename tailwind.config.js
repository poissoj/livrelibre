/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      primary: {
        default: "hsl(174deg 100% 29%)",
        dark: "hsl(174deg 100% 25%)",
        darker: "hsl(174.5deg 100% 25.5%)",
        darkest: "hsl(174deg 100% 20%)",
      },
      gray: {
        light: "hsl(220deg 13% 91%)",
        default: "hsl(198.8deg 19% 16.5%)",
        dark: "hsl(216.9deg 19.1% 26.7%)",
        darker: "hsl(218deg 19% 11%)",
        darkest: "hsl(197.1deg 21.2% 6.5%)",
      },
      white: "#FFF",
      black: "hsl(210deg 10.8% 14.5%)",
      green: "rgb(101 163 13)",
      yellow: "rgb(250 204 21)",
      red: "rgb(220 38 38)",
      blue: "rgb(37 99 235)",
    },
    extend: {
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
      },
      fontFamily: {
        number: ["Roboto Mono"],
      },
    },
  },
  plugins: [],
};
