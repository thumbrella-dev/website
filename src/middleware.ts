/**
 * Extract the Clerk user ID from the __session cookie JWT.
 * Does NOT verify the signature - the admin worker re-verifies on its end.
 */
function getUserIdFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map((c) => c.trim());
  const sessionCookie = cookies.find((c) => c.startsWith('__session='));
  if (!sessionCookie) return null;
  const token = sessionCookie.slice('__session='.length);
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload));
    return decoded.sub || null;
  } catch {
    return null;
  }
}

export const onRequest: import('astro').MiddlewareHandler = async (context, next) => {
  // --- /admin/* proxy to admin worker via service binding ---
  if (context.url.pathname.startsWith('/admin/')) {
    const cookieHeader = context.request.headers.get('cookie');
    const userId = getUserIdFromCookie(cookieHeader);

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
  }

  // /account[/] - rewrite to home page. Navbar JS detects /account URL and
  // auto-opens Clerk profile. When the modal closes, JS restores URL to /.
  if (context.url.pathname === '/account' || context.url.pathname === '/account/') {
    return context.rewrite('/');
  }

  // /user/* - pass through.
  return next();
};