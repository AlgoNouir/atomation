import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { addTask } from '@/store/slices/project';
import { X } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneId: string;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, milestoneId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector((state: RootState) => state.users.users);
  const tags = useSelector((state: RootState) => state.tags.tags);

  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleCreate = () => {
    if (taskName.trim()) {
      const newTask = {
        id: Date.now().toString(),
        title: taskName.trim(),
        description,
        assignee: assignee || null,
        tags: selectedTags,
        startDate,
        dueDate,
        deadline,
        status: 'To Do',
        checklist: [],
        comments: [],
      };
      dispatch(addTask({ milestoneId, task: newTask }));
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center p-4 border-b border-base-300">
          <h2 className="text-2xl font-bold">Create New Task</h2>
          <button className="btn btn-sm btn-circle" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="taskName" className="block text-sm font-medium text-base-content">
              Task Name
            </label>
            <input
              type="text"
              id="taskName"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="mt-1 block w-full input input-bordered"
              placeholder="Enter task name"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-base-content">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full textarea textarea-bordered"
              placeholder="Enter task description"
              rows={3}
            />
          </div>
          <div>
            <label htmlFor="assignee" className="block text-sm font-medium text-base-content">
              Assignee
            </label>
            <select
              id="assignee"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="mt-1 block w-full select select-bordered"
            >
              <option value="">Unassigned</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-base-content">Tags</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {tags.map(tag => (
                <label key={tag.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTags([...selectedTags, tag.id]);
                      } else {
                        setSelectedTags(selectedTags.filter(id => id !== tag.id));
                      }
                    }}
                    className="checkbox checkbox-sm"
                  />
                  <span>{tag.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-base-content">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full input input-bordered"
              />
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-base-content">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 block w-full input input-bordered"
              />
            </div>
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-base-content">
                Deadline
              </label>
              <input
                type="date"
                id="deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1 block w-full input input-bordered"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end p-4 border-t border-base-300">
          <button className="btn btn-primary" onClick={handleCreate}>
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;

