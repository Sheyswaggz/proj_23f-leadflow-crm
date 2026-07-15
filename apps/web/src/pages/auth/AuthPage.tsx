import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { Toaster } from '@/components/ui/toast';

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(
    (searchParams.get('mode') as 'login' | 'register') || 'login'
  );

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const paramMode = searchParams.get('mode');
    if (paramMode === 'register') {
      setMode('register');
    } else {
      setMode('login');
    }
  }, [searchParams]);

  if (isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left decorative panel - hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, hsl(222.2 84% 4.9%) 0%, hsl(217.2 32.6% 17.5%) 100%)',
          }}
        />
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h1 className="text-4xl font-bold mb-4">LeadFlow CRM</h1>
          <p className="text-xl text-gray-300">
            Your Pipeline. Always Under Control.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {mode === 'login' ? 'Welcome back' : 'Create an account'}
            </h2>
            <p className="text-muted-foreground">
              {mode === 'login'
                ? 'Enter your credentials to access your account'
                : 'Sign up to get started with LeadFlow CRM'}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 shadow-lg">
            {mode === 'login' ? (
              <LoginForm onSwitchToRegister={() => setMode('register')} />
            ) : (
              <RegisterForm onSwitchToLogin={() => setMode('login')} />
            )}
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
}
