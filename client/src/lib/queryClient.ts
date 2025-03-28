import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Token key for local storage
const TOKEN_KEY = "karigar_auth_token";

// Get token from local storage
const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage: string;
    try {
      // Try to parse as JSON first
      const errorData = await res.json();
      errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
    } catch (e) {
      // If not JSON, use text
      errorMessage = await res.text() || res.statusText;
    }
    throw new Error(errorMessage);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.log(`Making ${method} request to ${url}`, { data });
  
  // Get the auth token
  const token = getToken();
  
  // Prepare headers with content type and authorization if token exists
  const headers: HeadersInit = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  
  try {
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      // No need for credentials with JWT, but keeping this for backward compatibility
      credentials: "include",
    });
    
    console.log(`Response from ${url}:`, { status: res.status, statusText: res.statusText });
    
    // Clone the response to be able to log it AND return it
    const resClone = res.clone();
    try {
      const responseData = await resClone.json();
      console.log(`Response data from ${url}:`, responseData);
    } catch (e) {
      console.log(`Could not parse response from ${url} as JSON`);
    }
    
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`Error in apiRequest to ${url}:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get the auth token
    const token = getToken();
    
    // Prepare headers with authorization if token exists
    const headers: HeadersInit = token 
      ? { Authorization: `Bearer ${token}` } 
      : {};
    
    const res = await fetch(queryKey[0] as string, {
      headers,
      credentials: "include", // Keeping for backward compatibility
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
