import React, { useState } from 'react';
import { AppDispatch } from '../store/store';
import { createMilestone } from '@/store/slices/project';
import { X } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';

interface CreateMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

const CreateMilestoneModal: React.FC<CreateMilestoneModalProps> = ({ isOpen, onClose, projectId }) => {
  const dispatch = useAppDispatch();
  const [milestoneName, setMilestoneName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (milestoneName.trim()) {
      setIsLoading(true);
      setError(null);
      try {
        await dispatch(createMilestone({ projectId, name: milestoneName.trim() })).unwrap();
        setMilestoneName('');
        onClose();
      } catch (err) {
        setError('Failed to create milestone. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[999] flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-base-300">
          <h2 className="text-2xl font-bold">Create New Milestone</h2>
          <button className="btn btn-sm btn-circle" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="milestoneName" className="block text-sm font-medium text-base-content">
              Milestone Name
            </label>
            <input
              type="text"
              id="milestoneName"
              value={milestoneName}
              onChange={(e) => setMilestoneName(e.target.value)}
              className="mt-1 block w-full input input-bordered"
              placeholder="Enter milestone name"
            />
          </div>
          {error && <p className="text-error text-sm">{error}</p>}
        </div>
        <div className="flex justify-end p-4 border-t border-base-300">
          <button
            className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
            onClick={handleCreate}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Milestone'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateMilestoneModal;

