import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { X, User, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TeamModal: React.FC<TeamModalProps> = ({ isOpen, onClose }) => {
  const users = useSelector((state: RootState) => state.users.users);
  const projects = useSelector((state: RootState) => state.projects.projects);
  const logs = useSelector((state: RootState) => state.log.entries);
  const currentUser = useSelector((state: RootState) => state.account);

  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const getUserStats = (userId: string) => {
    const userProjects = projects.filter(project =>
      project.permissions.some(permission => permission.userId === userId)
    );
    const userTasks = projects.flatMap(project =>
      project.milestones.flatMap(milestone =>
        milestone.tasks.filter(task => task.assignee === userId)
      )
    );
    const userLogs = logs.filter(log => log.person === userId);

    // Calculate work hours (mock data - replace with actual time tracking in a real app)
    const workHours = {
      'Mon': Math.floor(Math.random() * 8) + 1,
      'Tue': Math.floor(Math.random() * 8) + 1,
      'Wed': Math.floor(Math.random() * 8) + 1,
      'Thu': Math.floor(Math.random() * 8) + 1,
      'Fri': Math.floor(Math.random() * 8) + 1,
    };

    const totalHours = Object.values(workHours).reduce((sum, hours) => sum + hours, 0);

    return {
      projectCount: userProjects.length,
      taskCount: userTasks.length,
      completedTaskCount: userTasks.filter(task => task.status === 'Done').length,
      lastActivity: userLogs.length > 0 ? new Date(Math.max(...userLogs.map(log => new Date(log.timestamp).getTime()))) : null,
      workHours,
      totalHours,
    };
  };

  const toggleUserExpansion = (userId: string) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const displayUsers = currentUser.role === 'owner' ? users : users.filter(user => user.id === currentUser.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[999] flex items-center justify-center p-4">
      <div className="modal-box w-11/12 max-w-5xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {currentUser.role === 'owner' ? 'Team Statistics' : 'Your Statistics'}
          </h2>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
          <div className="space-y-4">
            {displayUsers.map(user => {
              const stats = getUserStats(user.id);
              const isExpanded = expandedUsers.has(user.id);
              const chartData = Object.entries(stats.workHours).map(([day, hours]) => ({ day, hours }));

              return (
                <div key={user.id} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="mr-2" size={24} />
                        <h3 className="card-title">{user.name}</h3>
                      </div>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => toggleUserExpansion(user.id)}
                      >
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        {isExpanded ? 'Show Less' : 'Show More'}
                      </button>
                    </div>
                    <p className="text-sm opacity-70">{user.email}</p>

                    {isExpanded && (
                      <>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <div className="flex items-center">
                            <CheckCircle className="mr-2" size={16} />
                            <span>Projects: {stats.projectCount}</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="mr-2" size={16} />
                            <span>Tasks: {stats.taskCount}</span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="mr-2" size={16} />
                            <span>Completed: {stats.completedTaskCount}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-2" size={16} />
                            <span>Last Activity: {stats.lastActivity ? stats.lastActivity.toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>
                        <div className="mt-4">
                          <strong>Total Hours This Week: {stats.totalHours}</strong>
                        </div>
                        <ChartContainer
                          config={{
                            hours: {
                              label: "Hours",
                              color: "bg-primary",
                            },
                          }}
                          className="h-[200px] mt-4"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                              <XAxis dataKey="day" />
                              <YAxis />
                              <Tooltip content={<ChartTooltipContent config={{
                                hours: {
                                  label: "Hours",
                                  color: "bg-primary",
                                },
                              }} />} />
                              <Bar dataKey="hours" fill="hsl(var(--p))" />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamModal;

