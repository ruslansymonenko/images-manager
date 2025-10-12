/**
 * Centralized styling variables for Images Manager
 * Contains colors, fonts, spacing, and other design tokens
 */

// Base color palette
export const colors = {
  // Primary brand colors
  primary: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },

  // Secondary colors
  secondary: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },

  // Semantic colors
  success: {
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

  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },

  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },

  info: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
  },

  // Neutral grays
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
    950: "#030712",
  },
} as const;

// Theme-specific color mappings
export const themeColors = {
  light: {
    // Backgrounds
    background: {
      primary: "#ffffff",
      secondary: "#f8fafc",
      tertiary: "#f1f5f9",
      elevated: "#ffffff",
      error: colors.error[400],
    },

    // Text colors
    text: {
      primary: colors.gray[900],
      secondary: colors.secondary[700],
      tertiary: colors.secondary[500],
      inverse: "#ffffff",
      error: colors.error[900],
    },

    // Border colors
    border: {
      primary: colors.secondary[200],
      secondary: colors.secondary[300],
      focus: colors.primary[500],
    },

    // Interactive states
    interactive: {
      primary: colors.primary[500],
      primaryHover: colors.primary[600],
      secondary: colors.secondary[100],
      secondaryHover: colors.secondary[200],
      danger: colors.error[600],
      dangerHover: colors.error[700],
    },
  },

  dark: {
    // Backgrounds
    background: {
      primary: colors.gray[950],
      secondary: colors.gray[900],
      tertiary: colors.gray[800],
      elevated: colors.gray[800],
      error: colors.error[400],
    },

    // Text colors
    text: {
      primary: colors.gray[100],
      secondary: colors.gray[400],
      tertiary: colors.gray[500],
      inverse: colors.gray[900],
      error: colors.error[900],
    },

    // Border colors
    border: {
      primary: colors.gray[700],
      secondary: colors.gray[600],
      focus: colors.primary[500],
    },

    // Interactive states
    interactive: {
      primary: colors.primary[500],
      primaryHover: colors.primary[400],
      secondary: colors.gray[800],
      secondaryHover: colors.gray[700],
      danger: colors.error[500],
      dangerHover: colors.error[400],
    },
  },
} as const;

// Typography
export const typography = {
  fontFamily: {
    sans: ["Inter", "Avenir", "Helvetica", "Arial", "sans-serif"],
    mono: [
      "Fira Code",
      "Monaco",
      "Cascadia Code",
      "Segoe UI Mono",
      "Roboto Mono",
      "Oxygen Mono",
      "Ubuntu Monospace",
      "Source Code Pro",
      "Fira Mono",
      "Droid Sans Mono",
      "Courier New",
      "monospace",
    ],
  },

  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
  },

  fontWeight: {
    thin: "100",
    extralight: "200",
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  },

  lineHeight: {
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
  },
} as const;

// Spacing scale
export const spacing = {
  0: "0px",
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  32: "8rem", // 128px
  40: "10rem", // 160px
  48: "12rem", // 192px
  56: "14rem", // 224px
  64: "16rem", // 256px
} as const;

// Border radius
export const borderRadius = {
  none: "0px",
  sm: "0.125rem", // 2px
  base: "0.25rem", // 4px
  md: "0.375rem", // 6px
  lg: "0.5rem", // 8px
  xl: "0.75rem", // 12px
  "2xl": "1rem", // 16px
  "3xl": "1.5rem", // 24px
  full: "9999px",
} as const;

// Shadows
export const shadows = {
  xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  sm: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  base: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  md: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  lg: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  xl: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
} as const;

// Animation durations
export const animation = {
  duration: {
    fast: "150ms",
    base: "200ms",
    slow: "300ms",
    slower: "500ms",
  },

  easing: {
    linear: "linear",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

// Z-index scale
export const zIndex = {
  hide: -1,
  auto: "auto",
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Breakpoints for responsive design
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

// Component-specific variables
export const components = {
  button: {
    height: {
      sm: "2rem", // 32px
      base: "2.5rem", // 40px
      lg: "3rem", // 48px
    },
    padding: {
      sm: `${spacing[2]} ${spacing[3]}`,
      base: `${spacing[3]} ${spacing[4]}`,
      lg: `${spacing[4]} ${spacing[6]}`,
    },
  },

  input: {
    height: {
      sm: "2rem", // 32px
      base: "2.5rem", // 40px
      lg: "3rem", // 48px
    },
    padding: {
      sm: `${spacing[2]} ${spacing[3]}`,
      base: `${spacing[3]} ${spacing[4]}`,
      lg: `${spacing[4]} ${spacing[6]}`,
    },
  },

  card: {
    padding: spacing[6],
    borderRadius: borderRadius.lg,
  },

  navbar: {
    height: "4rem", // 64px
  },

  sidebar: {
    width: "16rem", // 256px
  },
} as const;

// Predefined tag colors for consistent tag styling
export const tagColors = [
  colors.error[500], // Red
  colors.warning[500], // Orange/Yellow
  colors.success[500], // Green
  colors.info[500], // Blue
  colors.primary[500], // Primary blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#84cc16", // Lime
  "#f59e0b", // Amber
] as const;

// Export type definitions for TypeScript support
export type ColorScale = typeof colors.primary;
export type ThemeMode = keyof typeof themeColors;
export type SpacingKey = keyof typeof spacing;
export type BorderRadiusKey = keyof typeof borderRadius;
export type FontSizeKey = keyof typeof typography.fontSize;
export type FontWeightKey = keyof typeof typography.fontWeight;
