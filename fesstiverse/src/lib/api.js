// Central API configuration for the Festiverse frontend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Helper function to make API calls.
 * Automatically includes httpOnly cookies and supports Authorization header fallback.
 */
export async function apiFetch(endpoint, options = {}) {
    const headers = {
        'X-Requested-With': 'XMLHttpRequest', // CSRF protection hint
        ...(options.headers || {}),
    };

    // Only set Content-Type to JSON if body is not FormData
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include', // Include httpOnly cookies automatically
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
}

/**
 * Module-level cache for GET requests.
 * Stores { promise, timestamp } entries keyed by endpoint.
 */
const cache = new Map();

/**
 * Cached version of apiFetch for GET-only endpoints.
 * Returns the same promise for duplicate calls within the TTL window.
 * @param {string} endpoint - API endpoint to fetch
 * @param {number} ttlMs - Cache time-to-live in milliseconds (default: 60000)
 */
export async function apiFetchCached(endpoint, ttlMs = 60000) {
    const now = Date.now();
    const cached = cache.get(endpoint);

    if (cached && (now - cached.timestamp) < ttlMs) {
        return cached.promise;
    }

    const promise = apiFetch(endpoint);
    cache.set(endpoint, { promise, timestamp: now });

    // Clean up on rejection so retries work
    promise.catch(() => cache.delete(endpoint));

    return promise;
}

export default API_BASE_URL;
