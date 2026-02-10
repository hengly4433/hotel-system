"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { User } from "@/lib/types/user";
import { apiJson } from "@/lib/api/client";

interface UserContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = useCallback(async () => {
        try {
            // Don't set loading to true on refetch to avoid flickering
            // Only initial load needs blocking loading state if desired, 
            // but here we might want to keep it simple. 
            // Let's set loading only if we define it as "initial load".
            // For now, let's keep it simple: strict loading state.
            // Actually, for better UX on refetch, we usually keep old data while fetching.
            // But existing hook set loading=true every time. Let's stick to that for now, 
            // user can optimize later if flickers are annoying.
            // setLoading(true); 

            const data = await apiJson<User>("me/profile");
            setUser(data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch user:", err);
            setError(err instanceof Error ? err.message : "Failed to fetch user profile");
            // Don't clear user on error to allow "stale-while-revalidate" feel if needed?
            // tailored to existing behavior: existing hook set user=null on error.
            // keeping it safe.
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return (
        <UserContext.Provider value={{ user, loading, error, refetch: fetchUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUserContext() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUserContext must be used within a UserProvider");
    }
    return context;
}
