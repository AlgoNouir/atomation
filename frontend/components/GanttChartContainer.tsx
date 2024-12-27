'use client'

import { useSelector, useDispatch } from 'react-redux';
import GanttChart from './GanttChart';
import { RootState, AppDispatch } from '../store/store';
import { updateTask } from '@/store/slices/project';
import { Task } from '@/types/gantt';

interface GanttChartContainerProps {
  theme: 'light' | 'dark';
}

const GanttChartContainer: React.FC<GanttChartContainerProps> = ({ theme }) => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedMilestone = useSelector((state: RootState) => state.projects.selectedMilestone);

  const handleTaskUpdate = (updatedTask: Task) => {
    if (selectedMilestone) {
      dispatch(updateTask({
        milestoneId: selectedMilestone,
        taskId: updatedTask.id,
        updates: {
          startDate: updatedTask.startDate.toISOString(),
          dueDate: updatedTask.endDate.toISOString(),
        }
      }));
    }
  };

  return (
    <div className={`mt-8 p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'}`}>
      <h2 className="text-2xl font-bold mb-6">Project Timeline</h2>
      <GanttChart onTaskUpdate={handleTaskUpdate} theme={theme} />
    </div>
  );
};

export default GanttChartContainer;

