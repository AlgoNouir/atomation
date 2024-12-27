export interface Dependency {
    from: string;
    to: string;
    type: 'FS' | 'SS' | 'FF' | 'SF';
}

export interface Task {
    id: string;
    title: string;
    startDate: string;
    dueDate: string;
    deadline: string;
    assignee: string | null;
    dependencies: Dependency[];
    status: string;
    isMilestone: boolean;
    isComplete: boolean;
    isCriticalPath: boolean;
}

export interface GanttData {
    tasks: Task[];
    startDate: Date;
    endDate: Date;
}

