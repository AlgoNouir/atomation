import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { X, Calendar, TagIcon, Paperclip, Plus, Trash, CheckSquare, MessageSquare, Users, RemoveFormattingIcon as RemoveIcon } from 'lucide-react';
import { updateTask } from '@/store/slices/project';
import { updateTaskStatusAndLog, updateTaskChecklistAndLog } from '@/store/slices/kanban';
import { User } from '@/store/slices/userSlice';
import { Tag } from '@/store/slices/tagSlice';

interface TaskModalProps {
    taskId: string;
    onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ taskId, onClose }) => {
    const dispatch = useDispatch<AppDispatch>();
    const projects = useSelector((state: RootState) => state.projects.projects);
    const selectedMilestone = useSelector((state: RootState) => state.projects.selectedMilestone);
    const users = useSelector((state: RootState) => state.users.users);
    const tags = useSelector((state: RootState) => state.tags.tags);

    const milestone = projects.flatMap(p => p.milestones).find(m => m.id === selectedMilestone);
    const task = milestone?.tasks.find(t => t.id === taskId);

    const [localTask, setLocalTask] = useState(task);
    const [newComment, setNewComment] = useState('');
    const [newChecklistItem, setNewChecklistItem] = useState('');
    const [activeTab, setActiveTab] = useState('details');

    if (!task || !localTask) return null;

    const handleInputChange = (field: string, value: any) => {
        if (field !== 'startDate' && field !== 'dueDate' && field !== 'deadline') {
            setLocalTask({ ...localTask, [field]: value });
            if (field === 'status' && milestone) {
                dispatch(updateTaskStatusAndLog(task.id, value));
            }
        }
    };


    const handleSave = () => {
        if (milestone) {
            const updatedChecklist = localTask.checklist.filter(
                (item, index) => item.isCompleted !== task.checklist[index].isCompleted
            );
            dispatch(updateTask({
                milestoneId: milestone.id,
                taskId: task.id,
                updates: localTask
            }));
            if (updatedChecklist.length > 0) {
                dispatch(updateTaskChecklistAndLog(task.id, localTask.checklist));
            }
        }
        onClose();
    };

    const addComment = () => {
        if (newComment.trim()) {
            const comment = {
                id: Date.now().toString(),
                author: 'Current User',
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
            <div className="relative w-full max-w-4xl bg-base-100 rounded-xl shadow-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-2xl font-bold">{localTask.title}</h3>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-4 max-h-[80vh] overflow-y-auto">
                    <div className="flex mb-4 border-b border-gray-200">
                        <button
                            className={`btn btn-ghost ${activeTab === 'details' ? 'btn-active' : ''}`}
                            onClick={() => setActiveTab('details')}
                        >
                            Details
                        </button>
                        <button
                            className={`btn btn-ghost ${activeTab === 'checklist' ? 'btn-active' : ''}`}
                            onClick={() => setActiveTab('checklist')}
                        >
                            Checklist
                        </button>
                        <button
                            className={`btn btn-ghost ${activeTab === 'comments' ? 'btn-active' : ''}`}
                            onClick={() => setActiveTab('comments')}
                        >
                            Comments
                        </button>
                    </div>
                    {activeTab === 'details' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">
                                    <span className="label-text font-semibold">Description</span>
                                </label>
                                <textarea
                                    className="textarea textarea-bordered w-full h-32"
                                    value={localTask.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                ></textarea>
                            </div>
                            <div className="space-y-4">
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
                                        <option value="Debt">Debt</option>
                                        <option value="Done">Done</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">
                                        <span className="label-text font-semibold">Start Date</span>
                                    </label>
                                    <p className="text-sm">{new Date(localTask.startDate).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="label">
                                        <span className="label-text font-semibold">Due Date</span>
                                    </label>
                                    <p className="text-sm">{new Date(localTask.dueDate).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="label">
                                        <span className="label-text font-semibold">Deadline</span>
                                    </label>
                                    <p className="text-sm">{new Date(localTask.deadline).toLocaleString()}</p>
                                </div>
                            </div>
                            <div>
                                <label className="label">
                                    <span className="label-text font-semibold">Tags</span>
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {localTask.tags.map((tagId) => {
                                        const tag = tags.find(t => t.id === tagId);
                                        return tag ? (
                                            <div key={tag.id} className={`badge ${tag.color} text-white`}>
                                                {tag.name}
                                                <button
                                                    className="ml-1"
                                                    onClick={() => handleInputChange('tags', localTask.tags.filter(id => id !== tag.id))}
                                                >
                                                    <RemoveIcon size={12} />
                                                </button>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                                <select
                                    className="select select-bordered w-full"
                                    onChange={(e) => {
                                        const selectedTagId = e.target.value;
                                        if (selectedTagId && !localTask.tags.includes(selectedTagId)) {
                                            handleInputChange('tags', [...localTask.tags, selectedTagId]);
                                        }
                                    }}
                                    value=""
                                >
                                    <option value="" disabled>Add a tag</option>
                                    {tags.filter(tag => !localTask.tags.includes(tag.id)).map(tag => (
                                        <option key={tag.id} value={tag.id}>{tag.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">
                                    <span className="label-text font-semibold">Assignee</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={localTask.assignee || ''}
                                    onChange={(e) => handleInputChange('assignee', e.target.value || null)}
                                >
                                    <option value="">Unassigned</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                    {activeTab === 'checklist' && (
                        <div>
                            <h4 className="text-lg font-semibold mb-2">Checklist</h4>
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
                        </div>
                    )}
                    {activeTab === 'comments' && (
                        <div>
                            <h4 className="text-lg font-semibold mb-2">Comments</h4>
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
                    )}
                </div>
                <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={handleSave} className="btn btn-primary">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskModal;

