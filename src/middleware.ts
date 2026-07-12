import { clerkMiddleware } from '@clerk/astro/server';

const clerk = clerkMiddleware();

// Paths that need server-side Clerk auth.
// All other pages are static and don't run middleware.
const AUTH_PATHS = ['/account', '/user/', '/admin/'];

export const onRequest: import('astro').MiddlewareHandler = async (context, next) => {
  const needsAuth = AUTH_PATHS.some((p) => context.url.pathname.startsWith(p));

  if (!needsAuth) {
    return next();
  }

  if (context.url.pathname !== '/account') {
    if (import.meta.env.CLERK_SECRET_KEY) {
      return clerk(context, next);
    }
    return next();
  }

  // /account: run Clerk auth first, then decide
  const handleAccount = async () => {
    const { userId } = context.locals.auth();
    if (!userId) {
      // Not signed in — redirect to homepage
      return context.redirect('/');
    }
    // Signed in — render homepage content with URL staying at /account
    return context.rewrite('/');
  };

  if (import.meta.env.CLERK_SECRET_KEY) {
    return clerk(context, handleAccount);
  }

  return context.rewrite('/');
};