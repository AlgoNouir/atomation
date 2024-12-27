'use client'

import { useSelector, useDispatch } from 'react-redux';
import GanttChart from './GanttChart';
import { RootState, AppDispatch } from '../store/store';
import { updateTask } from '@/store/slices/project';
import { Task } from '@/types/gantt';

const GanttChartContainer: React.FC = () => {
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
    <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Project Timeline</h2>
      <GanttChart onTaskUpdate={handleTaskUpdate} />
    </div>
  );
};

export default GanttChartContainer;

