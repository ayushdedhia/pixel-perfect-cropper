export interface Area {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface ImageFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: boolean;
  sepia: boolean;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
}

export type ExportFormat = "image/png" | "image/jpeg" | "image/webp";

export interface ExportConfig {
  format: ExportFormat;
  quality: number;
  circular: boolean;
}
