'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
    user: string | null;
    login: (user: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const storedUser = localStorage.getItem('academy_user');
        if (storedUser) {
            setUser(storedUser);
        } else if (pathname !== '/login') {
            router.push('/login');
        }
    }, [pathname, router]);

    const login = (username: string) => {
        localStorage.setItem('academy_user', username);
        setUser(username);
        router.push('/');
    };

    const logout = () => {
        localStorage.removeItem('academy_user');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
