export function formatFavorites(count: number): string {
    if (count >= 1000) {
        return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return count.toString();
}

export const BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const USERS_URL = import.meta.env.VITE_API_USERS_URL;
export const SUBS_URL = import.meta.env.VITE_API_SUBS_URL;
export const MISC_URL = import.meta.env.VITE_API_MISC_URL;
export const NEWS_URL = import.meta.env.VITE_API_NEWS_URL;
export const ADMIN_URL = import.meta.env.API_ADMIN_URL;