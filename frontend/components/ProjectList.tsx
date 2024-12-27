import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FolderIcon, ChevronDownIcon, ChevronRightIcon, CheckCircle2, PlusIcon, CircleDot, Circle, CheckCircle } from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { setSelectedMilestone } from '@/store/slices/project';
import { setTasks } from '@/store/slices/kanban';
import LogViewer from './LogViewer';
import LogModal from './LogModal';
import CreateProjectModal from './CreateProjectModal';
import CreateMilestoneModal from './CreateMilestoneModal';
import AddTaskModal from './AddTaskModal';
import { UserRole } from '@/store/slices/accountSlice';
import ProjectPermissionsModal from './ProjectPermissionsModal';

const ProjectList: React.FC = () => {
  const projects = useSelector((state: RootState) => {
    if (state.account.role === 'owner' || state.account.role === 'admin') {
      return state.projects.projects;
    }
    return state.projects.projects.filter(project =>
      state.account.permittedProjects.includes(project.id)
    );
  });
  const selectedMilestone = useSelector((state: RootState) => state.projects.selectedMilestone);
  const userRole = useSelector((state: RootState) => state.account.role);
  const account = useSelector((state: RootState) => state.account);
  const dispatch = useDispatch<AppDispatch>();

  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [isCreateMilestoneModalOpen, setIsCreateMilestoneModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedProjectForPermissions, setSelectedProjectForPermissions] = useState<string | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedMilestoneForTask, setSelectedMilestoneForTask] = useState<string | null>(null);
  const [selectedProjectForTask, setSelectedProjectForTask] = useState<string | null>(null);


  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const handleMilestoneClick = (milestoneId: string) => {
    dispatch(setSelectedMilestone(milestoneId));
    const milestone = projects.flatMap(p => p.milestones).find(m => m.id === milestoneId);
    if (milestone) {
      dispatch(setTasks(milestone.tasks));
    }
  };

  const handleCreateMilestone = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsCreateMilestoneModalOpen(true);
  };

  const handleManagePermissions = (projectId: string) => {
    setSelectedProjectForPermissions(projectId);
    setIsPermissionsModalOpen(true);
  };

  const handleAddTask = (projectId: string, milestoneId: string) => {
    setSelectedMilestoneForTask(milestoneId);
    setSelectedProjectForTask(projectId);
    setIsAddTaskModalOpen(true);
  };

  const calculateTaskStats = (tasks) => {
    const stats = {
      'To Do': 0,
      'In Progress': 0,
      'Debt': 0,
      'Done': 0
    };
    tasks.forEach(task => {
      stats[task.status]++;
    });
    return stats;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-6">Projects</h2>
        <div className="space-y-4 overflow-y-auto">
          {projects.map((project) => (
            <div key={project.id} className="bg-base-100 rounded-lg shadow-md overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-base-300 transition-colors duration-200"
                onClick={() => toggleProjectExpansion(project.id)}
              >
                <div className="flex items-center space-x-3">
                  <FolderIcon size={20} className="text-primary" />
                  <span className="font-medium text-lg">{project.name}</span>
                </div>
                {expandedProjects.has(project.id) ? (
                  <ChevronDownIcon size={20} className="text-gray-500" />
                ) : (
                  <ChevronRightIcon size={20} className="text-gray-500" />
                )}
              </div>
              {expandedProjects.has(project.id) && (
                <div className="px-4 pb-4">
                  <ul className="space-y-2">
                    {project.milestones.map((milestone) => (
                      <li
                        key={milestone.id}
                        className={`flex flex-col p-2 rounded-md cursor-pointer transition-colors duration-200 ${selectedMilestone === milestone.id ? 'bg-primary text-primary-content' : 'hover:bg-base-200'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className="flex items-center space-x-2"
                            onClick={() => handleMilestoneClick(milestone.id)}
                          >
                            <CheckCircle2 size={16} className={selectedMilestone === milestone.id ? 'text-primary-content' : 'text-primary'} />
                            <span>{milestone.name}</span>
                          </div>
                          {(userRole === 'admin' || userRole === 'owner' || project.permissions.find(p => p.userId === account.id)?.role === 'editor') && (
                            <button
                              className="btn btn-xs btn-ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddTask(project.id, milestone.id);
                              }}
                            >
                              <PlusIcon size={14} />
                              Add Task
                            </button>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-2 text-xs">
                          {Object.entries(calculateTaskStats(milestone.tasks)).map(([status, count]) => (
                            <div key={status} className="flex items-center space-x-1">
                              {status === 'To Do' && <Circle size={12} />}
                              {status === 'In Progress' && <CircleDot size={12} />}
                              {status === 'Debt' && <Circle size={12} className="text-error" />}
                              {status === 'Done' && <CheckCircle size={12} />}
                              <span>{count}</span>
                            </div>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                  {(userRole === 'admin' || userRole === 'owner') && (
                    <button
                      className="mt-2 flex items-center space-x-2 text-primary hover:text-primary-focus transition-colors duration-200"
                      onClick={() => handleCreateMilestone(project.id)}
                    >
                      <PlusIcon size={16} />
                      <span>Add Milestone</span>
                    </button>
                  )}
                  {userRole === 'owner' && (
                    <button
                      className="mt-2 btn btn-sm btn-outline"
                      onClick={() => handleManagePermissions(project.id)}
                    >
                      Manage Permissions
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-auto p-4">
        <LogViewer onShowMore={() => setIsLogModalOpen(true)} />
      </div>
      <LogModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} />
      {userRole === 'owner' && (
        <button
          className="mt-4 btn btn-primary w-full"
          onClick={() => setIsCreateProjectModalOpen(true)}
        >
          Create New Project
        </button>
      )}
      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
      />
      <CreateMilestoneModal
        isOpen={isCreateMilestoneModalOpen}
        onClose={() => setIsCreateMilestoneModalOpen(false)}
        projectId={selectedProjectId || ''}
      />
      <ProjectPermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
        projectId={selectedProjectForPermissions || ''}
      />
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        milestoneId={selectedMilestoneForTask || ''}
        projectId={selectedProjectForTask || ''}
      />
    </div>
  );
};

export default ProjectList;

