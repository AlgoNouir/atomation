export interface Dependency {
    from: string;
    to: string;
    type: 'FS' | 'SS' | 'FF' | 'SF';
}

export interface Task {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    assignedTo: string;
    dependencies: Dependency[];
    isMilestone: boolean;
    isComplete: boolean;
    isCriticalPath: boolean;
}

export interface GanttData {
    tasks: Task[];
    startDate: Date;
    endDate: Date;
}

