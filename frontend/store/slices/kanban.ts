import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Task {
    id: string;
    title: string;
    description: string;
}

interface Column {
    id: string;
    title: string;
    taskIds: string[];
}

interface KanbanState {
    columns: { [key: string]: Column };
    columnOrder: string[];
}

const initialState: KanbanState = {
    columns: {
        'column-1': { id: 'column-1', title: 'To Do', taskIds: [] },
        'column-2': { id: 'column-2', title: 'In Progress', taskIds: [] },
        'column-3': { id: 'column-3', title: 'Done', taskIds: [] },
    },
    columnOrder: ['column-1', 'column-2', 'column-3'],
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
        },
        setTasks: (state, action: PayloadAction<Task[]>) => {
            // Reset all columns
            Object.values(state.columns).forEach(column => {
                column.taskIds = [];
            });

            // Distribute tasks to columns (for simplicity, all tasks start in 'To Do')
            action.payload.forEach(task => {
                state.columns['column-1'].taskIds.push(task.id);
            });
        },
    },
});

export const { moveTask, setTasks } = kanbanSlice.actions;
export default kanbanSlice.reducer;
