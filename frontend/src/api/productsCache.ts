
export function clearProductsCache() {
    try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const k = sessionStorage.key(i);
            if (k && (k.startsWith("products_cache_") || k.startsWith("products_scroll_"))) {
                keysToRemove.push(k);
            }
        }
        keysToRemove.forEach((k) => sessionStorage.removeItem(k));
    } catch {
        // ignore
    }
}
