import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

// Create context with a default value to avoid null checks
export const AuthContext = createContext<AuthContextType>(createEmptyAuth());

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // Fetch current user
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Login mutation called with:", credentials);
      try {
        const res = await apiRequest("POST", "/api/login", credentials);
        const data = await res.json();
        console.log("Login successful response:", data);
        return data;
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      console.log("Login success callback with user:", user);
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Welcome back!",
        description: `You are now logged in as ${user.username}`,
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
        return data;
      } catch (error) {
        console.error("Registration error:", error);
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      console.log("Registration success callback with user:", user);
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful!",
        description: `Welcome to KarigarConnect, ${user.username}`,
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
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      console.log("Logout success callback");
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
    },
  });

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
