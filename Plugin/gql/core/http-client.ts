export interface HttpClientOptions {
    baseURL?: string;
    headers?: Record<string, string | undefined>;
    timeout?: number;
}

export type RequestOptions = Omit<RequestInit, 'body'> & {
    params?: Record<string, any>;
    timeout?: number;
    body?: BodyInit | Record<string, any> | null;
};

function removeFalsyValues(obj: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(obj).filter(([_, value]) => typeof value !== 'undefined' && value !== null)
    );
}

export class HttpClient {
    private baseURL: string;
    private defaultHeaders: Record<string, string | undefined>;
    private timeout: number;

    constructor(options: HttpClientOptions = {}) {
        this.baseURL = options.baseURL || '';
        this.defaultHeaders = removeFalsyValues(options.headers || {});
        this.timeout = options.timeout || 30000;
    }

    private buildURL(path: string, params?: Record<string, string | number | boolean>): string {
        const url = new URL(path, this.baseURL || undefined);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (typeof value === 'undefined' || value === null) return;
                url.searchParams.append(key, String(value));
            });
        }

        return url.toString();
    }

    private async request<T>(
        method: string,
        path: string,
        options: RequestOptions = {}
    ): Promise<T> {
        const { params, timeout, headers, body, ...restOptions } = options;

        const url = this.buildURL(path, params);
        const requestTimeout = timeout || this.timeout;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), requestTimeout);

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...this.defaultHeaders,
                    ...headers,
                },
                body: body ? JSON.stringify(body) : null,
                signal: controller.signal,
                ...restOptions,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                let msg = `HTTP ${response.status}: ${response.statusText}`
                if (response.bodyUsed) {
                    msg += `\n${await response.text()}`
                }
                msg += `\nRequest URL: ${url}`;
                if (body) {
                    msg += `\nRequest Body: ${JSON.stringify(body, null, 2)}`;
                }
                throw new Error(msg);
            }

            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
                return await response.json();
            }

            return (await response.text()) as unknown as T;
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error(`Request timeout after ${requestTimeout}ms`);
            }

            throw error;
        }
    }

    async get<T = any>(path: string, options?: RequestOptions): Promise<T> {
        return this.request<T>('GET', path, options);
    }

    async post<T = any>(path: string, options?: RequestOptions): Promise<T> {
        return this.request<T>('POST', path, options);
    }

    async put<T = any>(path: string, options?: RequestOptions): Promise<T> {
        return this.request<T>('PUT', path, options);
    }

    async patch<T = any>(path: string, options?: RequestOptions): Promise<T> {
        return this.request<T>('PATCH', path, options);
    }

    async delete<T = any>(path: string, options?: RequestOptions): Promise<T> {
        return this.request<T>('DELETE', path, options);
    }

    setHeader(key: string, value: string): void {
        this.defaultHeaders[key] = value;
    }

    removeHeader(key: string): void {
        delete this.defaultHeaders[key];
    }

    setBaseURL(url: string): void {
        this.baseURL = url;
    }
}

export const createHttpClient = (options?: HttpClientOptions) => new HttpClient(options);
