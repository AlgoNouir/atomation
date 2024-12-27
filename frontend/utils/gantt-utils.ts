import { Task, Dependency } from '@/types/gantt';

export function calculateTaskDuration(task: Task): number {
  return Math.ceil((new Date(task.dueDate).getTime() - new Date(task.startDate).getTime()) / (1000 * 60 * 60 * 24));
}

export function isTaskDependent(task: Task, dependentOn: Task): boolean {
  return task.dependencies.some(dep => dep.from === dependentOn.id);
}

export function calculateCriticalPath(tasks: Task[]): string[] {
  const criticalPathTasks: string[] = [];

  // Sort tasks by dependencies
  const sortedTasks = [...tasks].sort((a, b) => {
    if (isTaskDependent(b, a)) return -1;
    if (isTaskDependent(a, b)) return 1;
    return 0;
  });

  // Calculate early start and early finish
  const earlyDates = new Map<string, { start: number; finish: number }>();
  sortedTasks.forEach(task => {
    const dependencies = task.dependencies;
    const earliestStart = dependencies.reduce((max, dep) => {
      const dependencyTask = tasks.find(t => t.id === dep.from);
      if (!dependencyTask) return max;
      const depFinish = earlyDates.get(dep.from)?.finish || 0;
      return Math.max(max, depFinish);
    }, new Date(task.startDate).getTime());

    earlyDates.set(task.id, {
      start: earliestStart,
      finish: earliestStart + calculateTaskDuration(task) * 24 * 60 * 60 * 1000
    });
  });

  // Calculate late start and late finish
  const lateDates = new Map<string, { start: number; finish: number }>();
  [...sortedTasks].reverse().forEach(task => {
    const dependentTasks = tasks.filter(t => t.dependencies.some(dep => dep.from === task.id));
    const latestFinish = dependentTasks.length === 0
      ? new Date(task.dueDate).getTime()
      : Math.min(...dependentTasks.map(t => lateDates.get(t.id)?.start || Infinity));

    lateDates.set(task.id, {
      finish: latestFinish,
      start: latestFinish - calculateTaskDuration(task) * 24 * 60 * 60 * 1000
    });

    // If early dates equal late dates, task is on critical path
    const early = earlyDates.get(task.id);
    const late = lateDates.get(task.id);
    if (early && late && early.start === late.start && early.finish === late.finish) {
      criticalPathTasks.push(task.id);
    }
  });

  return criticalPathTasks;
}

