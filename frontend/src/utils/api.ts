const API_BASE_URL = "http://localhost:3000/api";

// Custom error class for API errors
export class ApiError extends Error {
    status: number;
    body: any;

    constructor(message: string, status: number, body: any) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.body = body;
    }
}

// wrapper for fetch
async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions: RequestInit = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    const config: RequestInit = {
        ...defaultOptions,
        ...options,
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json().catch(() => ({})); // Gracefully handle non-JSON responses

        if (!response.ok) {
            // Throw a structured error with status and body
            throw new ApiError(data.error || 'Request failed', response.status, data);
        }
        return data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error; // Re-throw API errors to be caught by the caller
        }
        // Handle network errors or other unexpected issues
        throw new Error('Network error or invalid response');
    }
}

// API object with methods for different HTTP verbs
export const api = {
    get: (endpoint: string, options?: RequestInit) =>
        request(endpoint, { ...options, method: 'GET' }),
    post: (endpoint: string, body: any, options?: RequestInit) =>
        request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint: string, body: any, options?: RequestInit) =>
        request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint: string, options?: RequestInit) =>
        request(endpoint, { ...options, method: 'DELETE' }),
};
