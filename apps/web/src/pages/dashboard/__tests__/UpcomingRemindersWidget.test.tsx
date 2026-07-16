import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import UpcomingRemindersWidget from '../UpcomingRemindersWidget';
import { FollowUpReminder } from '@/types/api';

describe('UpcomingRemindersWidget', () => {
  const mockReminders: FollowUpReminder[] = [
    {
      id: '1',
      leadId: 'lead-1',
      userId: 'user-1',
      dueAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      note: 'Follow up call',
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lead: {
        id: 'lead-1',
        name: 'John Doe',
        company: 'Acme Corp',
      },
    },
    {
      id: '2',
      leadId: 'lead-2',
      userId: 'user-1',
      dueAt: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
      note: 'Send proposal',
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lead: {
        id: 'lead-2',
        name: 'Jane Smith',
        company: 'Tech Inc',
      },
    },
  ];

  it('renders reminders with lead names', () => {
    render(
      <MemoryRouter>
        <UpcomingRemindersWidget reminders={mockReminders} overdueCount={0} />
      </MemoryRouter>
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('renders overdue badge when overdueCount is greater than 0', () => {
    render(
      <MemoryRouter>
        <UpcomingRemindersWidget reminders={mockReminders} overdueCount={3} />
      </MemoryRouter>
    );
    expect(screen.getByText(/3.*overdue/i)).toBeInTheDocument();
  });

  it('does not render overdue badge when overdueCount is 0', () => {
    render(
      <MemoryRouter>
        <UpcomingRemindersWidget reminders={mockReminders} overdueCount={0} />
      </MemoryRouter>
    );
    expect(screen.queryByText(/overdue/i)).not.toBeInTheDocument();
  });

  it('renders empty state when no reminders', () => {
    render(
      <MemoryRouter>
        <UpcomingRemindersWidget reminders={[]} overdueCount={0} />
      </MemoryRouter>
    );
    expect(screen.getByText(/no upcoming follow-ups/i)).toBeInTheDocument();
  });

  it('renders due dates for reminders', () => {
    render(
      <MemoryRouter>
        <UpcomingRemindersWidget reminders={mockReminders} overdueCount={0} />
      </MemoryRouter>
    );
    expect(screen.getByText(/due/i)).toBeInTheDocument();
  });
});
