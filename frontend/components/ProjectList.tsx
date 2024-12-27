import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FolderIcon, ChevronDownIcon, ChevronRightIcon, CheckCircle2, PlusIcon } from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { addMilestone, setSelectedMilestone } from '@/store/slices/project';
import { setTasks } from '@/store/slices/kanban';
import LogViewer from './LogViewer';
import LogModal from './LogModal';

const ProjectList: React.FC = () => {
  const projects = useSelector((state: RootState) => state.projects.projects);
  const selectedMilestone = useSelector((state: RootState) => state.projects.selectedMilestone);
  const dispatch = useDispatch<AppDispatch>();

  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [addingMilestoneTo, setAddingMilestoneTo] = useState<string | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

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

  const handleAddMilestone = (projectId: string) => {
    if (newMilestoneName.trim()) {
      dispatch(addMilestone({ projectId, name: newMilestoneName.trim() }));
      setNewMilestoneName('');
      setAddingMilestoneTo(null);
    }
  };

  const handleMilestoneClick = (milestoneId: string) => {
    dispatch(setSelectedMilestone(milestoneId));
    const milestone = projects.flatMap(p => p.milestones).find(m => m.id === milestoneId);
    if (milestone) {
      dispatch(setTasks(milestone.tasks));
    }
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
                        className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors duration-200 ${selectedMilestone === milestone.id ? 'bg-primary text-primary-content' : 'hover:bg-base-200'
                          }`}
                        onClick={() => handleMilestoneClick(milestone.id)}
                      >
                        <CheckCircle2 size={16} className={selectedMilestone === milestone.id ? 'text-primary-content' : 'text-primary'} />
                        <span>{milestone.name}</span>
                      </li>
                    ))}
                  </ul>
                  {addingMilestoneTo === project.id ? (
                    <div className="mt-2 flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="New milestone name"
                        className="input input-bordered input-sm flex-grow"
                        value={newMilestoneName}
                        onChange={(e) => setNewMilestoneName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddMilestone(project.id)}
                      />
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAddMilestone(project.id)}
                      >
                        Add
                      </button>
                    </div>
                  ) : (
                    <button
                      className="mt-2 flex items-center space-x-2 text-primary hover:text-primary-focus transition-colors duration-200"
                      onClick={() => setAddingMilestoneTo(project.id)}
                    >
                      <PlusIcon size={16} />
                      <span>Add Milestone</span>
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
    </div>
  );
};

export default ProjectList;

