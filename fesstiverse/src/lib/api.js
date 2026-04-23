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

export default API_BASE_URL;
