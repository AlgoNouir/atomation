import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { PlusIcon, FolderIcon, ChevronDownIcon, ChevronRightIcon, CheckCircle2 } from 'lucide-react';
import { RootState, AppDispatch } from '../store/store';
import { addProject, addMilestone, setSelectedMilestone } from '@/store/slices/project';
import { setTasks } from '@/store/slices/kanban';

const ProjectList: React.FC = () => {
  const projects = useSelector((state: RootState) => state.projects.projects);
  const selectedMilestone = useSelector((state: RootState) => state.projects.selectedMilestone);
  const dispatch = useDispatch<AppDispatch>();

  const [newProjectName, setNewProjectName] = useState('');
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [addingMilestoneTo, setAddingMilestoneTo] = useState<string | null>(null);

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      dispatch(addProject({ name: newProjectName.trim() }));
      setNewProjectName('');
    }
  };

  const handleAddMilestone = (projectId: string) => {
    if (newMilestoneName.trim()) {
      dispatch(addMilestone({ projectId, name: newMilestoneName.trim() }));
      setNewMilestoneName('');
      setAddingMilestoneTo(null);
    }
  };

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  const handleMilestoneClick = (milestoneId: string) => {
    dispatch(setSelectedMilestone(milestoneId));
    const milestone = projects.flatMap(p => p.milestones).find(m => m.id === milestoneId);
    if (milestone) {
      dispatch(setTasks(milestone.tasks));
    }
  };

  return (
    <div className="bg-base-200 rounded-lg p-4 w-64">
      <h2 className="text-xl font-bold mb-4">Projects</h2>
      <ul className="space-y-2 mb-4">
        {projects.map((project) => (
          <li key={project.id} className="rounded-lg overflow-hidden">
            <div
              className="flex items-center justify-between p-2 hover:bg-base-300 cursor-pointer rounded-md transition-colors duration-200"
              onClick={() => toggleProjectExpansion(project.id)}
            >
              <div className="flex items-center space-x-2">
                <FolderIcon size={20} className="text-primary" />
                <span className="font-medium">{project.name}</span>
              </div>
              {expandedProject === project.id ? (
                <ChevronDownIcon size={20} className="text-gray-500" />
              ) : (
                <ChevronRightIcon size={20} className="text-gray-500" />
              )}
            </div>
            {expandedProject === project.id && (
              <ul className="mt-1 space-y-1 bg-gray-100 rounded-md p-2">
                {project.milestones.map((milestone) => (
                  <li
                    key={milestone.id}
                    className={`flex items-center space-x-2 text-sm py-1 px-2 hover:bg-gray-200 rounded transition-colors duration-200 cursor-pointer ${selectedMilestone === milestone.id ? 'bg-gray-200' : ''}`}
                    onClick={() => handleMilestoneClick(milestone.id)}
                  >
                    <CheckCircle2 size={16} className="text-primary" />
                    <span>{milestone.name}</span>
                  </li>
                ))}
                {addingMilestoneTo === project.id ? (
                  <li className="flex items-center space-x-2 py-1">
                    <input
                      type="text"
                      placeholder="New milestone"
                      className="input input-bordered input-xs flex-grow"
                      value={newMilestoneName}
                      onChange={(e) => setNewMilestoneName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddMilestone(project.id)}
                    />
                    <button
                      className="btn btn-primary btn-xs"
                      onClick={() => handleAddMilestone(project.id)}
                    >
                      Add
                    </button>
                  </li>
                ) : (
                  <li
                    className="flex items-center space-x-2 text-sm py-1 px-2 hover:bg-gray-200 rounded cursor-pointer transition-colors duration-200"
                    onClick={() => setAddingMilestoneTo(project.id)}
                  >
                    <PlusIcon size={16} className="text-primary" />
                    <span>Add Milestone</span>
                  </li>
                )}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="New project name"
          className="input input-bordered input-sm flex-grow"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddProject()}
        />
        <button className="btn btn-primary btn-sm" onClick={handleAddProject}>
          <PlusIcon size={20} />
        </button>
      </div>
    </div>
  );
};

export default ProjectList;

