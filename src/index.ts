export class PolytoriaAPI {
    /**
     * This will handle rate limits for you.
     * In case a ratelimit is encountered, the request will be retried every 250ms + (retryCount * 250ms) until it succeeds.
     * 
     * This means that your awaits may take up to 10 seconds to resolve.
     */
    static handleRatelimits: boolean = true;

    /**
     * Required for some internal APIs.
     * 
     * Enter JUST the cookie value, not the entire cookie.
     * 
     * Note that using internal APIs is not directly allowed by Polytoria. Abuse of these APIs may result in a ban.
     * APIs that are internal are marked as such in their JSdoc with @polytoria-internal.
     */
    static ptAuthCookie: string | null = null;

    static debug = true;
}

/**
 * Internal fetch function that handles rate limits.
 * @internal
 */
export async function polyFetch(url: string, options: RequestInit = {}): Promise<unknown> {
    const headers = options?.headers ? new Headers(options.headers) : new Headers();

    if (PolytoriaAPI.ptAuthCookie) {
        headers.set("Cookie", `PT_AUTH=${PolytoriaAPI.ptAuthCookie}`);
    }

    let retryCount = 0;

    log("Fetching", url);

    while(true) {
        const response = await fetch(url, options);

        if (response.status === 429 && PolytoriaAPI.handleRatelimits) {
            log("Ratelimit encountered, retrying in", 250 + (retryCount * 250), "ms");
            await new Promise(resolve => setTimeout(resolve, 250 + (retryCount * 250)));
            retryCount++;
            continue;
        } else if (response.status !== 200) {
            throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
        }

        const body = await response.json() as { errors?: { code: string, message: string }[] };

        if (body.errors) {
            throw new Error(`Failed to fetch ${url}: ${body.errors[0].code} ${body.errors[0].message}`);
        }

        return body;
    }
}

/**
 * 
 * @param args 
 * @internal
 */
export async function log(...args: any[]) {
    if (PolytoriaAPI.debug) {
        console.log("[PolytoriaAPI]", ...args);
    }
}

export * from "./api/User.js";

