import { useState } from 'react';
import { Loader } from 'lucide-react';
import { useUserReminders, useUpdateReminder } from '@/hooks/useReminders';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ReminderListItem from './ReminderListItem';
import { FollowUpReminder } from '@/types/api';

type ActiveTab = 'all' | 'overdue' | 'upcoming';

export default function FollowUpsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());

  const { data: reminders, isLoading } = useUserReminders(
    activeTab === 'all' ? undefined : activeTab === 'overdue' ? 'pending' : 'pending'
  );
  const updateReminder = useUpdateReminder();

  const handleComplete = async (id: string) => {
    setCompletingIds(prev => new Set(prev).add(id));
    try {
      await updateReminder.mutateAsync({ id, data: { isCompleted: true } });
    } finally {
      setCompletingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const categorizeReminders = (reminders: FollowUpReminder[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - today.getDay()));

    const overdue: FollowUpReminder[] = [];
    const todayReminders: FollowUpReminder[] = [];
    const tomorrowReminders: FollowUpReminder[] = [];
    const thisWeekReminders: FollowUpReminder[] = [];
    const laterReminders: FollowUpReminder[] = [];

    reminders.forEach(reminder => {
      if (reminder.isCompleted) return;

      const dueDate = new Date(reminder.dueAt);
      const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

      if (dueDate < now) {
        overdue.push(reminder);
      } else if (dueDateOnly.getTime() === today.getTime()) {
        todayReminders.push(reminder);
      } else if (dueDateOnly.getTime() === tomorrow.getTime()) {
        tomorrowReminders.push(reminder);
      } else if (dueDate <= endOfWeek) {
        thisWeekReminders.push(reminder);
      } else {
        laterReminders.push(reminder);
      }
    });

    return {
      overdue,
      today: todayReminders,
      tomorrow: tomorrowReminders,
      thisWeek: thisWeekReminders,
      later: laterReminders
    };
  };

  const filteredReminders = reminders || [];
  const categorized = categorizeReminders(filteredReminders);

  const overdueCount = categorized.overdue.length;
  const upcomingCount = categorized.today.length + categorized.tomorrow.length +
                        categorized.thisWeek.length + categorized.later.length;

  const getDisplayedReminders = () => {
    if (activeTab === 'overdue') {
      return categorized.overdue;
    } else if (activeTab === 'upcoming') {
      return [
        ...categorized.today,
        ...categorized.tomorrow,
        ...categorized.thisWeek,
        ...categorized.later
      ];
    } else {
      return [
        ...categorized.overdue,
        ...categorized.today,
        ...categorized.tomorrow,
        ...categorized.thisWeek,
        ...categorized.later
      ];
    }
  };

  const renderSection = (title: string, reminders: FollowUpReminder[], variant: 'default' | 'destructive' = 'default') => {
    if (reminders.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <Badge variant={variant} className="text-xs">
            {reminders.length}
          </Badge>
        </div>
        <div className="space-y-3">
          {reminders.map(reminder => (
            <ReminderListItem
              key={reminder.id}
              reminder={reminder}
              onComplete={() => handleComplete(reminder.id)}
              isCompleting={completingIds.has(reminder.id)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-3xl font-bold text-foreground">Follow-ups</h1>
          {overdueCount > 0 && (
            <Badge variant="destructive" className="text-sm">
              {overdueCount} overdue
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant={activeTab === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveTab('all')}
          >
            All
          </Button>
          <Button
            variant={activeTab === 'overdue' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overdue')}
            className="gap-2"
          >
            Overdue
            {overdueCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {overdueCount}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeTab === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setActiveTab('upcoming')}
            className="gap-2"
          >
            Upcoming
            {upcomingCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {upcomingCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : getDisplayedReminders().length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {activeTab === 'overdue' && 'No overdue reminders'}
            {activeTab === 'upcoming' && 'No upcoming reminders'}
            {activeTab === 'all' && 'No reminders found'}
          </p>
        </div>
      ) : (
        <>
          {activeTab === 'all' && (
            <>
              {renderSection(`Overdue (${overdueCount})`, categorized.overdue, 'destructive')}
              {renderSection('Today', categorized.today)}
              {renderSection('Tomorrow', categorized.tomorrow)}
              {renderSection('This Week', categorized.thisWeek)}
              {renderSection('Later', categorized.later)}
            </>
          )}
          {activeTab === 'overdue' && (
            renderSection(`Overdue (${overdueCount})`, categorized.overdue, 'destructive')
          )}
          {activeTab === 'upcoming' && (
            <>
              {renderSection('Today', categorized.today)}
              {renderSection('Tomorrow', categorized.tomorrow)}
              {renderSection('This Week', categorized.thisWeek)}
              {renderSection('Later', categorized.later)}
            </>
          )}
        </>
      )}
    </div>
  );
}
