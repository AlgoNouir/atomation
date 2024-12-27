import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { ClockIcon } from 'lucide-react';

interface LogViewerProps {
  onShowMore: () => void;
}

const LogViewer: React.FC<LogViewerProps> = ({ onShowMore }) => {
  const logs = useSelector((state: RootState) => state.log.entries);

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
                <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LogViewer;

