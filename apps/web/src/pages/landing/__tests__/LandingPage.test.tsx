import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LandingPage from '../LandingPage';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  })),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

const renderWithProviders = (component: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      <MemoryRouter>{component}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('LandingPage', () => {
  it('renders hero headline', () => {
    renderWithProviders(<LandingPage />);
    expect(
      screen.getByText('Your Pipeline. Always Under Control.')
    ).toBeInTheDocument();
  });

  it('renders Get Started Free CTA', () => {
    renderWithProviders(<LandingPage />);
    expect(screen.getByText('Get Started Free')).toBeInTheDocument();
  });

  it('renders Sign In link', () => {
    renderWithProviders(<LandingPage />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('renders navigation', () => {
    renderWithProviders(<LandingPage />);
    expect(screen.getByText('LeadFlow')).toBeInTheDocument();
    expect(screen.getByText('CRM')).toBeInTheDocument();
  });
});
