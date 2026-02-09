'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserRole } from '@/types';

interface AuthContextType {
    user: string | null;
    role: UserRole | null;
    login: (user: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<string | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const storedUser = localStorage.getItem('academy_user');
        if (storedUser) {
            setUser(storedUser);
            // Mock role derivation: 'admin' username gets Admin role
            setRole(storedUser.toLowerCase().includes('admin') ? 'Admin' : 'Staff');
        } else if (pathname !== '/login') {
            router.push('/login');
        }
    }, [pathname, router]);

    const login = (username: string) => {
        localStorage.setItem('academy_user', username);
        setUser(username);
        setRole(username.toLowerCase().includes('admin') ? 'Admin' : 'Staff');
        router.push('/');
    };

    const logout = () => {
        localStorage.removeItem('academy_user');
        setUser(null);
        setRole(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, role, login, logout }}>
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
