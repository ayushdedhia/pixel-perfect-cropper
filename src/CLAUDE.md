# Frontend Guidelines

## Component Patterns
- Functional components with TypeScript
- Props interface: `{ComponentName}Props`
- Named exports (not default)
- Icons: lucide-react

## State Management
- Image editing state in `App.tsx` (MainApp component)
- Auth state via `AuthContext`
- No external state library (React hooks only)

## Styling
- Tailwind CSS 4 (use `bg-linear-to-*` not `bg-gradient-to-*`)
- Plus Jakarta Sans font
- Dark theme: slate-900/950 backgrounds
- Glass effects: `backdrop-blur-xl`, `bg-*/95`
