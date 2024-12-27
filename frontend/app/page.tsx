'use client'

import { useState, useEffect } from 'react';
import KanbanBoard from '@/components/KanbanBoard';
import ProjectList from '@/components/ProjectList';
import { Sun, Moon } from 'lucide-react';

export default function KanbanPage() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen bg-base-100">
      <header className="sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-base-200 bg-base-100/75 supports-backdrop-blur:bg-base-100/60">
        <div className="max-w-8xl mx-auto">
          <div className="py-4 border-b border-base-200 lg:px-8 lg:border-0 mx-4 lg:mx-0">
            <div className="relative flex items-center">
              <a className="mr-3 flex-none w-[2.0625rem] overflow-hidden md:w-auto" href="/">
                <span className="sr-only">Kanban Board</span>
                <h1 className="text-2xl font-bold">Kanban</h1>
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
                      <a className="hover:text-primary" href="#settings">Settings</a>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-8">
        <div className="flex">
          <div className="flex-grow overflow-x-auto">
            <KanbanBoard />
          </div>
          <div className="ml-4 flex-shrink-0">
            <ProjectList />
          </div>
        </div>
      </main>
    </div>
  );
}

