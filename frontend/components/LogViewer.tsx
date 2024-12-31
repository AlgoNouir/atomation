import React from 'react';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '../store/store';
import { ClockIcon, UserIcon } from 'lucide-react';
import { selectPermittedLogs } from '@/store/slices/logSlice';

interface LogViewerProps {
  onShowMore: () => void;
}

const LogViewer: React.FC<LogViewerProps> = ({ onShowMore }) => {
  const logs = useAppSelector(selectPermittedLogs);

  return (
    <div className="bg-base-100 rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Recent Activity</h2>
        <button
          className="btn btn-xs btn-outline"
          onClick={onShowMore}
        >
          Show More
        </button>
      </div>
      {logs.length === 0 ? (
        <p className="text-center text-gray-500 text-sm">No activity logs yet.</p>
      ) : (
        <ul className="space-y-2">
          {logs.slice(0, 3).map((log) => (
            <li key={log.id} className="flex items-start space-x-2 text-sm">
              <ClockIcon size={14} className="text-primary mt-1 flex-shrink-0" />
              <div>
                <p>{log.message}</p>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                  <span className="flex items-center">
                    <UserIcon size={12} className="mr-1" />
                    {log.person}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LogViewer;

