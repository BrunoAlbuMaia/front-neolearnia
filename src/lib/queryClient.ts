import { QueryClient, type QueryFunction } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUserToken, getCurrentUser } from "./firebase";


async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const token = await getCurrentUserToken();
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = await getCurrentUserToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    const res = await fetch(queryKey.join("/") as string, {
      headers,
      credentials: "include",
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

// Hook to sync user data with backend
export function useSyncUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ email, name }: { email: string; name?: string }) => {
      const res = await apiRequest('POST', `${import.meta.env.VITE_LINK_API}/api/sync-user`, { email, name });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate any user-related queries
      queryClient.invalidateQueries({ queryKey: [`${import.meta.env.VITE_LINK_API}/api/flashcard-sets`] });
    }
  });
}

// Hook to auto-sync user data on login
export function useAutoSyncUser() {
  const syncUser = useSyncUser();
  
  const syncCurrentUser = async () => {
    const user = getCurrentUser();
    if (user?.email) {
      await syncUser.mutateAsync({
        email: user.email,
        name: user.displayName || user.email.split('@')[0]
      });
    }
  };
  
  return syncCurrentUser;
}
