import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const publicRoutes = ['/login', '/forgot-password', '/reset-password'];
      const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
      
      if (!isPublicRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && nextUrl.pathname === '/login') {
        return Response.redirect(new URL('/', nextUrl));
      }
      return true;
    },
    async session({ session, token }: { session: any, token: any }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  session: { strategy: 'jwt' },
  providers: [], // Add providers with an empty array for now
  secret: process.env.AUTH_SECRET,
  trustHost: true,
} satisfies NextAuthConfig;
