# PixelCropper

A modern, browser-based image cropping and editing application built with React, TypeScript, and Vite.

## Features

- Interactive crop selection with aspect ratio presets (Free, 1:1, 4:3, 16:9, 2:3, 9:16)
- Real-time image filters (brightness, contrast, saturation, blur, grayscale, sepia)
- Rotation and flip transformations
- Circular crop option
- Export to PNG, JPEG, or WebP formats
- Copy directly to clipboard
- Undo history (up to 15 states)
- Drag-and-drop image upload

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- react-image-crop
- Lucide React (icons)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── AdminModal.tsx      # Admin access panel
│   ├── CropCanvas.tsx      # Main crop interface
│   ├── Header.tsx          # App header
│   ├── PremiumModal.tsx    # Premium features modal
│   ├── StatusBar.tsx       # Status information
│   ├── UploadArea.tsx      # Image upload component
│   └── sidebar/            # Sidebar components
├── utils/
│   └── image-utils.ts      # Image processing utilities
├── constants.ts            # App constants
├── types.ts                # TypeScript definitions
└── App.tsx                 # Main application
```

## Watermark System

Exported images include a watermark by default. The watermark features:

- Large centered text with diagonal rotation (-30 degrees)
- Six smaller watermarks distributed across the image
- Semi-transparent styling (20% opacity main, 12% opacity secondary)
- Elegant serif italic font (Georgia)

---

## Admin Documentation

### Accessing Admin Mode

Admin mode allows bypassing the watermark for owner/administrator use.

#### Secret Shortcut (Desktop)

Press **`Ctrl + Alt + Shift + U`** to open the Admin Access panel.

#### Long Press (Mobile)

**Press and hold the logo** (PixelPerfect Cropper text/icon) for **2 seconds** to open the Admin Access panel.

#### Default Passcode

```
pixel2024
```

#### Changing the Passcode

Edit `src/components/AdminModal.tsx` line 11:

```typescript
const ADMIN_PASSCODE = "your-new-passcode";
```

### What Admin Mode Does

When unlocked:
- All exported images will have **no watermark**
- The setting persists in browser IndexedDB (more obscure than localStorage)
- Remains active until IndexedDB is cleared

### Security Notes

- The admin shortcut is intentionally obscure (triple modifier + U)
- Admin status stored in IndexedDB (harder to find than localStorage)
- Passcode is stored in source code (suitable for personal/internal use)
- For production with multiple admins, consider implementing server-side authentication

### Resetting Admin Mode

To revoke admin access, clear IndexedDB via browser DevTools:

1. Open DevTools (F12)
2. Go to **Application** tab
3. Expand **IndexedDB** in the sidebar
4. Find and delete **pxc_store** database

Or programmatically:

```javascript
indexedDB.deleteDatabase("pxc_store");
```

---

## License

Private - All rights reserved
