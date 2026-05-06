import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// In Next.js 16, Middleware is renamed to Proxy.
// IMPORTANT: We use authConfig (not auth from ./auth) here to avoid
// importing Prisma/database code into the Edge runtime.
// The full auth (with DB providers) is only used in server components/actions.
const { auth } = NextAuth(authConfig);

export const proxy = auth;

export default auth;

export const config = {
  // Protect all routes except for specific internal paths and assets
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
