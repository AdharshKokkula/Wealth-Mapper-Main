
import { toast } from "sonner";
import { User } from "@/types/auth";

const API_URL = 'https://wealthmap-mock-api.onrender.com/api';

// Mock database of users for demo purposes
const MOCK_USERS = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@wealthmap.com',
    password: 'password', // In a real app, this would be hashed
    role: 'admin' as const,
    company_id: '648813f5-3e95-4a15-9169-31d4af71ca4b',
    created_at: '2023-01-01T00:00:00.000Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'employee@wealthmap.com',
    password: 'password', // In a real app, this would be hashed
    role: 'employee' as const,
    company_id: '648813f5-3e95-4a15-9169-31d4af71ca4b',
    created_at: '2023-01-01T00:00:00.000Z',
  }
];

// In a real application, this would be a server-side API call
export async function loginUser(email: string, password: string): Promise<User | null> {
  console.log('Attempting login for:', email);
  
  try {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find user with matching email
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // Check if user exists and password matches
    if (user && user.password === password) {
      // Don't send password to client
      const { password: _, ...userWithoutPassword } = user;
      const userData = userWithoutPassword as User;
      
      // Store user in localStorage for session persistence
      localStorage.setItem('wealthmap_user', JSON.stringify(userData));
      
      return userData;
    }
    
    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

// In a real application, this would make a server-side API call
export async function registerUser(email: string, password: string, fullName: string): Promise<User | null> {
  try {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (existingUser) {
      return null; // User already exists
    }
    
    // Create new user (in a real app, this would be saved to a database)
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      role: 'employee',
      company_id: '648813f5-3e95-4a15-9169-31d4af71ca4b',
      created_at: new Date().toISOString(),
    };
    
    // Store user in localStorage for session persistence
    localStorage.setItem('wealthmap_user', JSON.stringify(newUser));
    
    return newUser;
  } catch (error) {
    console.error('Registration error:', error);
    return null;
  }
}

export async function fetchUserProfile(userId: string): Promise<User | null> {
  try {
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Find user by ID
    const user = MOCK_USERS.find(u => u.id === userId);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export function getCurrentUser(): User | null {
  const userJson = localStorage.getItem('wealthmap_user');
  
  if (userJson) {
    try {
      return JSON.parse(userJson) as User;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
    }
  }
  
  return null;
}

export function clearUserSession(): void {
  localStorage.removeItem('wealthmap_user');
}

export function handleAuthSuccess(message: string) {
  toast.success(message);
}

export function handleAuthError(error: any) {
  const errorMessage = typeof error === 'string' ? error : error?.message || 'Authentication error';
  toast.error(errorMessage);
}
