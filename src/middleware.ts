import { clerkMiddleware } from '@clerk/astro/server';

const clerk = clerkMiddleware();

const AUTH_PATHS = ['/account', '/user/', '/admin/'];

export const onRequest: import('astro').MiddlewareHandler = async (context, next) => {
  if (!AUTH_PATHS.some((p) => context.url.pathname.startsWith(p))) {
    return next();
  }

  // /account — redirect based on auth state
  if (context.url.pathname === '/account') {
    return clerk(context, async () => {
      const { userId } = context.locals.auth();
      if (!userId) {
        return context.redirect('/?signin=account');
      }
      return context.redirect('/?open=account');
    });
  }

  // /account/:tab — deep-link to a specific Clerk profile tab
  // e.g. /account/manage-usage  ->  /?open=account&tab=manage-usage
  const accountTabMatch = context.url.pathname.match(/^\/account\/([^/]+)$/);
  if (accountTabMatch) {
    const tab = accountTabMatch[1];
    return clerk(context, async () => {
      const { userId } = context.locals.auth();
      if (!userId) {
        return context.redirect('/?signin=account');
      }
      return context.redirect(`/?open=account&tab=${encodeURIComponent(tab)}`);
    });
  }

  // --- /admin/* proxy to admin worker via service binding ---
  if (context.url.pathname.startsWith('/admin/')) {
    return clerk(context, async () => {
      const { userId } = context.locals.auth();
      if (!userId) {
        return Response.json({ ok: false, error: 'Authentication required.' }, { status: 401 });
      }

      const { env } = await import('cloudflare:workers');
      const adminWorker = env.ADMIN_WORKER;
      if (!adminWorker) {
        return Response.json({ ok: false, error: 'Admin service not available.' }, { status: 503 });
      }

      const route = context.url.pathname.replace('/admin/', '');
      if (!route || route.split('/').some((s: string) => s === '.' || s === '..')) {
        return Response.json({ ok: false, error: 'Not found.' }, { status: 404 });
      }

      const upstreamUrl = new URL(`/api/user/${route}`, 'http://admin.internal');
      for (const [key, value] of new URL(context.request.url).searchParams) {
        if (key !== 'clerkUserId') upstreamUrl.searchParams.set(key, value);
      }
      upstreamUrl.searchParams.set('clerkUserId', userId);

      const method = context.request.method.toUpperCase();
      const hasBody = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

      const upstream = new Request(upstreamUrl.toString(), {
        method,
        headers: hasBody ? { 'content-type': context.request.headers.get('content-type') ?? 'application/json' } : {},
        body: hasBody ? context.request.body : null,
      });

      const resp = await adminWorker.fetch(upstream);

      const safeHeaders = new Headers();
      for (const [key, value] of resp.headers) {
        const lower = key.toLowerCase();
        if (lower === 'content-type' || lower.startsWith('x-')) {
          safeHeaders.set(key, value);
        }
      }
      return new Response(resp.body, { status: resp.status, headers: safeHeaders });
    });
  }

  // --- /user/* and any other auth paths ---
  return clerk(context, next);
};