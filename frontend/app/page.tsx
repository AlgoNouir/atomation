'use client'

import { useState, useEffect } from 'react';
import KanbanBoard from '@/components/KanbanBoard';
import GanttChartContainer from '@/components/GanttChartContainer';
import ProjectList from '@/components/ProjectList';
import SettingsModal from '@/components/SettingsModal';
import TeamModal from '@/components/TeamModal';
import LogModal from '@/components/LogModal';
import { Sun, Moon, Settings, LogOut, Users, Menu } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { logout, logoutUser } from '@/store/slices/authSlice';
import CreateProjectModal from '@/components/CreateProjectModal';
import CreateMilestoneModal from '@/components/CreateMilestoneModal';
import ProjectPermissionsModal from '@/components/ProjectPermissionsModal';
import AddTaskModal from '@/components/AddTaskModal';
import { useRouter } from 'next/navigation';
import { fetchProjects } from '@/store/slices/project';
import { fetchLogs } from '@/store/slices/logSlice';
import { fetchTags } from '@/store/slices/tagSlice';
import { fetchProjectUsers } from '@/store/slices/userSlice';
import { useAppDispatch } from '@/store/hooks';

// New Modals component
const Modals = ({
  isSettingsOpen,
  setIsSettingsOpen,
  isTeamModalOpen,
  setIsTeamModalOpen,
  isLogModalOpen,
  setIsLogModalOpen,
  isCreateProjectModalOpen,
  setIsCreateProjectModalOpen,
  isCreateMilestoneModalOpen,
  setIsCreateMilestoneModalOpen,
  isProjectPermissionsModalOpen,
  setIsProjectPermissionsModalOpen,
  isAddTaskModalOpen,
  setIsAddTaskModalOpen,
  selectedProjectId,
  selectedMilestoneId,
}) => {
  return (
    <>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <TeamModal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} />
      <LogModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} />
      <CreateProjectModal isOpen={isCreateProjectModalOpen} onClose={() => setIsCreateProjectModalOpen(false)} />
      <CreateMilestoneModal
        isOpen={isCreateMilestoneModalOpen}
        onClose={() => setIsCreateMilestoneModalOpen(false)}
        projectId={selectedProjectId || ''}
      />
      <ProjectPermissionsModal
        isOpen={isProjectPermissionsModalOpen}
        onClose={() => setIsProjectPermissionsModalOpen(false)}
        projectId={selectedProjectId || ''}
      />
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        milestoneId={selectedMilestoneId || ''}
        projectId={selectedProjectId || ''}
      />
    </>
  );
};

export default function KanbanPage() {
  const [theme, setTheme] = useState('light');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isCreateMilestoneModalOpen, setIsCreateMilestoneModalOpen] = useState(false);
  const [isProjectPermissionsModalOpen, setIsProjectPermissionsModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);
  const auth = useSelector((state: RootState) => state.auth);
  const router = useRouter()
  const dispatch = useAppDispatch();

  useEffect(() => {
    const main = async () => {

      if (!auth.token)
        router.push("/login")
      else
        // Fetch initial data
        await Promise.all([
          dispatch(fetchProjects()),
          dispatch(fetchLogs('all')),
          dispatch(fetchTags()),
          dispatch(fetchProjectUsers())
        ]);

    }

    main()
  }, [auth])

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
    <div className="drawer lg:drawer-open">
      <input id="project-drawer" type="checkbox" className="drawer-toggle" checked={isSidebarOpen} onChange={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="drawer-content flex flex-col">
        {/* Page content here */}
        <header className="sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-base-200 bg-base-100/75 supports-backdrop-blur:bg-base-100/60">
          <div className="max-w-8xl mx-auto">
            <div className="py-4 border-b border-base-200 lg:px-8 lg:border-0 mx-4 lg:mx-0">
              <div className="relative flex items-center">
                <label htmlFor="project-drawer" className="btn btn-primary drawer-button lg:hidden mr-2">
                  <Menu size={24} />
                </label>
                <a className="mr-3 flex-none w-[2.0625rem] overflow-hidden md:w-auto" href="/">
                  <span className="sr-only">Kanban Board</span>
                  <h1 className="text-2xl font-bold">Atomation</h1>
                </a>
                <div className="relative hidden lg:flex items-center ml-auto">
                  <nav className="text-sm leading-6 font-semibold text-base-content">
                    <ul className="flex space-x-8">
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
                        {auth.name.charAt(0)}
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
        <main className="p-4 md:p-8 overflow-y-auto flex-grow">
          <KanbanBoard />
          <GanttChartContainer theme={theme} />
        </main>
      </div>
      <div className="drawer-side">
        <label htmlFor="project-drawer" className="drawer-overlay"></label>
        <div className="w-80 bg-base-200 h-full">
          <ProjectList
            onShowLogModal={() => setIsLogModalOpen(true)}
            onOpenCreateProjectModal={() => setIsCreateProjectModalOpen(true)}
            onOpenCreateMilestoneModal={(projectId) => {
              setSelectedProjectId(projectId);
              setIsCreateMilestoneModalOpen(true);
            }}
            onOpenProjectPermissionsModal={(projectId) => {
              setSelectedProjectId(projectId);
              setIsProjectPermissionsModalOpen(true);
            }}
            onOpenAddTaskModal={(projectId, milestoneId) => {
              setSelectedProjectId(projectId);
              setSelectedMilestoneId(milestoneId);
              setIsAddTaskModalOpen(true);
            }}
          />
        </div>
      </div>
      <Modals
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        isTeamModalOpen={isTeamModalOpen}
        setIsTeamModalOpen={setIsTeamModalOpen}
        isLogModalOpen={isLogModalOpen}
        setIsLogModalOpen={setIsLogModalOpen}
        isCreateProjectModalOpen={isCreateProjectModalOpen}
        setIsCreateProjectModalOpen={setIsCreateProjectModalOpen}
        isCreateMilestoneModalOpen={isCreateMilestoneModalOpen}
        setIsCreateMilestoneModalOpen={setIsCreateMilestoneModalOpen}
        isProjectPermissionsModalOpen={isProjectPermissionsModalOpen}
        setIsProjectPermissionsModalOpen={setIsProjectPermissionsModalOpen}
        isAddTaskModalOpen={isAddTaskModalOpen}
        setIsAddTaskModalOpen={setIsAddTaskModalOpen}
        selectedProjectId={selectedProjectId}
        selectedMilestoneId={selectedMilestoneId}
      />
    </div>
  );
}

