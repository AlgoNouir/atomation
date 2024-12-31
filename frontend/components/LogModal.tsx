import React, { useMemo } from 'react';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '../store/store';
import { ClockIcon, XIcon, ActivityIcon, CalendarIcon, UserIcon } from 'lucide-react';
import { selectPermittedLogs } from '@/store/slices/logSlice';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  person: string;
}

interface GroupedLogs {
  [date: string]: LogEntry[];
}

const LogModal: React.FC<LogModalProps> = ({ isOpen, onClose }) => {
  const logs = useAppSelector(selectPermittedLogs);

  const groupedLogs = useMemo(() => {
    return logs.reduce((groups: GroupedLogs, log) => {
      const date = new Date(log.timestamp).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(log);
      return groups;
    }, {});
  }, [logs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[999] flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-base-300">
          <h2 className="text-2xl font-bold">Activity Log</h2>
          <button className="btn btn-sm btn-circle" onClick={onClose}>
            <XIcon size={20} />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-4">
          <div className="space-y-8">
            {Object.entries(groupedLogs)
              .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
              .map(([date, logsForDate]) => (
                <div key={date} className="space-y-4">
                  <div className="flex items-center space-x-2 sticky top-0 bg-base-100 py-2 z-10">
                    <CalendarIcon size={20} className="text-primary" />
                    <h3 className="text-lg font-semibold">{date}</h3>
                  </div>
                  <div className="space-y-4 pl-6 border-l-2 border-primary">
                    {logsForDate
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((log, index) => (
                        <div key={log.id} className="relative">
                          <div className="absolute -left-[29px] mt-1.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <ActivityIcon size={12} className="text-primary-content" />
                          </div>
                          <div className="bg-base-200 p-3 rounded-lg ml-4">
                            <p>{log.message}</p>
                            <div className="flex items-center justify-between text-sm text-base-content/70 mt-1">
                              <div className="flex items-center">
                                <ClockIcon size={12} className="mr-1" />
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </div>
                              <div className="flex items-center">
                                <UserIcon size={12} className="mr-1" />
                                {log.person}
                              </div>
                            </div>
                          </div>
                          {index < logsForDate.length - 1 && (
                            <div className="divider my-2"></div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogModal;

