import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addLog } from './logSlice';
import { AppDispatch } from '../store';

interface Task {
    id: string;
    title: string;
    description: string;
    status: string;
    checklist?: ChecklistItem[];
}

interface ChecklistItem {
    id: string;
    text: string;
    isCompleted: boolean;
}

interface Column {
    id: string;
    title: string;
    taskIds: string[];
}

interface KanbanState {
    columns: { [key: string]: Column };
    columnOrder: string[];
    tasks: Task[];
}

const initialState: KanbanState = {
    columns: {
        'column-1': { id: 'column-1', title: 'To Do', taskIds: [] },
        'column-2': { id: 'column-2', title: 'In Progress', taskIds: [] },
        'column-3': { id: 'column-3', title: 'Debt', taskIds: [] },
        'column-4': { id: 'column-4', title: 'Done', taskIds: [] },
    },
    columnOrder: ['column-1', 'column-2', 'column-3', 'column-4'],
    tasks: [],
};

const kanbanSlice = createSlice({
    name: 'kanban',
    initialState,
    reducers: {
        moveTask: (state, action: PayloadAction<{ taskId: string; sourceColumnId: string; destinationColumnId: string; newIndex: number }>) => {
            const { taskId, sourceColumnId, destinationColumnId, newIndex } = action.payload;
            const sourceColumn = state.columns[sourceColumnId];
            const destinationColumn = state.columns[destinationColumnId];

            sourceColumn.taskIds = sourceColumn.taskIds.filter(id => id !== taskId);
            destinationColumn.taskIds.splice(newIndex, 0, taskId);

            if (destinationColumn.taskIds.length === 1) {
                const task = state.tasks.find(t => t.id === taskId);
                if (task) {
                    task.status = destinationColumn.title;
                }
            }
        },
        setTasks: (state, action: PayloadAction<Task[]>) => {
            state.tasks = action.payload;

            // Reset all column taskIds
            Object.values(state.columns).forEach(column => {
                column.taskIds = [];
            });

            // Distribute tasks to columns based on their status
            action.payload.forEach(task => {
                const column = Object.values(state.columns).find(col => col.title === task.status);
                if (column) {
                    column.taskIds.push(task.id);
                }
            });
        },
        updateTaskStatus: (state, action: PayloadAction<{ taskId: string; newStatus: string }>) => {
            const { taskId, newStatus } = action.payload;
            let sourceColumnId: string | undefined;
            let destinationColumnId: string | undefined;

            Object.entries(state.columns).forEach(([columnId, column]) => {
                if (column.taskIds.includes(taskId)) {
                    sourceColumnId = columnId;
                }
                if (column.title === newStatus) {
                    destinationColumnId = columnId;
                }
            });

            if (sourceColumnId && destinationColumnId) {
                if (sourceColumnId !== destinationColumnId) {
                    state.columns[sourceColumnId].taskIds = state.columns[sourceColumnId].taskIds.filter(id => id !== taskId);
                    state.columns[destinationColumnId].taskIds.push(taskId);
                }
                const task = state.tasks.find(t => t.id === taskId);
                if (task) {
                    task.status = newStatus;
                }
            }
        },
        updateTaskChecklist: (state, action: PayloadAction<{ taskId: string; updatedChecklist: ChecklistItem[] }>) => {
            const task = state.tasks.find(t => t.id === action.payload.taskId);
            if (task) {
                task.checklist = action.payload.updatedChecklist;
            }
        },
    },
});

export const { moveTask, setTasks, updateTaskStatus, updateTaskChecklist } = kanbanSlice.actions;

// Thunk to update task status and add log
export const updateTaskStatusAndLog = (taskId: string, newStatus: string, projectId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const task = state.kanban.tasks.find((t: Task) => t.id === taskId);
    const currentUser = state.account.name;
    if (task && task.status !== newStatus) {
        const oldStatus = task.status;
        dispatch(updateTaskStatus({ taskId, newStatus }));
        dispatch(addLog({
            message: `Task "${task.title}" moved from ${oldStatus} to ${newStatus}`,
            person: currentUser,
            projectId
        }));
    }
};

export const updateTaskChecklistAndLog = (taskId: string, updatedChecklist: ChecklistItem[], projectId: string) => (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const task = state.kanban.tasks.find((t: Task) => t.id === taskId);
    const currentUser = state.account.name;
    if (task) {
        dispatch(updateTaskChecklist({ taskId, updatedChecklist }));
        updatedChecklist.forEach(item => {
            const oldItem = task.checklist.find(i => i.id === item.id);
            if (oldItem && oldItem.isCompleted !== item.isCompleted) {
                const action = item.isCompleted ? 'completed' : 'uncompleted';
                dispatch(addLog({
                    message: `Checklist item "${item.text}" ${action} in task "${task.title}"`,
                    person: currentUser,
                    projectId
                }));
            }
        });
    }
};

export default kanbanSlice.reducer;

