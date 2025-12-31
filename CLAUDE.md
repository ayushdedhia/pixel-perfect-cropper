# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev        # Start Netlify dev server (frontend + API functions)
npm run dev:vite   # Start Vite dev server only (no API)
npm run build      # TypeScript compile + Vite production build
npm run lint       # Run ESLint
npm run preview    # Preview production build locally
npm run db:push    # Push schema changes to Neon DB
npm run db:generate # Generate Drizzle migrations
npm run db:studio  # Open Drizzle Studio for DB management
```

## Architecture Overview

PixelCropper is a React application for cropping and editing images. Built with React 19, TypeScript, Vite, Tailwind CSS 4, with Neon (serverless Postgres) for authentication and Netlify Functions for the API.

### Project Structure

```
src/
├── components/
│   ├── CropCanvas.tsx           # Main crop interface with zoom
│   ├── CropPreview.tsx          # Desktop preview panel
│   ├── Header.tsx               # Top nav with logo and user menu
│   ├── PremiumModal.tsx         # Premium upgrade modal
│   ├── StatusBar.tsx            # Bottom metadata bar
│   ├── UploadArea.tsx           # Drag-drop image upload
│   ├── UserMenu.tsx             # User dropdown (profile, settings, logout)
│   └── sidebar/
│       ├── AdjustmentControls.tsx   # Filter sliders
│       ├── CropSettings.tsx         # Aspect ratio/shape
│       ├── ExportSettings.tsx       # Format/quality/export
│       ├── Sidebar.tsx              # Container
│       └── TransformControls.tsx    # Rotation/flip
├── contexts/
│   └── AuthContext.tsx          # Authentication state provider
├── pages/
│   ├── LoginPage.tsx            # Login page with modern UI
│   ├── RegisterPage.tsx         # Registration page
│   ├── ForgotPasswordPage.tsx   # Password reset request
│   └── ResetPasswordPage.tsx    # Password reset form
├── db/
│   └── schema.ts                # Drizzle ORM schema (users, sessions, etc.)
├── utils/
│   ├── api.ts                   # API client with auth headers
│   ├── image-utils.ts           # Canvas-based image processing
│   └── storage.ts               # IndexedDB persistence
├── assets/brand/                # Logo assets (logo.svg, logo-monochrome.svg)
├── App.tsx                      # Main component with routing
├── constants.ts                 # Aspect ratios, initial states
├── types.ts                     # TypeScript definitions
├── index.css                    # Tailwind + global styles (Plus Jakarta Sans font)
└── main.tsx                     # Entry point

