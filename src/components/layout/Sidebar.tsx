import { BarChart3, Calendar, Home, Menu, Users, X, Pill, DollarSign, Settings, UserPlus } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { ToothLogo } from '../common/ToothLogo';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const { user } = useAuth();

  // Get user permissions from role entity
  const permissions = user?.roleEntity?.permissions || {};

  // Define all navigation items with their required permissions
  const allNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, permission: 'dashboard' },
    { name: 'Patients', href: '/patients', icon: Users, permission: 'patients' },
    { name: 'Appointments', href: '/appointments', icon: Calendar, permission: 'appointments' },
    { name: 'Calendar', href: '/calendar', icon: Calendar, permission: 'calendar' },
    { name: 'Pharmacy', href: '/pharmacy', icon: Pill, permission: 'pharmacy' },
    { name: 'Pharmacy POS', href: '/pharmacy-pos', icon: DollarSign, permission: 'pharmacy-pos' },
    { name: 'Reports', href: '/reports', icon: BarChart3, permission: 'reports' },
    { name: 'Users', href: '/users', icon: UserPlus, permission: 'users' },
    { name: 'Configure', href: '/configure', icon: Settings, permission: 'configure' },
  ];

  // Filter navigation based on user permissions
  const navigation = allNavigation.filter(item => {
    // If no permissions defined, show all (backward compatibility)
    if (!permissions || Object.keys(permissions).length === 0) {
      return true;
    }
    // Check if user has permission for this item
    return permissions[item.permission] === true;
  });

  return (
    <>
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 z-20 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden ${
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <div
        className={`fixed inset-y-0 left-0 z-20 w-64 transform overflow-y-auto glass-sidebar transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <ToothLogo className="h-8 w-8" />
            <span className="text-xl font-bold gradient-text">DentalCare</span>
          </div>
          <button
            type="button"
            className="rounded-xl p-2 text-neutral-500 hover:bg-white/20 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="py-6 px-4">
          <nav className="space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : 'text-neutral-600'}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="rounded-2xl bg-gradient-to-r from-primary-500/10 to-purple-500/10 p-4 border border-primary-200/30 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">{user?.name}</p>
                <p className="text-xs text-neutral-600 capitalize">
                  {user?.roleEntity?.name || user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;