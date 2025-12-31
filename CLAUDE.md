# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev      # Start Vite dev server with HMR
npm run build    # TypeScript compile + Vite production build
npm run lint     # Run ESLint
npm run preview  # Preview production build locally
```

## Architecture Overview

PixelCropper is a single-page React application for cropping and editing images. Built with React 19, TypeScript, Vite, and Tailwind CSS 4.

### Project Structure

```
src/
├── components/
│   ├── AdminModal.tsx           # Password-protected admin access
│   ├── CropCanvas.tsx           # Main crop interface with zoom
│   ├── CropPreview.tsx          # Desktop preview panel
│   ├── Header.tsx               # Top nav with logo and controls
│   ├── PremiumModal.tsx         # Premium upgrade modal
│   ├── StatusBar.tsx            # Bottom metadata bar
│   ├── UploadArea.tsx           # Drag-drop image upload
│   └── sidebar/
│       ├── AdjustmentControls.tsx   # Filter sliders
│       ├── CropSettings.tsx         # Aspect ratio/shape
│       ├── ExportSettings.tsx       # Format/quality/export
│       ├── Sidebar.tsx              # Container
│       └── TransformControls.tsx    # Rotation/flip
├── utils/
│   ├── image-utils.ts           # Canvas-based image processing
│   └── storage.ts               # IndexedDB persistence
├── assets/brand/                # Logo assets
├── App.tsx                      # Main component with all state
├── constants.ts                 # Aspect ratios, initial states
├── types.ts                     # TypeScript definitions
├── index.css                    # Tailwind + global styles
└── main.tsx                     # Entry point
```

### Core Data Flow

1. **Image Upload** - User drops/selects image → `fileToDataUrl()` converts to data URL
2. **Live Editing** - Crop selection and filters applied via CSS transforms for real-time preview
3. **Export** - `getCroppedImg()` uses HTML5 Canvas to apply all transformations at native resolution

### State Management (App.tsx)

All state lives in App.tsx using React hooks:

| State | Purpose |
|-------|---------|
| `image` | Current image as data URL |
| `crop` / `completedCrop` | Crop area (react-image-crop format) |
| `aspect` | Selected aspect ratio |
| `filters` | All adjustment values (brightness, contrast, etc.) |
| `exportConfig` | Format, quality, circular flag |
| `history` | Undo stack (max 15 states) |
| `isPremium` | Watermark skip flag |

## Image Processing Pipeline

The export function in `src/utils/image-utils.ts` (`getCroppedImg`) performs:

1. Create canvas sized to crop dimensions
2. Calculate scale factor (natural size / display size)
3. Apply CSS filter string (brightness, contrast, saturation, blur, grayscale, sepia)
4. Handle circular clipping via `arc()` + `clip()`
5. Apply transformation matrix:
   - Translate to center
   - Rotate (degrees → radians)
   - Scale for flip transforms
6. Draw watermark (if not premium)
7. Export to Blob (PNG/JPEG/WebP with quality)

### Watermark System

Free users get watermarks on exports:
- Large centered text "Made with PixelCropper" at -30° angle
- 6 smaller watermarks in corners/sides
- 20% opacity main, 12% secondary
- Font: italic Georgia, size 12% of image height

Premium (`isPremium=true`) skips watermarks entirely.

## Key Components

### CropCanvas.tsx
- Uses `react-image-crop` for interactive cropping
- Real-time CSS filter/transform preview
- Rule-of-thirds grid overlay
- Zoom to selection feature (2x zoom, desktop only)
- Grid background pattern

### CropPreview.tsx
- Desktop-only floating preview panel
- Shows final cropped result with filters
- Displays selection dimensions
- Closable panel

### Sidebar Components
- **CropSettings**: Aspect ratio buttons + circular/square toggle
- **TransformControls**: 90° rotation CW/CCW, horizontal/vertical flip
- **AdjustmentControls**: Sliders for brightness, contrast, saturation, blur + grayscale/sepia toggles + undo/reset
- **ExportSettings**: Format dropdown, quality slider (disabled for PNG), export/copy buttons

## Export Functionality

Two export methods:
- **Download**: Exports in selected format (PNG/JPEG/WebP) with quality setting
- **Copy to Clipboard**: Always exports as PNG regardless of format setting

Quality slider disabled for PNG (lossless format).

## Admin System

Secret admin access bypasses premium/watermark restrictions:

**Access Methods:**
- Keyboard: `Ctrl+Alt+Shift+U`
- Mobile: Long-press logo for 2 seconds

**Passcode:** `pixel2024` (hardcoded in AdminModal.tsx)

**Persistence:** Uses IndexedDB (database: `pxc_store`, key: `pxc_admin`)

## Storage (storage.ts)

IndexedDB wrapper functions:
- `getValue<T>(key)` - Retrieve value
- `setValue<T>(key, value)` - Store value
- `removeValue(key)` - Delete value

Used for persisting admin status across sessions.

## Type Definitions (types.ts)

```typescript
interface Area { x, y, width, height: number }
interface Point { x, y: number }
interface ImageFilters {
  brightness: number      // 0-200%
  contrast: number        // 0-200%
  saturation: number      // 0-200%
  blur: number            // 0-20px
  grayscale: boolean
  sepia: boolean
  rotation: number        // 0-360°
  flipH: boolean
  flipV: boolean
}
type ExportFormat = "image/png" | "image/jpeg" | "image/webp"
interface ExportConfig { format, quality, circular }
```

## Constants (constants.ts)

- `ASPECT_RATIOS` - Presets: Free, 1:1, 4:3, 16:9, 2:3, 9:16
- `FILTERS_INITIAL_STATE` - Default filter values (100% brightness/contrast/saturation, 0 blur, no effects)
- `EXPORT_INITIAL_STATE` - Default: PNG, 90% quality, rectangular

## External Dependencies

| Package | Purpose |
|---------|---------|
| react-image-crop | Interactive crop UI with aspect ratio constraints |
| lucide-react | Icon library (30+ icons) |
| sonner | Toast notifications |
| tailwindcss | Utility-first CSS |

## Responsive Design

- **Mobile**: Single column, sidebar at bottom (max 50vh), larger touch targets
- **Desktop**: Split layout, sidebar fixed right, preview panel visible
- Breakpoints via Tailwind (sm:, md:, lg:)

## UI Features

- Toast notifications for clipboard success/failure
- Loading states on export buttons
- Custom webkit scrollbar styling
- Grid background pattern in crop canvas
- Undo history (max 15 states) for filter changes
