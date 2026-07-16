import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { cn } from '@/lib/utils';

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Backdrop overlay for mobile sidebar */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-20 md:hidden',
          isSidebarOpen ? 'block' : 'hidden'
        )}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with hamburger button */}
        <div className="relative">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 rounded-md text-foreground hover:bg-secondary absolute left-4 top-4 z-10"
            aria-label="Toggle menu"
          >
            <i className="fa-solid fa-bars text-lg" />
          </button>
          <Header />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
