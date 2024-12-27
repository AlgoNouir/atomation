import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { XIcon, Calendar, Tag, Paperclip, Plus, Trash } from 'lucide-react';
import { updateTask } from '@/store/slices/project';
import { updateTaskStatus } from '@/store/slices/kanban';

interface TaskModalProps {
    taskId: string;
    onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ taskId, onClose }) => {
    const dispatch = useDispatch<AppDispatch>();
    const projects = useSelector((state: RootState) => state.projects.projects);
    const selectedMilestone = useSelector((state: RootState) => state.projects.selectedMilestone);

    const milestone = projects.flatMap(p => p.milestones).find(m => m.id === selectedMilestone);
    const task = milestone?.tasks.find(t => t.id === taskId);

    const [localTask, setLocalTask] = useState(task);
    const [newComment, setNewComment] = useState('');
    const [newChecklistItem, setNewChecklistItem] = useState('');

    if (!task || !localTask) return null;

    const handleInputChange = (field: string, value: any) => {
        setLocalTask({ ...localTask, [field]: value });
        if (field === 'status' && milestone) {
            dispatch(updateTaskStatus({ taskId: task.id, newStatus: value }));
        }
    };

    const handleSave = () => {
        if (milestone) {
            dispatch(updateTask({ milestoneId: milestone.id, taskId: task.id, updates: localTask }));
        }
        onClose();
    };

    const addComment = () => {
        if (newComment.trim()) {
            const comment = {
                id: Date.now().toString(),
                author: 'Current User', // Replace with actual user name
                text: newComment.trim(),
                timestamp: new Date().toISOString(),
            };
            setLocalTask({
                ...localTask,
                comments: [...localTask.comments, comment],
            });
            setNewComment('');
        }
    };

    const addChecklistItem = () => {
        if (newChecklistItem.trim()) {
            const item = {
                id: Date.now().toString(),
                text: newChecklistItem.trim(),
                isCompleted: false,
            };
            setLocalTask({
                ...localTask,
                checklist: [...localTask.checklist, item],
            });
            setNewChecklistItem('');
        }
    };

    const toggleChecklistItem = (itemId: string) => {
        setLocalTask({
            ...localTask,
            checklist: localTask.checklist.map(item =>
                item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
            ),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Task Details</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors duration-200">
                        <XIcon size={20} />
                    </button>
                </div>
                <div className="p-4 max-h-[80vh] overflow-y-auto">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-4">
                            <div>
                                <label className="label">
                                    <span className="label-text font-semibold">Title</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={localTask.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="label">
                                    <span className="label-text font-semibold">Description</span>
                                </label>
                                <textarea
                                    className="textarea textarea-bordered w-full h-24"
                                    value={localTask.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                ></textarea>
                            </div>
                            <div>
                                <label className="label">
                                    <span className="label-text font-semibold">Checklist</span>
                                </label>
                                <ul className="space-y-2">
                                    {localTask.checklist.map((item) => (
                                        <li key={item.id} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={item.isCompleted}
                                                onChange={() => toggleChecklistItem(item.id)}
                                                className="checkbox"
                                            />
                                            <span className={item.isCompleted ? 'line-through' : ''}>{item.text}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex items-center mt-2">
                                    <input
                                        type="text"
                                        className="input input-bordered flex-grow mr-2"
                                        value={newChecklistItem}
                                        onChange={(e) => setNewChecklistItem(e.target.value)}
                                        placeholder="Add new checklist item"
                                    />
                                    <button className="btn btn-primary btn-square" onClick={addChecklistItem}>
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="label">
                                    <span className="label-text font-semibold">Comments</span>
                                </label>
                                <ul className="space-y-2 mb-2">
                                    {localTask.comments.map((comment) => (
                                        <li key={comment.id} className="bg-gray-100 p-2 rounded">
                                            <p className="font-semibold">{comment.author}</p>
                                            <p>{comment.text}</p>
                                            <p className="text-xs text-gray-500">{new Date(comment.timestamp).toLocaleString()}</p>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        className="input input-bordered flex-grow mr-2"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment"
                                    />
                                    <button className="btn btn-primary btn-square" onClick={addComment}>
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="label">
                                    <span className="label-text font-semibold">Labels</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={localTask.labels.join(', ')}
                                    onChange={(e) => handleInputChange('labels', e.target.value.split(',').map(label => label.trim()))}
                                />
                            </div>
                            <div>
                                <label className="label">
                                    <span className="label-text font-semibold">Start Date</span>
                                </label>
                                <input
                                    type="date"
                                    className="input input-bordered w-full"
                                    value={localTask.startDate}
                                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="label">
                                    <span className="label-text font-semibold">Due Date</span>
                                </label>
                                <input
                                    type="date"
                                    className="input input-bordered w-full"
                                    value={localTask.dueDate}
                                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="label">
                                    <span className="label-text font-semibold">Assignees</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    value={localTask.assignees.join(', ')}
                                    onChange={(e) => handleInputChange('assignees', e.target.value.split(',').map(assignee => assignee.trim()))}
                                />
                            </div>
                            <div>
                                <label className="label">
                                    <span className="label-text font-semibold">Status</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={localTask.status}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                >
                                    <option value="To Do">To Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Under Review">Under Review</option>
                                    <option value="Done">Done</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">
                                    <span className="label-text font-semibold">Attachments</span>
                                </label>
                                <ul className="space-y-2">
                                    {localTask.attachments.map((attachment, index) => (
                                        <li key={index} className="flex items-center justify-between">
                                            <a href={attachment} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                {attachment.split('/').pop()}
                                            </a>
                                            <button className="btn btn-ghost btn-xs" onClick={() => handleInputChange('attachments', localTask.attachments.filter((_, i) => i !== index))}>
                                                <Trash size={16} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex items-center mt-2">
                                    <input
                                        type="text"
                                        className="input input-bordered flex-grow mr-2 w-full"
                                        placeholder="Add attachment URL"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                const input = e.target as HTMLInputElement;
                                                handleInputChange('attachments', [...localTask.attachments, input.value]);
                                                input.value = '';
                                            }
                                        }}
                                    />
                                    <button className="btn btn-primary btn-square">
                                        <Paperclip size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end p-4 border-t border-gray-200">
                    <button
                        onClick={handleSave}
                        className="btn btn-primary"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskModal;

