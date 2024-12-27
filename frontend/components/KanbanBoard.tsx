import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { moveTask, updateTaskStatusAndLog } from '@/store/slices/kanban';
import { updateTask } from '@/store/slices/project';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import TaskModal from './TaskModal';
import { Calendar, Clock, AlertCircle, CheckCircle2, Tag, User } from 'lucide-react';
import { User as UserType } from '@/store/slices/userSlice';
import { TagIcon } from 'lucide-react';

const KanbanBoard: React.FC = () => {
    const { columns, columnOrder } = useSelector((state: RootState) => state.kanban);
    const projects = useSelector((state: RootState) => state.projects.projects);
    const selectedMilestone = useSelector((state: RootState) => state.projects.selectedMilestone);
    const dispatch = useDispatch<AppDispatch>();
    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const users = useSelector((state: RootState) => state.users.users);
    const tags = useSelector((state: RootState) => state.tags.tags);

    const milestone = projects.flatMap(p => p.milestones).find(m => m.id === selectedMilestone);
    const tasks = milestone ? milestone.tasks : [];

    const onDragEnd = (result: any) => {
        const { destination, source, draggableId } = result;

        if (!destination) {
            return;
        }

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const sourceColumn = columns[source.droppableId];
        const destinationColumn = columns[destination.droppableId];

        dispatch(
            moveTask({
                taskId: draggableId,
                sourceColumnId: source.droppableId,
                destinationColumnId: destination.droppableId,
                newIndex: destination.index,
            })
        );

        if (sourceColumn.title !== destinationColumn.title) {
            dispatch(updateTaskStatusAndLog(draggableId, destinationColumn.title));

            if (selectedMilestone) {
                dispatch(
                    updateTask({
                        milestoneId: selectedMilestone,
                        taskId: draggableId,
                        updates: { status: destinationColumn.title },
                    })
                );
            }
        }
    };

    const handleTaskClick = (taskId: string) => {
        setSelectedTask(taskId);
    };

    const closeModal = () => {
        setSelectedTask(null);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'To Do':
                return 'bg-blue-500';
            case 'In Progress':
                return 'bg-yellow-500';
            case 'Debt':
                return 'bg-red-500';
            case 'Done':
                return 'bg-green-500';
            default:
                return 'bg-gray-500';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (!selectedMilestone) {
        return <div className="text-center py-8">Please select a milestone to view tasks.</div>;
    }

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {columnOrder.map((columnId) => {
                        const column = columns[columnId];
                        const columnTasks = column.taskIds.map(taskId => tasks.find(t => t.id === taskId)).filter(Boolean);

                        return (
                            <div key={column.id} className="bg-base-200 rounded-lg p-4">
                                <h2 className="text-xl font-bold mb-4">{column.title}</h2>
                                <Droppable droppableId={column.id}>
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="space-y-4"
                                        >
                                            {columnTasks.map((task, index) => (
                                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="card bg-base-100 shadow-xl cursor-pointer hover:bg-base-200 transition-colors duration-200"
                                                            onClick={() => handleTaskClick(task.id)}
                                                        >
                                                            <div className="card-body p-4">
                                                                <div className={`absolute top-0 right-0 w-2 h-2 rounded-full ${getStatusColor(task.status)} m-2`}></div>
                                                                <h3 className="card-title text-lg font-semibold mb-2">{task.title}</h3>
                                                                <p className="text-sm text-base-content/70 line-clamp-2 mb-2">{task.description}</p>
                                                                <div className="flex flex-wrap gap-2 mb-2">
                                                                    {task.tags.map((tagId) => {
                                                                        const tag = tags.find(t => t.id === tagId);
                                                                        return tag ? (
                                                                            <span key={tag.id} className={`badge ${tag.color} text-white text-xs`}>
                                                                                {tag.name}
                                                                            </span>
                                                                        ) : null;
                                                                    })}
                                                                </div>
                                                                <div className="flex flex-wrap gap-2 mb-2">
                                                                    {(task.labels || []).map((label, index) => (
                                                                        <span key={index} className="badge badge-sm badge-primary">{label}</span>
                                                                    ))}
                                                                </div>
                                                                <div className="flex items-center justify-between text-sm text-base-content/70">
                                                                    <div className="flex items-center space-x-2">
                                                                        <Calendar size={14} />
                                                                        <span>{formatDate(task.startDate)}</span>
                                                                    </div>
                                                                    {/* Removed date display */}
                                                                    {/* <div className="flex items-center space-x-2">
                                                                        <Clock size={14} />
                                                                        <span>{formatDate(task.dueDate)}</span>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <AlertCircle size={14} />
                                                                        <span>{formatDate(task.deadline)}</span>
                                                                    </div> */}
                                                                </div>
                                                                <div className="flex items-center justify-between mt-2">
                                                                    <div className="flex items-center space-x-2">
                                                                        <User size={14} />
                                                                        <span className="text-xs">
                                                                            {task.assignee ? users.find(u => u.id === task.assignee)?.name : 'Unassigned'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <CheckCircle2 size={14} />
                                                                        <span className="text-xs">{task.checklist.filter(item => item.isCompleted).length}/{task.checklist.length}</span>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <Tag size={14} />
                                                                        <span className="text-xs">{(task.labels || []).length}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>
            {selectedTask && (
                <TaskModal taskId={selectedTask} onClose={closeModal} />
            )}
        </>
    );
};

export default KanbanBoard;

