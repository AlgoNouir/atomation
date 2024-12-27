import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { moveTask, updateTaskStatus } from '@/store/slices/kanban';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { useState } from 'react';
import TaskModal from './TaskModal';
import { Calendar, Tag } from 'lucide-react';

const KanbanBoard = () => {
    const { columns, columnOrder } = useSelector((state: RootState) => state.kanban);
    const projects = useSelector((state: RootState) => state.projects.projects);
    const selectedMilestone = useSelector((state: RootState) => state.projects.selectedMilestone);
    const dispatch = useDispatch<AppDispatch>();
    const [selectedTask, setSelectedTask] = useState<string | null>(null);

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

        // Update the task status in the project slice
        dispatch(
            updateTaskStatus({
                taskId: draggableId,
                newStatus: destinationColumn.title,
            })
        );
    };

    const handleTaskClick = (taskId: string) => {
        setSelectedTask(taskId);
    };

    const closeModal = () => {
        setSelectedTask(null);
    };

    if (!selectedMilestone) {
        return <div className="text-center py-8">Please select a milestone to view tasks.</div>;
    }

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex space-x-4">
                    {columnOrder.map((columnId) => {
                        const column = columns[columnId];
                        const columnTasks = column.taskIds.map(taskId => tasks.find(t => t.id === taskId)).filter(Boolean);

                        return (
                            <div key={column.id} className="flex-shrink-0 w-72">
                                <div className="bg-base-200 rounded-lg p-4">
                                    <h2 className="text-xl font-bold mb-4">{column.title}</h2>
                                    <Droppable droppableId={column.id}>
                                        {(provided) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className="space-y-2"
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
                                                                    <h3 className="card-title text-lg font-semibold">{task.title}</h3>
                                                                    <p className="text-sm text-base-content/70 line-clamp-2">{task.description}</p>
                                                                    <div className="flex items-center justify-between mt-2">
                                                                        <div className="flex items-center space-x-2">
                                                                            <Calendar size={16} />
                                                                            <span className="text-xs">{task.dueDate}</span>
                                                                        </div>
                                                                        <div className="flex items-center space-x-1">
                                                                            <Tag size={16} />
                                                                            <span className="text-xs">{[task.tags || []].length}</span>
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

