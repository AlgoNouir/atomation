'use client'

import { useSelector, useDispatch } from 'react-redux';
import GanttChart from './GanttChart';
import { RootState, AppDispatch } from '../store/store';
import { updateTaskThunk } from '@/store/slices/project';
import { Task } from '@/types/gantt';

interface GanttChartContainerProps {
  theme: 'light' | 'dark';
}

const GanttChartContainer: React.FC<GanttChartContainerProps> = ({ theme }) => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedMilestone = useSelector((state: RootState) => state.projects.selectedMilestone);
  const tasks = useSelector((state: RootState) => {
    const milestone = state.projects.projects
      .flatMap(p => p.milestones)
      .find(m => m?.id === selectedMilestone);
    return milestone ? milestone.tasks : [];
  });

  const handleTaskUpdate = (updatedTask: Task) => {
    if (selectedMilestone) {
      dispatch(updateTaskThunk({
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
    <div className={`mt-8 p-6 rounded-lg shadow-lg bg-base-100`}>
      <h2 className="text-2xl font-bold mb-6">Project Timeline</h2>
      <GanttChart onTaskUpdate={handleTaskUpdate} theme={theme} tasks={tasks} />
    </div>
  );
};

export default GanttChartContainer;

