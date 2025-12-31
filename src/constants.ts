export const ASPECT_RATIOS = [
  { label: "Free", value: undefined },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
  { label: "2:3", value: 2 / 3 },
  { label: "9:16", value: 9 / 16 },
];

export const FILTERS_INITIAL_STATE = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  grayscale: false,
  sepia: false,
  rotation: 0,
  flipH: false,
  flipV: false,
};

export const EXPORT_INITIAL_STATE = {
  format: "image/png" as const,
  quality: 90,
  circular: false,
};
