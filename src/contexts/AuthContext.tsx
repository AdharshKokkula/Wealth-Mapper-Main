
import { createContext, ReactNode } from 'react';
import { AuthContextType } from '@/types/auth';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children, value }: { children: ReactNode; value: AuthContextType }) => {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
