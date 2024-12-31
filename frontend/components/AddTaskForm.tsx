import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { createTask } from '@/store/slices/project';
import { fetchTags } from '@/store/slices/tagSlice';
import { PlusIcon, XIcon } from 'lucide-react';

interface AddTaskFormProps {
  milestoneId: string;
  onClose: () => void;
}

interface ChecklistItem {
  text: string;
  isCompleted: boolean;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ milestoneId, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector((state: RootState) => state.users.users);
  const tags = useSelector((state: RootState) => state.tags.tags);
  const tagStatus = useSelector((state: RootState) => state.tags.status);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('To Do');
  const [assignee, setAssignee] = useState('');
  const [start_date, setStart_date] = useState<string | null>(null);
  const [due_date, setDue_date] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tagStatus === 'idle') {
      dispatch(fetchTags());
    }
  }, [dispatch, tagStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (title.trim()) {
      try {
        await dispatch(createTask({
          milestoneId,
          task: {
            title,
            description,
            status,
            assignee: assignee || null,
            start_date,
            due_date,
            deadline,
            tags: selectedTags,
            checklist,
            comments: [],
            dependencies: [],
            attachments: [],
          }
        })).unwrap();
        onClose();
      } catch (err) {
        setError('Failed to create task. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setError("Please fill in the title field");
      setIsSubmitting(false);
    }
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklist([...checklist, { text: newChecklistItem.trim(), isCompleted: false }]);
      setNewChecklistItem('');
    }
  };

  const removeChecklistItem = (index: number) => {
    setChecklist(checklist.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-control">
        <label htmlFor="title" className="label">
          <span className="label-text">Title</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input input-bordered w-full"
          required
        />
      </div>
      <div className="form-control">
        <label htmlFor="description" className="label">
          <span className="label-text">Description</span>
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="textarea textarea-bordered h-24"
        />
      </div>
      <div className="form-control">
        <label htmlFor="status" className="label">
          <span className="label-text">Status</span>
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="select select-bordered w-full"
        >
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
      </div>
      <div className="form-control">
        <label htmlFor="assignee" className="label">
          <span className="label-text">Assignee</span>
        </label>
        <select
          id="assignee"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          className="select select-bordered w-full"
        >
          <option value="">Unassigned</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
      </div>
      <div className="form-control">
        <label htmlFor="start_date" className="label">
          <span className="label-text">Start Date and Time (optional)</span>
        </label>
        <input
          type="datetime-local"
          id="start_date"
          value={start_date || ''}
          onChange={(e) => setStart_date(e.target.value || null)}
          className="input input-bordered w-full"
        />
      </div>
      <div className="form-control">
        <label htmlFor="due_date" className="label">
          <span className="label-text">Due Date and Time (optional)</span>
        </label>
        <input
          type="datetime-local"
          id="due_date"
          value={due_date || ''}
          onChange={(e) => setDue_date(e.target.value || null)}
          className="input input-bordered w-full"
        />
      </div>
      <div className="form-control">
        <label htmlFor="deadline" className="label">
          <span className="label-text">Deadline Date and Time (optional)</span>
        </label>
        <input
          type="datetime-local"
          id="deadline"
          value={deadline || ''}
          onChange={(e) => setDeadline(e.target.value || null)}
          className="input input-bordered w-full"
        />
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Tags</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <label key={tag.id} className="cursor-pointer label">
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
              <span className="label-text ml-2">{tag.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Checklist</span>
        </label>
        <div className="space-y-2">
          {checklist.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={item.text}
                readOnly
                className="input input-bordered flex-grow"
              />
              <button
                type="button"
                onClick={() => removeChecklistItem(index)}
                className="btn btn-ghost btn-square btn-sm"
              >
                <XIcon size={16} />
              </button>
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newChecklistItem}
              onChange={(e) => setNewChecklistItem(e.target.value)}
              className="input input-bordered flex-grow"
              placeholder="New checklist item"
            />
            <button
              type="button"
              onClick={addChecklistItem}
              className="btn btn-primary btn-square btn-sm"
            >
              <PlusIcon size={16} />
            </button>
          </div>
        </div>
      </div>
      {error && (
        <div className="text-error">{error}</div>
      )}
      <div className="modal-action">
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Adding Task...' : 'Add Task'}
        </button>
      </div>
    </form>
  );
};

export default AddTaskForm;

