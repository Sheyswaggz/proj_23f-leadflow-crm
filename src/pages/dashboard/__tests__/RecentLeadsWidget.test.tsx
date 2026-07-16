import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RecentLeadsWidget } from '../RecentLeadsWidget';
import { Lead, LeadStage } from '@/types/api';

describe('RecentLeadsWidget', () => {
  const mockLeads: Partial<Lead>[] = [
    {
      id: '1',
      name: 'John Doe',
      company: 'Acme Corp',
      stage: LeadStage.NEW,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Jane Smith',
      company: 'Tech Inc',
      stage: LeadStage.CONTACTED,
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Bob Johnson',
      company: 'Startup LLC',
      stage: LeadStage.QUALIFIED,
      createdAt: new Date().toISOString(),
    },
  ];

  it('renders lead names as links', () => {
    render(
      <MemoryRouter>
        <RecentLeadsWidget leads={mockLeads} />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: 'John Doe' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Jane Smith' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Bob Johnson' })).toBeInTheDocument();
  });

  it('renders stage badges for each lead', () => {
    render(
      <MemoryRouter>
        <RecentLeadsWidget leads={mockLeads} />
      </MemoryRouter>
    );
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Contacted')).toBeInTheDocument();
    expect(screen.getByText('Qualified')).toBeInTheDocument();
  });

  it('renders company names', () => {
    render(
      <MemoryRouter>
        <RecentLeadsWidget leads={mockLeads} />
      </MemoryRouter>
    );
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Tech Inc')).toBeInTheDocument();
    expect(screen.getByText('Startup LLC')).toBeInTheDocument();
  });

  it('renders empty state when no leads', () => {
    render(
      <MemoryRouter>
        <RecentLeadsWidget leads={[]} />
      </MemoryRouter>
    );
    expect(screen.getByText(/no leads yet/i)).toBeInTheDocument();
  });

  it('renders correct href for lead links', () => {
    render(
      <MemoryRouter>
        <RecentLeadsWidget leads={mockLeads} />
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: 'John Doe' });
    expect(link).toHaveAttribute('href', '/leads/1');
  });
});
