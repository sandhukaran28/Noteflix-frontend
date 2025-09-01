export const API_URL = process.env.NEXT_PUBLIC_API_URL || '';


export async function api<T = any>(
path: string,
opts: { method?: string; token?: string; body?: any; form?: boolean } = {}
): Promise<T | string> {
const { method = 'GET', token, body, form } = opts;
const headers: Record<string, string> = {};
if (!form) headers['Content-Type'] = 'application/json';
if (token) headers['Authorization'] = `Bearer ${token}`;


const res = await fetch(`${API_URL}${path}`, {
method,
headers,
body: form ? body : body ? JSON.stringify(body) : undefined,
// Important for Next.js client fetches
cache: 'no-store',
});
if (!res.ok) {
const text = await res.text();
throw new Error(`${res.status} ${res.statusText} — ${text}`);
}
const ctype = res.headers.get('content-type') || '';
return ctype.includes('application/json') ? res.json() : res.text();
}