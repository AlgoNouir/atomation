import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { updateAccount } from '@/store/slices/authSlice';
import { X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);
  const [name, setName] = useState(auth.name);
  const [email, setEmail] = useState(auth.email);

  const handleSave = () => {
    dispatch(updateAccount({ name, email }));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[999] flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-base-300">
          <h2 className="text-2xl font-bold">Account Settings</h2>
          <button className="btn btn-sm btn-circle" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-base-content">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full input input-bordered"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-base-content">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full input input-bordered"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-base-content">
              Role
            </label>
            <p className="mt-1 text-base-content/70 capitalize">{auth.role}</p>
          </div>
        </div>
        <div className="flex justify-end p-4 border-t border-base-300">
          <button className="btn btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

