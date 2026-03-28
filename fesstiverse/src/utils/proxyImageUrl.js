/**
 * Proxies an image URL through a CORS-friendly service if needed.
 * Falls back to the original URL if no proxy is required.
 *
 * @param {string} url - The original image URL
 * @returns {string|null} - The (possibly proxied) image URL, or null if no URL provided
 */
const proxyImageUrl = (url) => {
    if (!url) return null;

    // If it's already a relative URL or a data URL, return as-is
    if (url.startsWith('/') || url.startsWith('data:')) return url;

    // If it's a Google Drive link, convert it to a direct download link
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (driveMatch) {
        return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
    }

    // For all other URLs, return as-is (the browser will handle them)
    return url;
};

export default proxyImageUrl;
