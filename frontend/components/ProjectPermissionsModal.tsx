import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { updateProjectPermissions } from '@/store/slices/project';
import { X } from 'lucide-react';

interface ProjectPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

const ProjectPermissionsModal: React.FC<ProjectPermissionsModalProps> = ({ isOpen, onClose, projectId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const project = useSelector((state: RootState) =>
    state.projects.projects.find(p => p.id === projectId)
  );
  const users = useSelector((state: RootState) => state.users.users);

  const [permissions, setPermissions] = useState(project?.permissions || []);

  useEffect(() => {
    if (project) {
      setPermissions(project.permissions);
    }
  }, [project]);

  const handlePermissionChange = (userId: string, role: 'viewer' | 'editor' | 'admin') => {
    const newPermissions = permissions.map(p =>
      p.userId === userId ? { ...p, role } : p
    );
    if (!newPermissions.some(p => p.userId === userId)) {
      newPermissions.push({ userId, role });
    }
    setPermissions(newPermissions);
  };

  const handleSave = () => {
    if (projectId) {
      dispatch(updateProjectPermissions({ projectId, permissions }));
      onClose();
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[999] flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center p-4 border-b border-base-300">
          <h2 className="text-2xl font-bold">Project Permissions: {project.name}</h2>
          <button className="btn btn-sm btn-circle" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {users.map(user => (
            <div key={user.id} className="flex items-center justify-between">
              <span>{user.name}</span>
              <select
                value={permissions.find(p => p.userId === user.id)?.role || 'none'}
                onChange={(e) => handlePermissionChange(user.id, e.target.value as 'viewer' | 'editor' | 'admin')}
                className="select select-bordered"
              >
                <option value="none">No Access</option>
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          ))}
        </div>
        <div className="flex justify-end p-4 border-t border-base-300">
          <button className="btn btn-primary" onClick={handleSave}>
            Save Permissions
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectPermissionsModal;

