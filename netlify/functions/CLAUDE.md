# API Guidelines

## Response Format
All endpoints return:
```typescript
{ success: boolean, data?: T, error?: string }
```

## Authentication
- Use `verifyToken()` from `_lib/auth.ts` for protected routes
- Access token: 15 min expiry
- Refresh token: 7 days, httpOnly cookie

## Database
- Neon serverless Postgres
- Drizzle ORM for queries
- Schema in `src/db/schema.ts`

## Error Handling
- Log errors server-side
- Return generic messages to client (don't expose internals)
- Use appropriate HTTP status codes
