import { BarChart3, Calendar, Home, Menu, Users, X, Pill, DollarSign, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { ToothLogo } from '../common/ToothLogo';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Patients', href: '/patients', icon: Users },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Pharmacy', href: '/pharmacy', icon: Pill },
  { name: 'Pharmacy POS', href: '/pharmacy-pos', icon: DollarSign },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Configure', href: '/configure', icon: Settings },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
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

        {/* Sidebar footer with gradient accent */}
        {/* <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="rounded-2xl bg-gradient-to-r from-primary-500/10 to-purple-500/10 p-4 border border-primary-200/30 backdrop-blur-sm">
            <h4 className="text-sm font-semibold text-neutral-900 mb-2">Need Help?</h4>
            <p className="text-xs text-neutral-600 mb-3">Contact our support team for assistance</p>
            <button className="w-full text-xs bg-gradient-to-r from-primary-500 to-purple-500 text-white py-2 px-3 rounded-lg hover:from-primary-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg">
              Get Support
            </button>
          </div>
        </div> */}
      </div>
    </>
  );
};

export default Sidebar;