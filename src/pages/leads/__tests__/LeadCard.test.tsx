import { render, screen } from '@testing-library/react';
import { LeadCard } from '../LeadCard';
import { Lead, LeadStage } from '@/types/api';

describe('LeadCard', () => {
  const mockLead: Lead = {
    id: '1',
    userId: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    company: 'Acme Corp',
    jobTitle: 'CEO',
    stage: LeadStage.NEW,
    notes: 'Test notes',
    dealValue: '5000',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockOnClick = vi.fn();

  it('renders lead name', () => {
    render(<LeadCard lead={mockLead} onClick={mockOnClick} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders company when provided', () => {
    render(<LeadCard lead={mockLead} onClick={mockOnClick} />);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('renders email when provided', () => {
    render(<LeadCard lead={mockLead} onClick={mockOnClick} />);
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders stage badge', () => {
    render(<LeadCard lead={mockLead} onClick={mockOnClick} />);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('renders formatted deal value', () => {
    render(<LeadCard lead={mockLead} onClick={mockOnClick} />);
    expect(screen.getByText('$5,000.00')).toBeInTheDocument();
  });

  it('renders relative time', () => {
    render(<LeadCard lead={mockLead} onClick={mockOnClick} />);
    expect(screen.getByText(/just now|ago/i)).toBeInTheDocument();
  });

  it('does not render company when not provided', () => {
    const leadWithoutCompany = { ...mockLead, company: undefined };
    render(<LeadCard lead={leadWithoutCompany} onClick={mockOnClick} />);
    expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    render(<LeadCard lead={mockLead} onClick={mockOnClick} />);
    const card = screen.getByRole('article');
    card.click();
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
