import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AuthPage from './pages/auth/AuthPage';
import ResetPasswordForm from './pages/auth/ResetPasswordForm';
import LandingPage from './pages/landing/LandingPage';
import AppLayout from './layouts/AppLayout';
import DashboardPage from './pages/dashboard/DashboardPage';
import LeadsPage from './pages/leads/LeadsPage';
import LeadDetailPage from './pages/leads/LeadDetailPage';
import FollowUpsPage from './pages/followups/FollowUpsPage';
import ErrorBoundary from './components/ErrorBoundary';
import NotFoundPage from './pages/NotFoundPage';

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}


function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex bg-background">
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

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Reset your password
            </h2>
            <p className="text-muted-foreground">
              Enter your new password below
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 shadow-lg">
            <ResetPasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ErrorBoundary><LandingPage /></ErrorBoundary>} />
      <Route path="/auth" element={<ErrorBoundary><AuthPage /></ErrorBoundary>} />
      <Route path="/auth/reset-password" element={<ErrorBoundary><ResetPasswordPage /></ErrorBoundary>} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
        <Route path="/leads" element={<ErrorBoundary><LeadsPage /></ErrorBoundary>} />
        <Route path="/leads/:id" element={<ErrorBoundary><LeadDetailPage /></ErrorBoundary>} />
        <Route path="/follow-ups" element={<ErrorBoundary><FollowUpsPage /></ErrorBoundary>} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
