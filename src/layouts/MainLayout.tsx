
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Lightbulb, Target, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import SidebarLink from '@/components/SidebarLink';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut, user } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for mobile */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        } bg-black bg-opacity-50`}
        onClick={toggleSidebar}
      ></div>

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 transform transition-all duration-300 ease-in-out bg-sidebar text-sidebar-foreground
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:relative lg:z-0
        `}
      >
        <div className="flex items-center justify-between px-4 py-5">
          <div className="flex items-center">
            <span className="text-xl service-logo text-white">ServiceFlow</span>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden">
            <X size={20} className="text-sidebar-foreground" />
          </button>
        </div>
        <div className="px-4 py-2">
          <div className="mb-6">
            <p className="text-sm text-sidebar-foreground/70 mb-2 px-2">
              Main Menu
            </p>
            <ul className="space-y-1">
              <SidebarLink to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
              <SidebarLink to="/solutions" icon={<Lightbulb size={18} />} label="Solutions" />
              <SidebarLink to="/opportunities" icon={<Target size={18} />} label="Opportunities" />
              <SidebarLink to="/discovery" icon={<LayoutDashboard size={18} />} label="Discovery" />
            </ul>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-sidebar-foreground/70 mb-2 px-2">
              Settings
            </p>
            <ul className="space-y-1">
              <li>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-sidebar-accent text-sidebar-foreground">
                      <Settings size={18} className="mr-2" />
                      <span>Settings</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" className="w-56" align="start">
                    <DropdownMenuItem asChild>
                      <a href="/settings/templates" className="cursor-pointer">
                        Discovery Templates
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            </ul>
          </div>
        </div>
        <div className="absolute bottom-0 w-full border-t border-sidebar-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-white font-semibold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="text-sm truncate max-w-[7rem]">
                {user?.email}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={signOut}
              className="text-sidebar-foreground hover:text-white hover:bg-sidebar-accent"
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-x-hidden">
        {/* Top navbar */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4">
            <button onClick={toggleSidebar} className="lg:hidden">
              <Menu size={20} />
            </button>
            <div className="lg:hidden flex items-center">
              <span className="text-xl font-semibold service-logo text-serviceblue-700">ServiceFlow</span>
            </div>
            <div className="flex items-center"></div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
