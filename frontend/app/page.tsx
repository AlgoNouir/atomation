'use client'

import { useState, useEffect } from 'react';
import KanbanBoard from '@/components/KanbanBoard';
import GanttChartContainer from '@/components/GanttChartContainer';
import ProjectList from '@/components/ProjectList';
import SettingsModal from '@/components/SettingsModal';
import TeamModal from '@/components/TeamModal';
import { Sun, Moon, Settings, LogOut, Users } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logout, logoutUser } from '@/store/slices/authSlice';

export default function KanbanPage() {
  const [theme, setTheme] = useState('light');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <div className="min-h-screen bg-base-100 flex">
      {/* Sidebar */}
      <aside className="w-96 bg-base-200 h-screen overflow-y-auto flex-shrink-0">
        <ProjectList />
      </aside>

      {/* Main Content */}
      <div className="flex-grow overflow-hidden">
        <header className="sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-base-200 bg-base-100/75 supports-backdrop-blur:bg-base-100/60">
          <div className="max-w-8xl mx-auto">
            <div className="py-4 border-b border-base-200 lg:px-8 lg:border-0 mx-4 lg:mx-0">
              <div className="relative flex items-center">
                <a className="mr-3 flex-none w-[2.0625rem] overflow-hidden md:w-auto" href="/">
                  <span className="sr-only">Kanban Board</span>
                  <h1 className="text-2xl font-bold">Atomation</h1>
                </a>
                <div className="relative hidden lg:flex items-center ml-auto">
                  <nav className="text-sm leading-6 font-semibold text-base-content">
                    <ul className="flex space-x-8">
                      <li>
                        <a className="hover:text-primary" href="#boards">Boards</a>
                      </li>
                      <li>
                        <a className="hover:text-primary" href="#teams">Teams</a>
                      </li>
                      <li>
                        <button className="hover:text-primary flex items-center space-x-1" onClick={() => setIsSettingsOpen(true)}>
                          <Settings size={16} />
                          <span>Settings</span>
                        </button>
                      </li>
                      <li>
                        <button className="hover:text-primary flex items-center space-x-1" onClick={() => setIsTeamModalOpen(true)}>
                          <Users size={16} />
                          <span>{auth.role === 'owner' ? 'Team Stats' : 'Your Stats'}</span>
                        </button>
                      </li>
                    </ul>
                  </nav>
                  <div className="flex items-center border-l border-base-200 ml-6 pl-6">
                    <button
                      className="ml-6 block text-base-content hover:text-primary"
                      onClick={toggleTheme}
                    >
                      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                    <div className="ml-4 flex items-center">
                      <span className="text-sm font-medium text-base-content mr-2">{auth.name}</span>
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content">
                        {auth.name?.charAt(0)}
                      </div>
                    </div>
                    <button
                      className="ml-4 btn btn-ghost btn-sm"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} />
                      <span className="ml-1">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="p-8 overflow-y-auto h-[calc(100vh-64px)]">
          <KanbanBoard />
          <GanttChartContainer theme={theme} />
        </main>
      </div>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <TeamModal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} />
    </div>
  );
}

