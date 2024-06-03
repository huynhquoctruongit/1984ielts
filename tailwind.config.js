/** @type {import('tailwindcss').Config} */
const { nextui } = require("@nextui-org/react");

const colors = require("tailwindcss/colors");
export default {
  plugins: [
    nextui({
      themes: {
        light: {
          layout: {}, // light theme layout tokens
          colors: {
            primary: "#F15F22",
            blue: "#C12525",
            secondary: "#ffefe7",
            "primary-foreground": "white",
          }, // light theme colors
        },
        dark: {
          layout: {}, // dark theme layout tokens
          colors: {}, // dark theme colors
        },
      },
    }),
  ],

  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Roboto", "sans-serif"],
    },
    extend: {
      colors: {
        transparent: "transparent",
        current: "currentColor",
        white: "#FFFFFF",
        black: "#242424",
        dark: {
          "05": "#FFF",
          "08": "#EBEBF52E",
        },
        background: {
          DEFAULT: "#D1D1D6",
          "01": "#F2F2F7",
        },
        neutral: {
          "01": "#000",
          "06": "#E5E5EA",
          "07": "#FFFFFF",
        },
        light: {
          "01": "#000",
          "02": "#3C3C4399",
          "04": "#3C3C432E",
          "06": "#E5E5EA",
        },
        pastel: {
          "01": "var(--color-primary1)",
          "02": "var(--color-primary2)",
          "09": "#57CD96",
        },
        teritary: {
          "01": "#FF3B30",
          "02": "#FC0",
          "03": "#34C759",
          "04": "#00C7BE",
          "05": "#30B0C7",
          "06": "#007AFF",
          "07": "#5856D6",
          "08": "#AF52DE",
          "09": "#FF4266",
          10: "#A2845E",
        },
        primary: {
          "00": "#2B3242",
          "01": "rgb(var(--color-primary-01) / <alpha-value>)",
          "02": "rgb(var(--color-primary-02) / <alpha-value>)",
        },
        current: "currentColor",
        white: "#FFFFFF",
        black: "#242424",
        primary1: "rgb(var(--color-primary-01) / <alpha-value>)",
        primary2: "rgb(var(--color-primary-02) / <alpha-value>)",
        neu1: "var(--color-neu1)",
        neu2: "var(--color-neu2)",
        neu3: "var(--color-neu3)",
        neu4: "var(--color-neu4)",
        neu5: "var(--color-neu5)",
        neu6: "var(--color-neu6)",
        neu7: "var(--color-neu7)",
        neu8: "var(--color-neu8)",
        green1: "var(--color-green1)",
        yellow: "var(--color-orange)",
        red: "var(--color-red)",
        secondary: "#eee8e3",
        pure: "#7635c8",
        blurgray: "#2b2f8e",
        blurlight: "#3369f4",
        graydefault: "#f7f7f7",
        greenpastel: "#ebfdef",
        orangepastel: "#ffefe7",
        bluepastel: "#e8eff9",
        greypastel: "#EFB495",
        neutrual: {
          "06": "#E5E5EA",
        },
        light: {
          "02": "rgba(60, 60, 67, 0.60)",
          "01": "#000",
        },
      },
    },
  },
};
