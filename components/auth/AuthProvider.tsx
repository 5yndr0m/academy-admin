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
        const storedRole = localStorage.getItem('academy_role') as UserRole | null;
        const storedToken = localStorage.getItem('auth_token');

        if (storedUser && storedRole && storedToken) {
            setUser(storedUser);
            setRole(storedRole);
        } else if (pathname !== '/login') {
            router.push('/login');
        }
    }, [pathname, router]);

    const login = (data: { token: string; user: string; role: UserRole }) => {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('academy_user', data.user);
        localStorage.setItem('academy_role', data.role);
        
        setUser(data.user);
        setRole(data.role);
        router.push('/');
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('academy_user');
        localStorage.removeItem('academy_role');
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
