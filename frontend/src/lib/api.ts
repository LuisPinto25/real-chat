const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}/api${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let message = 'Ocurrió un error inesperado';
    if (data && typeof data === 'object' && 'message' in data) {
      const msg = (data as { message: unknown }).message;
      if (Array.isArray(msg)) {
        message = msg.join(', ');
      } else if (typeof msg === 'string') {
        message = msg;
      }
    }
    throw new ApiError(response.status, message, data);
  }

  return data as T;
}
