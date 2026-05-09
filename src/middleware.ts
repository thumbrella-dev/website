import { clerkMiddleware } from '@clerk/astro/server';

const clerk = clerkMiddleware();

export const onRequest: import('astro').MiddlewareHandler = async (context, next) => {
  if (import.meta.env.CLERK_SECRET_KEY) {
    return clerk(context, next);
  }

  return next();
};