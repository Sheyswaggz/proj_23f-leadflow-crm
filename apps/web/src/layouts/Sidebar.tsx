import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { to: '/dashboard', icon: 'fa-solid fa-chart-line', label: 'Dashboard' },
  { to: '/leads', icon: 'fa-solid fa-users', label: 'Leads' },
  { to: '/follow-ups', icon: 'fa-solid fa-bell', label: 'Follow-ups' },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col bg-card border-r border-border">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-border">
          <h1 className="text-xl font-bold text-foreground">LeadFlow CRM</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary'
                }`
              }
            >
              <i className={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-border">
          <div className="px-3">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
