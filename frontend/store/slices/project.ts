import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';

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
    tags: number[]; // Updated: tags are now numbers
    startDate: string;
    dueDate: string;
    deadline: string;
    start_date: string;
    due_date: string;
    checklist: ChecklistItem[];
    assignee: string | null;
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

interface ProjectPermission {
    userId: string;
    role: 'viewer' | 'editor' | 'admin';
}

interface Project {
    id: string;
    name: string;
    milestones: Milestone[];
    permissions: ProjectPermission[];
}

interface ProjectState {
    projects: Project[];
    selectedMilestone: string | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: ProjectState = {
    projects: [],
    selectedMilestone: null,
    status: 'idle',
    error: null,
};

export const fetchProjects = createAsyncThunk(
    'projects/fetchProjects',
    async (_, { getState }) => {
        const { auth } = getState() as RootState;
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/`, {
            headers: {
                Authorization: `Bearer ${auth.token}`,
            },
        });
        return response.data;
    }
);

export const createProject = createAsyncThunk(
    'projects/createProject',
    async (projectName: string, { getState }) => {
        const { auth } = getState() as RootState;
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/projects/`,
            { name: projectName },
            {
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                },
            }
        );
        return response.data;
    }
);

export const createMilestone = createAsyncThunk(
    'projects/createMilestone',
    async ({ projectId, name }: { projectId: string; name: string }, { getState }) => {
        const { auth } = getState() as RootState;
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/milestones/`,
            { name },
            {
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                },
            }
        );
        return response.data;
    }
);

export const createTask = createAsyncThunk(
    'projects/createTask',
    async ({ milestoneId, task }: { milestoneId: string; task: Omit<Task, 'id'> }, { getState }) => {
        const { auth } = getState() as RootState;

        // Format dates to ISO string
        const formattedTask = {
            ...task,
            start_date: new Date(task.start_date).toISOString(),
            due_date: new Date(task.due_date).toISOString(),
            deadline: new Date(task.deadline).toISOString(),
            tags: task.tags.map(tag => parseInt(tag, 10)), // Ensure tags are numbers
            checklist: task.checklist, // Include the checklist
        };

        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/milestones/${milestoneId}/tasks/`,
            formattedTask,
            {
                headers: {
                    Authorization: `Bearer ${auth.token}`,
                },
            }
        );
        return { milestoneId, task: { ...response.data, id: String(response.data.id) } };
    }
);

const projectSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        addProject: (state, action: PayloadAction<{ name: string; ownerId: string }>) => {
            const newProject: Project = {
                id: Date.now().toString(),
                name: action.payload.name,
                milestones: [],
                permissions: [{ userId: action.payload.ownerId, role: 'admin' }],
            };
            state.projects.push(newProject);
        },
        addMilestone: (state, action: PayloadAction<{ projectId: string; name: string }>) => {
            const project = state.projects.find(p => p.id === action.payload.projectId);
            if (project) {
                const newMilestone: Milestone = {
                    id: `${project.id}-${(project.milestones || []).length + 1}`,
                    name: action.payload.name,
                    tasks: [],
                };
                project.milestones.push(newMilestone);
            }
        },
        setSelectedMilestone: (state, action: PayloadAction<string | null>) => {
            state.selectedMilestone = action.payload;
            if (action.payload) {
                const milestone = state.projects
                    .flatMap(p => p.milestones)
                    .find(m => m.id === action.payload);
                if (milestone) {
                    // You might want to dispatch setTasks here if needed
                    // This depends on how you've set up your Redux store and actions
                }
            }
        },
        updateTask: (state, action: PayloadAction<{ milestoneId: string; taskId: string; updates: Partial<Task> }>) => {
            const project = state.projects.find(project => project.milestones?.some(milestone => milestone.id === action.payload.milestoneId));
            if (project) {
                const milestone = project.milestones?.find(milestone => milestone.id === action.payload.milestoneId);
                if (milestone) {
                    const taskIndex = milestone.tasks?.findIndex(task => task.id === action.payload.taskId);
                    if (taskIndex !== -1 && taskIndex !== undefined) {
                        milestone.tasks[taskIndex] = { ...milestone.tasks[taskIndex], ...action.payload.updates };
                    }
                }
            }
        },
        updateProjectPermissions: (state, action: PayloadAction<{ projectId: string; permissions: ProjectPermission[] }>) => {
            const project = state.projects.find(p => p.id === action.payload.projectId);
            if (project) {
                project.permissions = action.payload.permissions;
            }
        },
        addTask: (state, action: PayloadAction<{ milestoneId: string; task: Task }>) => {
            const { milestoneId, task } = action.payload;
            const milestone = state.projects
                .flatMap(p => p.milestones)
                .find(m => m.id === milestoneId);
            if (milestone) {
                milestone.tasks.push(task);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjects.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
                state.status = 'succeeded';
                state.projects = action.payload;
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch projects';
            })
            .addCase(createProject.fulfilled, (state, action: PayloadAction<Project>) => {
                state.projects.push(action.payload);
            })
            .addCase(createMilestone.fulfilled, (state, action: PayloadAction<Milestone>) => {
                const project = state.projects.find(p => p.id === action.payload.project);
                if (project) {
                    project.milestones.push(action.payload);
                }
            })
            .addCase(createTask.fulfilled, (state, action: PayloadAction<{ milestoneId: string; task: Task }>) => {
                const { milestoneId, task } = action.payload;
                const milestone = state.projects
                    .flatMap(p => p.milestones)
                    .find(m => m.id === milestoneId);
                if (milestone) {
                    milestone.tasks.push(task);
                }
            });
    },
});

export const { addProject, addMilestone, setSelectedMilestone, updateTask, updateProjectPermissions, addTask } = projectSlice.actions;
export default projectSlice.reducer;

const hasMilestones = (project: any): project is Project & { milestones: Milestone[] } => {
    return Array.isArray(project.milestones) && project.milestones.length > 0;
};

export const selectPermittedTasks = (state: RootState) => {
    const { role, id, permittedProjects } = state.account;
    const allProjects = state.projects.projects;

    if (role === 'owner' || role === 'admin') {
        return allProjects
            .filter(hasMilestones)
            .flatMap(p => p.milestones?.flatMap(m => m.tasks || []) || []);
    }

    return allProjects
        .filter(p => permittedProjects.includes(p.id))
        .filter(hasMilestones)
        .flatMap(p => p.milestones?.flatMap(m => m.tasks || []) || [])
        .filter(task => task.assignee === id);
};

