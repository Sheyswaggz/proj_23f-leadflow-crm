import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeadFilters } from '../LeadFilters';

describe('LeadFilters', () => {
  const mockOnSearchChange = vi.fn();
  const mockOnStageChange = vi.fn();

  beforeEach(() => {
    mockOnSearchChange.mockClear();
    mockOnStageChange.mockClear();
  });

  it('renders search input', () => {
    render(
      <LeadFilters
        search=""
        onSearchChange={mockOnSearchChange}
        stage=""
        onStageChange={mockOnStageChange}
      />
    );
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it('renders stage dropdown', () => {
    render(
      <LeadFilters
        search=""
        onSearchChange={mockOnSearchChange}
        stage=""
        onStageChange={mockOnStageChange}
      />
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('calls onSearchChange when search input changes', async () => {
    const user = userEvent.setup();
    render(
      <LeadFilters
        search=""
        onSearchChange={mockOnSearchChange}
        stage=""
        onStageChange={mockOnStageChange}
      />
    );
    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'test');
    expect(mockOnSearchChange).toHaveBeenCalled();
  });

  it('calls onStageChange when stage dropdown changes', async () => {
    const user = userEvent.setup();
    render(
      <LeadFilters
        search=""
        onSearchChange={mockOnSearchChange}
        stage=""
        onStageChange={mockOnStageChange}
      />
    );
    const stageDropdown = screen.getByRole('combobox');
    await user.selectOptions(stageDropdown, 'NEW');
    expect(mockOnStageChange).toHaveBeenCalledWith('NEW');
  });

  it('shows clear filters button when filters are active', () => {
    render(
      <LeadFilters
        search="test"
        onSearchChange={mockOnSearchChange}
        stage=""
        onStageChange={mockOnStageChange}
      />
    );
    expect(screen.getByText(/clear/i)).toBeInTheDocument();
  });

  it('does not show clear filters button when no filters are active', () => {
    render(
      <LeadFilters
        search=""
        onSearchChange={mockOnSearchChange}
        stage=""
        onStageChange={mockOnStageChange}
      />
    );
    expect(screen.queryByText(/clear/i)).not.toBeInTheDocument();
  });

  it('clears filters when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <LeadFilters
        search="test"
        onSearchChange={mockOnSearchChange}
        stage="NEW"
        onStageChange={mockOnStageChange}
      />
    );
    const clearButton = screen.getByText(/clear/i);
    await user.click(clearButton);
    expect(mockOnSearchChange).toHaveBeenCalledWith('');
    expect(mockOnStageChange).toHaveBeenCalledWith('');
  });
});
