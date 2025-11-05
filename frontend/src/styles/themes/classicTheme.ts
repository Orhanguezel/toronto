// src/styles/themes/classicTheme.ts
import { DefaultTheme } from "styled-components";

const classicTheme: DefaultTheme = {
  templateName: "classic",

  fonts: {
    main: "'Segoe UI', Arial, sans-serif",
    special: "'Georgia', serif",
    heading: "'Georgia', serif",
    body: "'Segoe UI', Arial, sans-serif",
    mono: "'Fira Code', monospace",
  },

  fontSizes: {
    base: "16px",
    xsmall: "14px",
    small: "16px",
    medium: "20px",
    large: "26px",
    xlarge: "32px",
    h1: "clamp(2.8rem, 7vw, 4.5rem)",
    h2: "2.5rem",
    h3: "2rem",
    h4: "1.5rem",
    h5: "1.05rem",
    h6: "1rem",
    xs: "0.8rem",
    sm: "0.9rem",
    md: "1.1rem",
    lg: "1.4rem",
    xl: "1.8rem",
    "2xl": "2.2rem",
    "3xl": "3rem",
  },

  fontWeights: {
    thin: 200,
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
    extraBold: 800,
  },

  lineHeights: {
    normal: "1.5",
    relaxed: "1.7",
    loose: "2",
  },

  spacings: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "40px",
    xxxl: "56px",
  },

  radii: {
    none: "0px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "20px",
    pill: "9999px",
    circle: "50%",
  },

  borders: {
    thin: "1px solid",
    thick: "2px solid",
  },

  shadows: {
    xs: "0 1px 2px rgba(0,0,0,0.50)",
    sm: "0 2px 6px rgba(0,0,0,0.55)",
    md: "0 6px 18px rgba(0,0,0,0.60)",
    lg: "0 12px 24px rgba(0,0,0,0.65)",
    xl: "0 18px 36px rgba(0,0,0,0.70)",
    form: "0 6px 20px rgba(0,0,0,0.58)",
    button: "0 2px 10px rgba(0,0,0,0.45)",
  },

  transition: {
    fast: "0.2s ease-in-out",
    normal: "0.3s ease-in-out",
    slow: "0.5s ease-in-out",
  },

  durations: {
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
  },

  layout: {
    containerWidth: "1280px",
    sectionspacings: "3rem",
  },

  zIndex: {
    dropdown: 1000,
    modal: 1100,
    overlay: 1200,
    tooltip: 1300,
  },

  opacity: {
    disabled: 0.5,
    hover: 0.9,
  },

  breakpoints: {
    mobileS: "320px",
    mobileM: "375px",
    mobileL: "425px",
    tabletS: "600px",
    tablet: "768px",
    laptopS: "900px",
    laptop: "1024px",
    desktop: "1440px",
    desktopL: "1640px",
  },

  media: {
    xsmall: "@media (max-width: 480px)",
    small: "@media (max-width: 768px)",
    medium: "@media (max-width: 1024px)",
    large: "@media (max-width: 1440px)",
    xlarge: "@media (min-width: 1441px)",
    mobile: "@media (max-width: 768px)",
    tablet: "@media (min-width: 769px) and (max-width: 1024px)",
    desktop: "@media (min-width: 1025px)",
    landscape: "@media (orientation: landscape)",
    portrait: "@media (orientation: portrait)",
    retina: "@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)",
  },

  colors: {
    // yüzeyler
    background: "#0A1020",
    backgroundSecondary: "#0C1428",
    backgroundAlt: "#0E1830",
    sectionBackground: "#0E1830",
    contentBackground: "#0C1428",
    footerBackground: "#0C1428",
    warningBackground: "#2A193C",
    successBg: "#163B24",
    dangerBg: "#3C1F24",

    // başarı/hero
    achievementBackground: "#0F1C37",
    achievementGradientStart: "#2865E0",
    achievementGradientEnd: "#218FFF",

    overlayStart: "rgba(255,255,255,0.06)",
    overlayEnd: "rgba(255,255,255,0.10)",
    overlayBackground: "rgba(0,0,0,0.55)",
    skeleton: "rgba(255,255,255,0.08)",
    skeletonBackground: "rgba(255,255,255,0.06)",

    // metin
    text: "#FFFFFF",
    textAlt: "#EAF0FF",
    textSecondary: "#B8C4E6",
    textPrimary: "#FFFFFF",
    textMuted: "#A0ACC9",
    textLight: "#D6DDF1",
    title: "#FFFFFF",
    textOnWarning: "#FFFFFF",
    textOnSuccess: "#FFFFFF",
    textOnDanger: "#FFFFFF",

    // marka/aksiyon
    primary: "#218FFF",
    primaryLight: "#E6F1FF",
    primaryHover: "#2865E0",
    primaryDark: "#1B57B3",
    primaryTransparent: "rgba(33,143,255,0.12)",

    // ikincil
    secondary: "#4D3763",
    secondaryLight: "#EDE6F5",
    secondaryHover: "#3F2A53",
    secondaryDark: "#2A193C",
    secondaryTransparent: "rgba(77,55,99,0.12)",

    // accent
    accent: "#218FFF",
    accentHover: "#2865E0",
    accentText: "#FFFFFF",

    // kenarlık
    border: "rgba(255,255,255,0.18)",
    borderLight: "rgba(255,255,255,0.12)",
    borderBright: "rgba(255,255,255,0.24)",
    borderBrighter: "rgba(255,255,255,0.32)",
    borderHighlight: "#218FFF",
    borderInput: "rgba(255,255,255,0.18)",

    // kartlar
    card: "#0E1830",
    cardBackground: "#0E1830",

    // buton default
    buttonBackground: "#218FFF",
    buttonText: "#FFFFFF",
    buttonBorder: "#218FFF",

    // linkler
    link: "#218FFF",
    linkHover: "#2865E0",

    // hover yüzeyi
    hoverBackground: "rgba(255,255,255,0.06)",
    shadowHighlight: "0 0 0 3px rgba(33,143,255,0.25)",

    // durum
    success: "#28a745",
    warning: "#ffc107",
    warningHover: "#e0a800",
    danger: "#dc3545",
    dangerHover: "#c82333",
    error: "#dc3545",
    info: "#17a2b8",
    muted: "#6c757d",
    disabled: "#5A637A",

    // inputlar
    placeholder: "rgba(232,234,237,0.60)",
    inputBorder: "rgba(255,255,255,0.18)",
    inputBorderFocus: "#218FFF",
    inputOutline: "#218FFF",
    inputIcon: "#A7C2FF",
    inputBackground: "#121C34",
    inputBackgroundLight: "#101A32",
    inputBackgroundSofter: "#0E1830",
    inputBackgroundFocus: "#192544", // ✅ eklendi

    // diğer
    tableHeader: "rgba(255,255,255,0.06)",
    tagBackground: "rgba(255,255,255,0.08)",
    grey: "#A0ACC9",
    darkGrey: "#2E3A57",
    black: "#000000",
    white: "#FFFFFF",
    whiteColor: "#FFFFFF",
    darkColor: "#0A1020",
    disabledBg: "rgba(255,255,255,0.10)",
    lightGrey: "rgba(255,255,255,0.12)",
  },

  buttons: {
    primary: {
      background: "#218FFF",
      backgroundHover: "#2865E0",
      text: "#FFFFFF",
      textHover: "#FFFFFF",
    },
    secondary: {
      background: "rgba(255,255,255,0.08)",
      backgroundHover: "rgba(255,255,255,0.12)",
      text: "#FFFFFF",
      textHover: "#FFFFFF",
    },
    success: {
      background: "#28a745",
      backgroundHover: "#218838",
      text: "#FFFFFF",
      textHover: "#FFFFFF",
    },
    warning: {
      background: "#ffc107",
      backgroundHover: "#e0a800",
      text: "#0A1020",
      textHover: "#0A1020",
    },
    danger: {
      background: "#dc3545",
      backgroundHover: "#c82333",
      text: "#FFFFFF",
      textHover: "#FFFFFF",
    },
  },

  inputs: {
    background: "#121C34",
    border: "rgba(255,255,255,0.18)",
    borderFocus: "#218FFF",
    text: "#FFFFFF",
    placeholder: "rgba(232,234,237,0.60)",
  },

  cards: {
    background: "#0E1830",
    hoverBackground: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.12)",
    shadow: "0 8px 24px rgba(0,0,0,0.55)",
  },
};

export default classicTheme;
