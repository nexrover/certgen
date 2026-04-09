export const ICONS = {
  star: {
    label: "Star",
    path: "M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z",
    fill: "#d97706",
  },
  medal: {
    label: "Medal",
    path: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z",
    fill: "#b45309",
  },
  checkmark: {
    label: "Checkmark",
    path: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z",
    fill: "#059669",
  },
  seal: {
    label: "Seal",
    path: "M12 1l2.93 5.94L21 8.24l-4.35 4.24 1.03 5.99L12 15.4l-5.68 2.99 1.03-5.99L3 8.16l6.07-.22L12 1z",
    fill: "#7c3aed",
  },
} as const;

export const RIBBONS = {
  ribbon1: {
    label: "Ribbon",
    path: "M2 20h20l-4-8 4-8H2l4 8-4 8z",
    fill: "#1e3a5f",
  },
  ribbon2: {
    label: "Banner",
    path: "M1 5h22v14H1V5zm2 2v10h18V7H3z M0 8l3-3v6L0 8z M24 8l-3-3v6l3-3z",
    fill: "#0d4a6b",
  },
} as const;

export type IconKey = keyof typeof ICONS;
export type RibbonKey = keyof typeof RIBBONS;
