
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EyeIcon, EyeOffIcon, Loader } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { signIn, isLoading, isAuthenticated, user, error, setError } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("User authenticated:", user);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/properties/map');
    }
  }, [isAuthenticated, user, navigate]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!email.trim()) {
      errors.email = 'Email is required';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset previous error
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    console.log("Attempting login with:", email);
    await signIn(email, password);
  };
  
  const fillDemoAccount = (type: 'admin' | 'employee') => {
    setEmail(type === 'admin' ? 'admin@wealthmap.com' : 'employee@wealthmap.com');
    setPassword('password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-wealth-background">
      <div className="w-full max-w-md p-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-wealth-primary">
            <span className="text-wealth-accent">Wealth</span>Map
          </h1>
          <p className="text-wealth-secondary mt-2">Property Ownership Intelligence</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@wealthmap.com or employee@wealthmap.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={validationErrors.email ? 'border-destructive' : ''}
                />
                {validationErrors.email && (
                  <p className="text-destructive text-xs mt-1">{validationErrors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={passwordVisible ? "text" : "password"}
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={validationErrors.password ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-destructive text-xs mt-1">{validationErrors.password}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Use 'password' for demo accounts
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-wealth-accent hover:bg-wealth-accent/90" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
              
              <div className="flex justify-center w-full">
                <Link 
                  to="/register" 
                  className="text-sm text-wealth-accent hover:underline"
                >
                  Need an account? Register here
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Demo Accounts:
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <Button variant="outline" size="sm" onClick={() => fillDemoAccount('admin')}>
              Admin Demo
            </Button>
            <Button variant="outline" size="sm" onClick={() => fillDemoAccount('employee')}>
              Employee Demo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
