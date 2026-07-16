import { render, screen } from '@testing-library/react';
import { PipelineHealthWidget } from '../PipelineHealthWidget';
import { LeadStage } from '@/types/api';

describe('PipelineHealthWidget', () => {
  const mockLeadsByStage = {
    [LeadStage.NEW]: 10,
    [LeadStage.CONTACTED]: 5,
    [LeadStage.QUALIFIED]: 3,
    [LeadStage.PROPOSAL_SENT]: 2,
    [LeadStage.CLOSED_WON]: 1,
    [LeadStage.CLOSED_LOST]: 4,
  };

  it('renders all pipeline stages', () => {
    render(<PipelineHealthWidget leadsByStage={mockLeadsByStage} totalLeads={25} />);
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Contacted')).toBeInTheDocument();
    expect(screen.getByText('Qualified')).toBeInTheDocument();
    expect(screen.getByText('Proposal Sent')).toBeInTheDocument();
    expect(screen.getByText('Closed Won')).toBeInTheDocument();
    expect(screen.getByText('Closed Lost')).toBeInTheDocument();
  });

  it('renders correct lead counts for each stage', () => {
    render(<PipelineHealthWidget leadsByStage={mockLeadsByStage} totalLeads={25} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('renders correct progress bar widths', () => {
    const { container } = render(
      <PipelineHealthWidget leadsByStage={mockLeadsByStage} totalLeads={25} />
    );
    const progressBars = container.querySelectorAll('[role="progressbar"]');
    expect(progressBars[0]).toHaveStyle({ width: '40%' }); // 10/25
    expect(progressBars[1]).toHaveStyle({ width: '20%' }); // 5/25
    expect(progressBars[2]).toHaveStyle({ width: '12%' }); // 3/25
    expect(progressBars[3]).toHaveStyle({ width: '8%' }); // 2/25
    expect(progressBars[4]).toHaveStyle({ width: '4%' }); // 1/25
    expect(progressBars[5]).toHaveStyle({ width: '16%' }); // 4/25
  });

  it('renders total lead count', () => {
    render(<PipelineHealthWidget leadsByStage={mockLeadsByStage} totalLeads={25} />);
    expect(screen.getByText(/25/)).toBeInTheDocument();
  });

  it('shows -- when totalLeads is 0', () => {
    const emptyLeadsByStage = {
      [LeadStage.NEW]: 0,
      [LeadStage.CONTACTED]: 0,
      [LeadStage.QUALIFIED]: 0,
      [LeadStage.PROPOSAL_SENT]: 0,
      [LeadStage.CLOSED_WON]: 0,
      [LeadStage.CLOSED_LOST]: 0,
    };
    render(<PipelineHealthWidget leadsByStage={emptyLeadsByStage} totalLeads={0} />);
    expect(screen.getByText('--')).toBeInTheDocument();
  });
});
