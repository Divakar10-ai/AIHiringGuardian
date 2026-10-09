const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('access_token');
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Default to application/json if body is string and no content-type is set
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // Clear token on unauthorized/forbidden
      localStorage.removeItem('access_token');
      // A full page reload might be harsh, but for now we'll let the AuthContext handle 401 via catching errors.
    }
    
    throw new ApiError(
      response.status,
      data?.detail || response.statusText || 'API Request Failed',
      data
    );
  }

  return data as T;
}
