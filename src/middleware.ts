/**
 * Extract the Clerk user id (`sub`) and session id (`sid`) from the __session
 * cookie JWT. The signature is not verified here; the admin worker re-verifies
 * both values with the Clerk Backend API on every dashboard request.
 */
function getSessionFromCookie(cookieHeader: string | null): { userId: string; sessionId: string } | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(';').map((c) => c.trim());
  const sessionCookie = cookies.find((c) => c.startsWith('__session='));
  if (!sessionCookie) return null;
  const token = sessionCookie.slice('__session='.length);
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    // JWTs use base64url; atob only accepts standard base64.
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const decoded = JSON.parse(atob(padded)) as { sub?: string; sid?: string };
    if (!decoded.sub || !decoded.sid) return null;
    return { userId: decoded.sub, sessionId: decoded.sid };
  } catch {
    return null;
  }
}

export const onRequest: import('astro').MiddlewareHandler = async (context, next) => {
  // --- /api/clerk-config: public, no auth — proxies to admin worker ---
  if (context.url.pathname === '/api/clerk-config') {
    try {
      const { env } = await import('cloudflare:workers');
      const adminWorker = env.ADMIN_WORKER;
      if (!adminWorker) {
        return Response.json({ ok: false, error: 'Admin service not connected.' }, { status: 503 });
      }
      const upstream = new Request('http://admin.internal/api/clerk-config', {
        method: 'GET',
      });
      return adminWorker.fetch(upstream);
    } catch {
      // Running outside the Workers runtime (e.g. astro dev).
      // The Account button will show “not available” quietly.
      return Response.json({ ok: false, error: 'Not available in this environment.' }, { status: 503 });
    }
  }

  // --- /admin/* proxy to admin worker via service binding ---
  if (context.url.pathname.startsWith('/admin/')) {
    const cookieHeader = context.request.headers.get('cookie');
    const session = getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ ok: false, error: 'Authentication required.' }, { status: 401 });
    }

    const { env } = await import('cloudflare:workers');
    const adminWorker = env.ADMIN_WORKER;
    if (!adminWorker) {
      return Response.json({ ok: false, error: 'Admin service not connected.' }, { status: 503 });
    }

    const route = context.url.pathname.replace('/admin/', '');
    if (!route || route.split('/').some((s: string) => s === '.' || s === '..')) {
      return Response.json({ ok: false, error: 'Not found.' }, { status: 404 });
    }

    const upstreamUrl = new URL(`/api/user/${route}`, 'http://admin.internal');
    for (const [key, value] of new URL(context.request.url).searchParams) {
      if (key !== 'clerkUserId' && key !== 'clerkSessionId') upstreamUrl.searchParams.set(key, value);
    }
    upstreamUrl.searchParams.set('clerkUserId', session.userId);
    upstreamUrl.searchParams.set('clerkSessionId', session.sessionId);

    const method = context.request.method.toUpperCase();
    const hasBody = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

    const upstreamHeaders = new Headers();
    if (hasBody) {
      upstreamHeaders.set('content-type', context.request.headers.get('content-type') ?? 'application/json');
    }
    // Signed dashboard capability: minted by the admin worker when the panel
    // was rendered, echoed back on every panel operation.
    const dashboardToken = context.request.headers.get('x-tbr-dashboard-token');
    if (dashboardToken) upstreamHeaders.set('x-tbr-dashboard-token', dashboardToken);

    const upstream = new Request(upstreamUrl.toString(), {
      method,
      headers: upstreamHeaders,
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