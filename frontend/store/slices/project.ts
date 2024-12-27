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
                    name: 'Design Phase',
                    tasks: [
                        {
                            id: 'task-1',
                            title: 'Create wireframes',
                            description: 'Design initial wireframes for the homepage',
                            labels: ['design', 'wireframe'],
                            startDate: '',
                            dueDate: '2023-07-15',
                            checklist: [],
                            assignees: ['John Doe'],
                            attachments: [],
                            status: 'To Do',
                            comments: [],
                        },
                        {
                            id: 'task-2',
                            title: 'Color palette',
                            description: 'Choose a color scheme for the new design',
                            labels: ['design', 'color'],
                            startDate: '',
                            dueDate: '2023-07-20',
                            checklist: [],
                            assignees: ['Jane Smith'],
                            attachments: [],
                            status: 'To Do',
                            comments: [],
                        },
                    ]
                },
                {
                    id: '1-2',
                    name: 'Development',
                    tasks: [
                        {
                            id: 'task-3',
                            title: 'Set up project',
                            description: 'Initialize the project and set up the development environment',
                            labels: ['setup', 'development'],
                            startDate: '',
                            dueDate: '2023-07-25',
                            checklist: [],
                            assignees: ['John Doe'],
                            attachments: [],
                            status: 'To Do',
                            comments: [],
                        },
                        {
                            id: 'task-4',
                            title: 'Implement design',
                            description: 'Convert the approved design into code',
                            labels: ['development', 'implementation'],
                            startDate: '',
                            dueDate: '2023-08-05',
                            checklist: [],
                            assignees: ['Jane Smith'],
                            attachments: [],
                            status: 'To Do',
                            comments: [],
                        },
                    ]
                },
            ]
        },
        {
            id: '2',
            name: 'Mobile App Development',
            milestones: [
                {
                    id: '2-1',
                    name: 'Prototyping',
                    tasks: [
                        {
                            id: 'task-5',
                            title: 'User flow',
                            description: 'Map out the user flow for the main features',
                            labels: ['prototype', 'user flow'],
                            startDate: '',
                            dueDate: '2023-07-22',
                            checklist: [],
                            assignees: ['Peter Jones'],
                            attachments: [],
                            status: 'To Do',
                            comments: [],
                        },
                        {
                            id: 'task-6',
                            title: 'Lo-fi prototype',
                            description: 'Create a low-fidelity prototype for testing',
                            labels: ['prototype', 'design'],
                            startDate: '',
                            dueDate: '2023-07-29',
                            checklist: [],
                            assignees: ['Sarah Williams'],
                            attachments: [],
                            status: 'To Do',
                            comments: [],
                        },
                    ]
                },
                {
                    id: '2-2',
                    name: 'MVP Release',
                    tasks: [
                        {
                            id: 'task-7',
                            title: 'Core features',
                            description: 'Implement the core features of the MVP',
                            labels: ['development', 'features'],
                            startDate: '',
                            dueDate: '2023-08-10',
                            checklist: [],
                            assignees: ['Peter Jones'],
                            attachments: [],
                            status: 'To Do',
                            comments: [],
                        },
                        {
                            id: 'task-8',
                            title: 'Testing',
                            description: 'Perform thorough testing of the MVP',
                            labels: ['testing', 'qa'],
                            startDate: '',
                            dueDate: '2023-08-15',
                            checklist: [],
                            assignees: ['Sarah Williams'],
                            attachments: [],
                            status: 'To Do',
                            comments: [],
                        },
                    ]
                },
            ]
        },
    ],
    selectedMilestone: null,
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
                    }
                }
            }
        },
    },
});

export const { addProject, addMilestone, setSelectedMilestone, updateTask } = projectSlice.actions;
export default projectSlice.reducer;

