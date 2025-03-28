import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// JWT token management
const TOKEN_KEY = "karigar_auth_token";

// Save token to local storage
const saveToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Get token from local storage
const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Remove token from local storage
const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// Response types for JWT authentication
interface AuthResponse {
  user: SelectUser;
  token: string;
}

// Simplified object for when context is not available
const createEmptyAuth = () => ({
  user: null,
  isLoading: false,
  error: null,
  loginMutation: {
    mutate: (credentials: any) => {
      console.log("Login mutation called without context");
    },
    isPending: false,
    isError: false,
    isSuccess: false,
    status: "idle",
    reset: () => {},
    data: undefined,
  } as any,
  registerMutation: {
    mutate: (credentials: any) => {
      console.log("Register mutation called without context");
    },
    isPending: false,
    isError: false,
    isSuccess: false,
    status: "idle",
    reset: () => {},
    data: undefined,
  } as any,
  logoutMutation: {
    mutate: () => {
      console.log("Logout mutation called without context");
    },
    isPending: false,
    isError: false,
    isSuccess: false,
    status: "idle",
    reset: () => {},
    data: undefined,
  } as any,
});

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<AuthResponse, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<AuthResponse, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

// Create context with a default value to avoid null checks
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  error: null,
  loginMutation: {} as any,
  logoutMutation: {} as any,
  registerMutation: {} as any,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(getToken());
  
  // Custom fetch function that includes the auth token
  const authFetchFn = async (url: string): Promise<SelectUser> => {
    const token = getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }
    
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        // Token might be invalid or expired
        removeToken();
        throw new Error("Authentication token expired");
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    return res.json();
  };
  
  // Fetch current user using token
  const {
    data: user,
    error,
    isLoading,
    refetch: refetchUser,
  } = useQuery<SelectUser, Error>({
    queryKey: ["/api/user"],
    queryFn: () => authFetchFn("/api/user"),
    enabled: !!token, // Only fetch if token exists
    retry: false,
    gcTime: 0, // Don't keep stale data
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Login mutation called with:", credentials);
      try {
        const res = await apiRequest("POST", "/api/login", credentials);
        const data = await res.json();
        console.log("Login successful response:", data);
        return data as AuthResponse;
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    onSuccess: (response: AuthResponse) => {
      console.log("Login success callback with response:", response);
      // Save token
      saveToken(response.token);
      setToken(response.token);
      
      // Update user in query cache
      queryClient.setQueryData(["/api/user"], response.user);
      
      toast({
        title: "Welcome back!",
        description: `You are now logged in as ${response.user.username}`,
      });
    },
    onError: (error: Error) => {
      console.error("Login onError callback:", error);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      console.log("Register mutation called with:", credentials);
      try {
        const res = await apiRequest("POST", "/api/register", credentials);
        const data = await res.json();
        console.log("Registration successful response:", data);
        return data as AuthResponse;
      } catch (error) {
        console.error("Registration error:", error);
        throw error;
      }
    },
    onSuccess: (response: AuthResponse) => {
      console.log("Registration success callback with response:", response);
      // Save token
      saveToken(response.token);
      setToken(response.token);
      
      // Update user in query cache
      queryClient.setQueryData(["/api/user"], response.user);
      
      toast({
        title: "Registration successful!",
        description: `Welcome to KarigarConnect, ${response.user.username}`,
      });
    },
    onError: (error: Error) => {
      console.error("Registration onError callback:", error);
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log("Logout mutation called");
      // Just notify the server (not required for JWT but good practice)
      await apiRequest("POST", "/api/logout");
      // Remove token from local storage
      removeToken();
      setToken(null);
    },
    onSuccess: () => {
      console.log("Logout success callback");
      // Clear user from cache
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: (error: Error) => {
      console.error("Logout onError callback:", error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
      // Still remove token on error
      removeToken();
      setToken(null);
      queryClient.setQueryData(["/api/user"], null);
    },
  });

  // Effect to handle token changes
  useEffect(() => {
    if (token) {
      refetchUser().catch(() => {
        // If refetch fails, the onError in useQuery will handle it
      });
    }
  }, [token, refetchUser]);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
