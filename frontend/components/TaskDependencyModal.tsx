import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { updateTaskThunk } from '@/store/slices/project';
import { X } from 'lucide-react';

interface TaskDependencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  milestoneId: string;
}

const TaskDependencyModal: React.FC<TaskDependencyModalProps> = ({ isOpen, onClose, taskId, milestoneId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const tasks = useSelector((state: RootState) =>
    state.projects.projects
      .flatMap(p => p.milestones)
      .find(m => m.id === milestoneId)?.tasks || []
  );
  const currentTask = tasks.find(t => t.id === taskId);

  const [selectedTask, setSelectedTask] = useState('');
  const [dependencyType, setDependencyType] = useState<'FS' | 'FF' | 'SS' | 'SF'>('FS');

  if (!isOpen || !currentTask) return null;

  const handleAddDependency = () => {
    if (selectedTask && dependencyType) {
      const newDependency = {
        from: taskId,
        to: selectedTask,
        type: dependencyType
      };
      const updatedDependencies = [...currentTask.dependencies, newDependency];
      dispatch(updateTaskThunk({
        milestoneId,
        taskId,
        updates: { dependencies: updatedDependencies }
      }));
      setSelectedTask('');
    }
  };

  const handleRemoveDependency = (dependencyId: string) => {
    const updatedDependencies = currentTask.dependencies.filter(d => d.to !== dependencyId);
    dispatch(updateTaskThunk({
      milestoneId,
      taskId,
      updates: { dependencies: updatedDependencies }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[999] flex items-center justify-center p-4">
      <div className="modal-box w-11/12 max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Manage Task Dependencies</h2>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Current Task: {currentTask.title}</h3>
          <div className="flex space-x-2">
            <select
              className="select select-bordered flex-grow"
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
            >
              <option value="">Select a task</option>
              {tasks.filter(t => t.id !== taskId).map(task => (
                <option key={task.id} value={task.id}>{task.title}</option>
              ))}
            </select>
            <select
              className="select select-bordered"
              value={dependencyType}
              onChange={(e) => setDependencyType(e.target.value as 'FS' | 'FF' | 'SS' | 'SF')}
            >
              <option value="FS">Finish to Start (FS)</option>
              <option value="FF">Finish to Finish (FF)</option>
              <option value="SS">Start to Start (SS)</option>
              <option value="SF">Start to Finish (SF)</option>
            </select>
            <button className="btn btn-primary" onClick={handleAddDependency}>Add</button>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Existing Dependencies</h3>
          <ul className="space-y-2">
            {(currentTask.dependencies || []).map(dep => {
              const dependentTask = tasks.find(t => t.id === dep.to);
              return (
                <li key={dep.to} className="flex justify-between items-center">
                  <span>{dependentTask?.title} ({dep.type})</span>
                  <button
                    className="btn btn-sm btn-error"
                    onClick={() => handleRemoveDependency(dep.to)}
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TaskDependencyModal;

