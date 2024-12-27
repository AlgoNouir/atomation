import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { ClockIcon, XIcon } from 'lucide-react';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogModal: React.FC<LogModalProps> = ({ isOpen, onClose }) => {
  const logs = useSelector((state: RootState) => state.log.entries);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Activity Log</h2>
          <button className="btn btn-sm btn-circle" onClick={onClose}>
            <XIcon size={20} />
          </button>
        </div>
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start space-x-3 bg-base-200 p-3 rounded-lg">
              <ClockIcon size={16} className="text-primary mt-1 flex-shrink-0" />
              <div>
                <p>{log.message}</p>
                <p className="text-sm text-gray-500 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogModal;

