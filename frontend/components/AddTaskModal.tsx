import React from 'react';
import { X } from 'lucide-react';
import AddTaskForm from './AddTaskForm';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneId: string;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, milestoneId }) => {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-5xl">
        <button className="btn btn-sm btn-circle absolute right-2 top-2" onClick={onClose}>
          <X size={20} />
        </button>
        <h3 className="font-bold text-lg mb-4">Add New Task</h3>
        <AddTaskForm milestoneId={milestoneId} onClose={onClose} />
      </div>
    </div>
  );
};

export default AddTaskModal;

