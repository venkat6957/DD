import { Bell, HelpCircle, LogOut, Menu, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="glass-header z-10 flex h-16 items-center justify-between px-4 md:px-6">
      {/* Left: Menu button (mobile) and Logo */}
      <div className="flex items-center">
        <button
          type="button"
          className="mr-4 rounded-xl p-2 text-neutral-600 hover:bg-white/30 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="flex items-center">
          <span className="text-xl font-bold gradient-text">DentalCare</span>
        </div>
      </div>

      {/* Right: User menu, notifications, etc. */}
      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            className="rounded-xl p-2 text-neutral-600 hover:bg-white/30 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-accent-500 to-accent-600 text-[10px] font-bold text-white shadow-lg">
              3
            </span>
          </button>
          
          {/* Notifications dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-2xl bg-white/95 backdrop-blur-md shadow-2xl ring-1 ring-black/5 focus:outline-none border border-white/20">
              <div className="py-2">
                <div className="border-b border-neutral-200/50 px-4 py-3">
                  <h3 className="font-semibold gradient-text">Notifications</h3>
                </div>
                {/* Notification items */}
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  <div className="border-b border-neutral-100/50 px-4 py-3 hover:bg-primary-50/50 transition-colors duration-200">
                    <p className="text-sm font-medium text-neutral-900">New appointment scheduled</p>
                    <p className="text-xs text-neutral-500">Jessica Miller - Today at 10:00 AM</p>
                  </div>
                  <div className="border-b border-neutral-100/50 px-4 py-3 hover:bg-primary-50/50 transition-colors duration-200">
                    <p className="text-sm font-medium text-neutral-900">Appointment rescheduled</p>
                    <p className="text-xs text-neutral-500">David Wilson - Yesterday at 3:45 PM</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-primary-50/50 transition-colors duration-200">
                    <p className="text-sm font-medium text-neutral-900">New patient registered</p>
                    <p className="text-xs text-neutral-500">Emily Taylor - 2 days ago</p>
                  </div>
                </div>
                <div className="border-t border-neutral-200/50 px-4 py-3 text-center">
                  <button className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200">
                    View all notifications
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help */}
        <button
          type="button"
          className="rounded-xl p-2 text-neutral-600 hover:bg-white/30 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
        >
          <span className="sr-only">Help</span>
          <HelpCircle className="h-6 w-6" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center rounded-xl p-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 hover:shadow-lg"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <span className="sr-only">Open user menu</span>
            {user?.avatar ? (
              <img
                className="h-10 w-10 rounded-xl object-cover shadow-lg border-2 border-white/50"
                src={user.avatar}
                alt={user.name}
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-purple-100 text-primary-700 shadow-lg border-2 border-white/50">
                <User className="h-5 w-5" />
              </div>
            )}
          </button>
          
          {/* User dropdown */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl bg-white/95 backdrop-blur-md py-2 shadow-2xl ring-1 ring-black/5 focus:outline-none border border-white/20">
              <div className="border-b border-neutral-200/50 px-4 py-3">
                <p className="text-sm font-semibold text-neutral-900">{user?.name}</p>
                <p className="text-xs text-neutral-500">{user?.email}</p>
              </div>
              <a
                href="#"
                className="block px-4 py-3 text-sm text-neutral-700 hover:bg-primary-50/50 transition-colors duration-200"
              >
                Your Profile
              </a>
              <a
                href="#"
                className="block px-4 py-3 text-sm text-neutral-700 hover:bg-primary-50/50 transition-colors duration-200"
              >
                Settings
              </a>
              <button
                onClick={logout}
                className="flex w-full items-center px-4 py-3 text-sm text-neutral-700 hover:bg-error-50/50 hover:text-error-600 transition-colors duration-200"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;