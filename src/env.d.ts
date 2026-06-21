/// <reference types="astro/client" />
/// <reference types="@clerk/astro/env" />

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
	interface Locals extends Runtime {}
}

interface Env {
	/** Service binding — calls thumbrella-admin worker directly (no external HTTP). */
	ADMIN_WORKER: Fetcher;
	/** GitHub fine-grained PAT with read-only Discussions access (thumbrella-dev org). */
	GITHUB_TOKEN: string;
}
