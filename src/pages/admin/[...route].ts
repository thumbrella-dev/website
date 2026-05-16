import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';

export const prerender = false;

// Methods that may carry a request body.
const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Admin proxy — `/admin/{route}` → admin worker at `/api/customer/{route}`.
 *
 * Every request must be authenticated via a live Clerk API verification
 * (`currentUser()`, not just JWT inspection). The verified user ID is the
 * only way `clerkUserId` is set on the upstream call; the client cannot
 * supply or override it.
 *
 * The admin worker receives calls under its `/api/customer/` namespace, which
 * is already marked public (service-binding path, not behind CF Access headers).
 * Ownership validation happens on the admin side for every mutating operation.
 */
export const ALL: APIRoute = async (context) => {
	// --- Authentication --------------------------------------------------
	// Call the Clerk API to confirm the session is genuinely active.
	// `currentUser()` goes to Clerk's backend, not just the local JWT cache,
	// so a revoked or expired session is caught here before any admin call.
	const currentUser =
		typeof context.locals.currentUser === 'function' ? await context.locals.currentUser() : null;

	if (!currentUser) {
		return Response.json({ ok: false, error: 'Authentication required.' }, { status: 401 });
	}

	// --- Service binding -------------------------------------------------
	const adminWorker = env.ADMIN_WORKER;
	if (!adminWorker) {
		return Response.json(
			{ ok: false, error: 'Admin service is not available.' },
			{ status: 503 },
		);
	}

	// --- Route sanitisation ----------------------------------------------
	// Reject empty routes and any path-traversal segments outright.
	// We never construct URLs with . or .. ourselves, so their presence
	// means something suspicious is happening — fail immediately.
	const route = context.params.route ?? '';
	if (!route || route.split('/').some((seg) => seg === '.' || seg === '..')) {
		return Response.json({ ok: false, error: 'Not found.' }, { status: 404 });
	}

	// --- Build upstream URL ----------------------------------------------
	const originalUrl = new URL(context.request.url);
	const upstreamUrl = new URL(`/api/customer/${route}`, 'http://admin.internal');

	// Forward query params from the client, but never let the client set
	// clerkUserId — that comes exclusively from the verified session above.
	for (const [key, value] of originalUrl.searchParams) {
		if (key !== 'clerkUserId') {
			upstreamUrl.searchParams.set(key, value);
		}
	}
	upstreamUrl.searchParams.set('clerkUserId', currentUser.id);

	// --- Forward request -------------------------------------------------
	const method = context.request.method.toUpperCase();
	const hasBody = BODY_METHODS.has(method);

	const upstream = new Request(upstreamUrl.toString(), {
		method,
		headers: hasBody
			? { 'content-type': context.request.headers.get('content-type') ?? 'application/json' }
			: {},
		body: hasBody ? context.request.body : null,
	});

	const resp = await adminWorker.fetch(upstream);

	// Only propagate content-describing response headers; drop any internal
	// or auth-related headers the admin worker may have set.
	const responseHeaders = new Headers();
	const ct = resp.headers.get('content-type');
	if (ct) responseHeaders.set('content-type', ct);

	return new Response(resp.body, {
		status: resp.status,
		headers: responseHeaders,
	});
};