netlify/functions/               # Serverless API endpoints
├── _lib/
│   ├── auth.ts                  # JWT utilities, password hashing
│   └── db.ts                    # Neon DB connection
├── auth-register.ts             # POST /auth-register
├── auth-login.ts                # POST /auth-login
├── auth-logout.ts               # POST /auth-logout
├── auth-refresh.ts              # POST /auth-refresh
├── auth-me.ts                   # GET /auth-me
├── auth-forgot-password.ts      # POST /auth-forgot-password
├── auth-reset-password.ts       # POST /auth-reset-password
├── user-profile.ts              # GET/PUT /user-profile
└── user-premium.ts              # POST /user-premium
```

## Authentication System

### Database (Neon + Drizzle ORM)

Schema in `src/db/schema.ts`:
- **users**: id, email, passwordHash, name, isPremium, createdAt, updatedAt
- **sessions**: id, userId, refreshToken, expiresAt, createdAt
- **preferences**: id, userId, defaultExportFormat, defaultQuality, theme
- **passwordResetTokens**: id, userId, token, expiresAt, usedAt, createdAt

### JWT Strategy
- **Access Token**: Short-lived (15 min), stored in memory
- **Refresh Token**: Long-lived (7 days), stored in httpOnly cookie
- Auto-refresh on 401 responses via `api.ts`

### Auth Flow
1. Login/Register → Receive access + refresh tokens
2. API calls → Include access token in Authorization header
3. Token expires → Auto-refresh using refresh token
4. Logout → Clear tokens, invalidate session in DB

### Password Reset Flow
1. User requests reset → Token generated (1 hour expiry)
2. Demo mode shows reset URL directly (production would email)
3. User sets new password → All sessions invalidated

### Protected Routes
- `ProtectedRoute` - Redirects to `/login` if not authenticated
- `PublicRoute` - Redirects to `/` if already authenticated

## Core Data Flow

1. **Image Upload** - User drops/selects image → `fileToDataUrl()` converts to data URL
2. **Live Editing** - Crop selection and filters applied via CSS transforms for real-time preview
3. **Export** - `getCroppedImg()` uses HTML5 Canvas to apply all transformations at native resolution

### State Management (App.tsx)

All image editing state lives in MainApp component:

| State | Purpose |
|-------|---------|
| `image` | Current image as data URL |
| `crop` / `completedCrop` | Crop area (react-image-crop format) |
| `aspect` | Selected aspect ratio |
| `filters` | All adjustment values (brightness, contrast, etc.) |
| `exportConfig` | Format, quality, circular flag |
| `history` | Undo stack (max 15 states) |

User state managed via `AuthContext`:
| State | Purpose |
|-------|---------|
| `user` | Current user object (includes isPremium) |
| `isAuthenticated` | Whether user is logged in |
| `isLoading` | Auth state loading |

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

Premium (`user.isPremium=true`) skips watermarks entirely.

## Key Components

### CropCanvas.tsx
- Uses `react-image-crop` for interactive cropping
- Real-time CSS filter/transform preview
- Rule-of-thirds grid overlay
- Zoom to selection feature (2x zoom, desktop only)
- Grid background pattern

### UserMenu.tsx
- Avatar button with user initials
- Dropdown with profile info, settings, logout
- Premium badge display
- Upgrade to Premium option for free users

### Auth Pages (LoginPage, RegisterPage, etc.)
- Modern split-screen layouts
- Gradient backgrounds with animated blur shapes
- Crop-related decorative patterns
- Mobile responsive

### Sidebar Components
- **CropSettings**: Aspect ratio buttons + circular/square toggle
- **TransformControls**: 90° rotation CW/CCW, horizontal/vertical flip
- **AdjustmentControls**: Sliders for brightness, contrast, saturation, blur + grayscale/sepia toggles + undo/reset
- **ExportSettings**: Format dropdown, quality slider (disabled for PNG), export/copy buttons

## API Client (src/utils/api.ts)

Centralized API client with:
- Base URL: `/.netlify/functions`
- Auto-attach Authorization header
- Token refresh on 401
- Type-safe response handling

```typescript
authApi.login(email, password)
authApi.register(email, password, name?)
authApi.logout()
authApi.refresh()
authApi.me()
authApi.forgotPassword(email)
authApi.resetPassword(token, password)

userApi.getProfile()
userApi.updateProfile({ name?, preferences? })
userApi.upgradeToPremium(paymentId)
```

## Environment Variables

Required in `.env`:
```
DATABASE_URL=postgresql://...     # Neon connection string
JWT_SECRET=...                    # Secret for access tokens
JWT_REFRESH_SECRET=...            # Secret for refresh tokens
```

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
| lucide-react | Icon library |
| sonner | Toast notifications |
| tailwindcss | Utility-first CSS |
| react-router-dom | Client-side routing |
| @neondatabase/serverless | Neon DB driver |
| drizzle-orm | Type-safe ORM |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT generation/verification |

## Responsive Design

- **Mobile**: Single column, sidebar at bottom (max 50vh), larger touch targets
- **Desktop**: Split layout, sidebar fixed right
- Breakpoints via Tailwind (sm:, md:, lg:)

## UI Features

- Plus Jakarta Sans font
- Toast notifications for actions
- Loading states on buttons
- Custom webkit scrollbar styling
- Grid background pattern in crop canvas
- Undo history (max 15 states) for filter changes
- Glass effect dropdowns with backdrop blur
- Gradient avatars with glow effects
