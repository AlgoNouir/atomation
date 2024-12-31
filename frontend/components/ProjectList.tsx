import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FolderIcon, ChevronDownIcon, ChevronRightIcon, CheckCircle2, PlusIcon, CircleDot, Circle, CheckCircle } from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { setSelectedMilestone, fetchProjects } from '@/store/slices/project';
import { setTasks } from '@/store/slices/kanban';
import LogViewer from './LogViewer';
import CreateProjectModal from './CreateProjectModal';
import CreateMilestoneModal from './CreateMilestoneModal';
import AddTaskModal from './AddTaskModal';
import { UserRole } from '@/store/slices/accountSlice';
import ProjectPermissionsModal from './ProjectPermissionsModal';

interface ProjectListProps {
  onShowLogModal: () => void;
  onOpenCreateProjectModal: () => void;
  onOpenCreateMilestoneModal: (projectId: string) => void;
  onOpenProjectPermissionsModal: (projectId: string) => void;
  onOpenAddTaskModal: (projectId: string, milestoneId: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({
  onShowLogModal,
  onOpenCreateProjectModal,
  onOpenCreateMilestoneModal,
  onOpenProjectPermissionsModal,
  onOpenAddTaskModal
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const projects = useSelector((state: RootState) => state.projects.projects);
  const selectedMilestone = useSelector((state: RootState) => state.projects.selectedMilestone);
  const { role: userRole, id: currentUserId } = useSelector((state: RootState) => state.auth);

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

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

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
    onOpenCreateMilestoneModal(projectId);
  };

  const handleManagePermissions = (projectId: string) => {
    onOpenProjectPermissionsModal(projectId);
  };

  const handleAddTask = (projectId: string, milestoneId: string) => {
    onOpenAddTaskModal(projectId, milestoneId);
  };

  const calculateTaskStats = (tasks: Task[]) => {
    const stats = {
      'To Do': 0,
      'In Progress': 0,
      'Done': 0
    };
    tasks.forEach(task => {
      if (stats.hasOwnProperty(task.status)) {
        stats[task.status]++;
      }
    });
    return stats;
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="p-4 flex-grow">
        <h2 className="text-2xl font-bold mb-6">Projects</h2>
        <div className="space-y-4">
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
                          {(userRole === 'admin' || userRole === 'owner' || project.permissions.find(p => p.userId === currentUserId)?.role === 'editor') && (
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
      <div className="mt-auto p-4 border-t border-base-300">
        <LogViewer onShowMore={onShowLogModal} />
      </div>
      {userRole === 'owner' && (
        <button
          className="mt-4 btn btn-primary w-full"
          onClick={onOpenCreateProjectModal}
        >
          Create New Project
        </button>
      )}
    </div>
  );
};

export default ProjectList;

