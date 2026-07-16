import { Phone, Mail, Calendar, StickyNote, Circle } from 'lucide-react';
import type { ActivityLog } from '@/types/api';

interface ActivityItemProps {
  activity: ActivityLog;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'yesterday';
  }
  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return diffInWeeks === 1 ? '1 week ago' : `${diffInWeeks} weeks ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return diffInYears === 1 ? '1 year ago' : `${diffInYears} years ago`;
}

function getActivityIcon(type: ActivityLog['type']) {
  switch (type) {
    case 'CALL':
      return <Phone className="h-4 w-4 text-blue-500" />;
    case 'EMAIL':
      return <Mail className="h-4 w-4 text-green-500" />;
    case 'MEETING':
      return <Calendar className="h-4 w-4 text-purple-500" />;
    case 'NOTE':
      return <StickyNote className="h-4 w-4 text-yellow-500" />;
    case 'OTHER':
      return <Circle className="h-4 w-4 text-gray-500" />;
  }
}

function getActivityIconBgColor(type: ActivityLog['type']) {
  switch (type) {
    case 'CALL':
      return 'bg-blue-100';
    case 'EMAIL':
      return 'bg-green-100';
    case 'MEETING':
      return 'bg-purple-100';
    case 'NOTE':
      return 'bg-yellow-100';
    case 'OTHER':
      return 'bg-gray-100';
  }
}

export default function ActivityItem({ activity }: ActivityItemProps) {
  return (
    <div className="flex gap-4 relative pb-6">
      <div className="flex flex-col items-center">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full ${getActivityIconBgColor(
            activity.type
          )}`}
        >
          {getActivityIcon(activity.type)}
        </div>
        <div className="flex-1 w-px bg-border mt-2 absolute top-10 bottom-0 left-5" />
      </div>
      <div className="flex-1 pt-1">
        <p className="text-sm text-foreground whitespace-pre-wrap">
          {activity.content}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <p className="text-sm text-muted-foreground">
            {activity.user?.name || 'Unknown'}
          </p>
          <span className="text-muted-foreground">•</span>
          <p className="text-xs text-muted-foreground">
            {formatRelativeTime(activity.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
