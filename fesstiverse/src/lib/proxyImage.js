/**
 * Rewrites Supabase Storage URLs to route through the backend proxy,
 * bypassing ISP DNS hijacking that causes ERR_CONNECTION_TIMED_OUT.
 */
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function proxyImageUrl(url) {
    if (!url) return url;
    if (url.includes('supabase.co/storage/')) {
        return `${API}/api/proxy/image?url=${encodeURIComponent(url)}`;
    }
    return url;
}
