export async function apiRequest<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const response = await fetch(`/api${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
        ...options,
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json();
}