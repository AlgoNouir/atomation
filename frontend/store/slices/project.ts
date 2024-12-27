import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChecklistItem {
    id: string;
    text: string;
    isCompleted: boolean;
}

interface Comment {
    id: string;
    author: string;
    text: string;
    timestamp: string;
}

interface Dependency {
    from: string;
    to: string;
    type: 'FS' | 'FF' | 'SS' | 'SF';
}

interface Task {
    id: string;
    title: string;
    description: string;
    labels: string[];
    startDate: string;
    dueDate: string;
    checklist: ChecklistItem[];
    assignees: string[];
    attachments: string[];
    status: 'To Do' | 'In Progress' | 'Under Review' | 'Done';
    comments: Comment[];
    dependencies: Dependency[];
}

interface Milestone {
    id: string;
    name: string;
    tasks: Task[];
}

interface Project {
    id: string;
    name: string;
    milestones: Milestone[];
}

interface ProjectState {
    projects: Project[];
    selectedMilestone: string | null;
}

const initialState: ProjectState = {
    projects: [
        {
            id: '1',
            name: 'Website Redesign',
            milestones: [
                {
                    id: '1-1',
                    name: 'Planning and Design',
                    tasks: [
                        {
                            id: 'task-1',
                            title: 'Requirement Gathering',
                            description: 'Collect and document project requirements',
                            labels: ['planning'],
                            startDate: '2024-01-01',
                            dueDate: '2024-01-03',
                            checklist: [],
                            assignees: ['Project Manager'],
                            attachments: [],
                            status: 'To Do',
                            comments: [],
                            dependencies: [],
                        },
                        {
                            id: 'task-2',
                            title: 'Design UI Mockups',
                            description: 'Create visual designs for the new website',
                            labels: ['design'],
                            startDate: '2024-01-04',
                            dueDate: '2024-01-08',
                            checklist: [],
                            assignees: ['UX Designer'],
                            attachments: [],
                            status: 'To Do',
                            comments: [],
                            dependencies: [{ from: 'task-1', to: 'task-2', type: 'FS' }],
                        },
                    ]
                },
                {
                    id: '1-2',
                    name: 'Development and Testing',
                    tasks: [
                        {
                            id: 'task-3',
                            title: 'Develop Core Features',
                            description: 'Implement main functionality of the website',
                            labels: ['development'],
                            startDate: '2024-01-09',
                            dueDate: '2024-01-20',
                            checklist: [],
                            assignees: ['Development Team'],
                            attachments: [],
                            status: 'To Do',
                            comments: [],
                            dependencies: [{ from: 'task-2', to: 'task-3', type: 'FS' }],
                        },
                        {
                            id: 'task-4',
                            title: 'Testing and QA',
                            description: 'Perform thorough testing of the implemented features',
                            labels: ['testing', 'qa'],
                            startDate: '2024-01-21',
                            dueDate: '2024-01-25',
                            checklist: [],
                            assignees: ['QA Team'],
                            attachments: [],
                            status: 'To Do',
                            comments: [],
                            dependencies: [{ from: 'task-3', to: 'task-4', type: 'FS' }],
                        },
                    ]
                },
            ]
        },
    ],
    selectedMilestone: '1-1',
};

const projectSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        addProject: (state, action: PayloadAction<{ name: string }>) => {
            const newProject: Project = {
                id: Date.now().toString(),
                name: action.payload.name,
                milestones: [],
            };
            state.projects.push(newProject);
        },
        addMilestone: (state, action: PayloadAction<{ projectId: string; name: string }>) => {
            const project = state.projects.find(p => p.id === action.payload.projectId);
            if (project) {
                const newMilestone: Milestone = {
                    id: `${project.id}-${project.milestones.length + 1}`,
                    name: action.payload.name,
                    tasks: [],
                };
                project.milestones.push(newMilestone);
            }
        },
        setSelectedMilestone: (state, action: PayloadAction<string | null>) => {
            state.selectedMilestone = action.payload;
        },
        updateTask: (state, action: PayloadAction<{ milestoneId: string; taskId: string; updates: Partial<Task> }>) => {
            const project = state.projects.find(project => project.milestones.some(milestone => milestone.id === action.payload.milestoneId));
            if (project) {
                const milestone = project.milestones.find(milestone => milestone.id === action.payload.milestoneId);
                if (milestone) {
                    const taskIndex = milestone.tasks.findIndex(task => task.id === action.payload.taskId);
                    if (taskIndex !== -1) {
                        milestone.tasks[taskIndex] = { ...milestone.tasks[taskIndex], ...action.payload.updates };

                        // Update the task's status if it's changed
                        if (action.payload.updates.status) {
                            milestone.tasks[taskIndex].status = action.payload.updates.status;
                        }
                    }
                }
            }
        },
    },
});

export const { addProject, addMilestone, setSelectedMilestone, updateTask } = projectSlice.actions;
export default projectSlice.reducer;

