
import { useState, useEffect, ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types/auth';
import { AuthContext, AuthProvider as BaseAuthProvider } from '@/contexts/AuthContext';
import { 
  loginUser, 
  registerUser,
  fetchUserProfile,
  getCurrentUser,
  clearUserSession,
  handleAuthSuccess,
  handleAuthError
} from '@/services/authService';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check for existing user session on initial load
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const storedUser = getCurrentUser();
        
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const userData = await loginUser(email, password);
      
      if (userData) {
        setUser(userData);
        handleAuthSuccess("Successfully logged in");
        navigate(userData.role === 'admin' ? '/admin/dashboard' : '/properties/map');
      } else {
        throw new Error("Invalid email or password");
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid email or password');
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const userData = await registerUser(email, password, fullName);
      
      if (userData) {
        setUser(userData);
        handleAuthSuccess("Registration successful!");
        navigate('/properties/map');
      } else {
        throw new Error("User with this email already exists");
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed');
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    clearUserSession();
    setUser(null);
    navigate('/login');
    handleAuthSuccess("Successfully logged out");
  };

  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    error,
    setError,
  };

  return <BaseAuthProvider value={value}>{children}</BaseAuthProvider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
