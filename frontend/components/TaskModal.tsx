import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { X, Calendar, TagIcon, Paperclip, Plus, Trash, CheckSquare, MessageSquare, Users, RemoveFormattingIcon as RemoveIcon, RefreshCw } from 'lucide-react';
import { updateTask } from '@/store/slices/project';
import { updateTaskStatusAndLog, updateTaskChecklistAndLog } from '@/store/slices/kanban';
import { format, isValid } from 'date-fns';
import { unwrapResult } from '@reduxjs/toolkit';
import axios from 'axios';
import { fetchMilestoneLogs } from '@/store/slices/logSlice';

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
    const userRole = useSelector((state: RootState) => state.auth.role);
    const logs = useSelector((state: RootState) => state.log.entries);

    const milestone = projects.flatMap(p => p.milestones).find(m => m.id === selectedMilestone);
    const task = milestone?.tasks.find(t => t.id === taskId);

    const [localTask, setLocalTask] = useState(task);
    const [newComment, setNewComment] = useState('');
    const [newChecklistItem, setNewChecklistItem] = useState('');
    const [activeTab, setActiveTab] = useState('details');
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [isLogsLoading, setIsLogsLoading] = useState(false);

    console.log(users);


    useEffect(() => {
        if (selectedMilestone) {
            setIsLogsLoading(true);
            dispatch(fetchMilestoneLogs(selectedMilestone))
                .finally(() => setIsLogsLoading(false));
        }
    }, [dispatch, selectedMilestone]);

    if (!task || !localTask) return null;

    const handleInputChange = (field: string, value: any) => {
        if (field === 'start_date' || field === 'due_date' || field === 'deadline') {
            setLocalTask({ ...localTask, [field]: new Date(value).toISOString() });
        } else {
            setLocalTask({ ...localTask, [field]: value });
            if (field === 'status' && milestone) {
                dispatch(updateTaskStatusAndLog(task.id, value));
            }
        }
    };

    const handleSave = async () => {
        if (milestone && task) {
            setIsSaving(true);
            setSaveError(null);
            try {
                const updatedTaskData = {
                    ...localTask,
                    start_date: localTask.start_date,
                    due_date: localTask.due_date,
                    checklist: localTask.checklist.map(item => ({
                        text: item.text,
                        is_completed: item.isCompleted
                    }))
                };

                const response = await axios.put(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${task.id}/`,
                    updatedTaskData,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    }
                );

                dispatch(updateTask({ milestoneId: milestone.id, taskId: task.id, updatedTask: response.data }));
                dispatch(updateTaskChecklistAndLog(task.id, localTask.checklist, milestone.project));

                // Fetch updated logs
                dispatch(fetchMilestoneLogs(milestone.id));

                onClose();
            } catch (error) {
                console.error('Failed to update task:', error);
                setSaveError('Failed to save changes. Please try again.');
            } finally {
                setIsSaving(false);
            }
        }
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

    const handleRefreshLogs = () => {
        if (selectedMilestone) {
            setIsLogsLoading(true);
            dispatch(fetchMilestoneLogs(selectedMilestone))
                .finally(() => setIsLogsLoading(false));
        }
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
                        <button
                            className={`btn btn-ghost ${activeTab === 'logs' ? 'btn-active' : ''}`}
                            onClick={() => setActiveTab('logs')}
                        >
                            Logs
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
                                    readOnly={userRole === 'user'}
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
                                    {userRole === 'admin' || userRole === 'owner' ? (
                                        <input
                                            type="datetime-local"
                                            value={isValid(new Date(localTask.start_date)) ? format(new Date(localTask.start_date), "yyyy-MM-dd'T'HH:mm") : ''}
                                            onChange={(e) => handleInputChange('start_date', e.target.value)}
                                            className="input input-bordered w-full"
                                        />
                                    ) : (
                                        <p className="text-sm">{new Date(localTask.start_date).toLocaleString()}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="label">
                                        <span className="label-text font-semibold">Due Date</span>
                                    </label>
                                    {userRole === 'admin' || userRole === 'owner' ? (
                                        <input
                                            type="datetime-local"
                                            value={isValid(new Date(localTask.due_date)) ? format(new Date(localTask.due_date), "yyyy-MM-dd'T'HH:mm") : ''}
                                            onChange={(e) => handleInputChange('due_date', e.target.value)}
                                            className="input input-bordered w-full"
                                        />
                                    ) : (
                                        <p className="text-sm">{new Date(localTask.due_date).toLocaleString()}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="label">
                                        <span className="label-text font-semibold">Deadline</span>
                                    </label>
                                    {userRole === 'admin' || userRole === 'owner' ? (
                                        <input
                                            type="datetime-local"
                                            value={isValid(new Date(localTask.deadline)) ? format(new Date(localTask.deadline), "yyyy-MM-dd'T'HH:mm") : ''}
                                            onChange={(e) => handleInputChange('deadline', e.target.value)}
                                            className="input input-bordered w-full"
                                        />
                                    ) : (
                                        <p className="text-sm">{new Date(localTask.deadline).toLocaleString()}</p>
                                    )}
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
                            {(userRole === 'admin' || userRole === 'owner') && (
                                <div className="flex items-center mt-2">
                                    <input
                                        type="text"
                                        className="input input-bordered flex-grow mr-2"
                                        value={newChecklistItem}
                                        onChange={(e) => setNewChecklistItem(e.target.value)}
                                        placeholder="Add checklist item"
                                    />
                                    <button className="btn btn-primary btn-square" onClick={addChecklistItem}>
                                        <Plus size={20} />
                                    </button>
                                </div>
                            )}
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
                                {(userRole === 'admin' || userRole === 'owner') && (
                                    <button className="btn btn-primary btn-square" onClick={addComment}>
                                        <Plus size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    {activeTab === 'logs' && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-lg font-semibold">Logs</h4>
                                <button
                                    className={`btn btn-sm btn-ghost ${isLogsLoading ? 'loading' : ''}`}
                                    onClick={handleRefreshLogs}
                                    disabled={isLogsLoading}
                                >
                                    {isLogsLoading ? 'Refreshing...' : <RefreshCw size={16} />}
                                </button>
                            </div>
                            <ul className="space-y-2">
                                {logs.map((log) => (
                                    <li key={log.id} className="bg-gray-100 p-2 rounded">
                                        <p>{log.message}</p>
                                        <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()} by {log.person}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleSave}
                        className={`btn btn-primary ${isSaving ? 'loading' : ''}`}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
                {saveError && (
                    <div className="text-error text-center mt-2">
                        {saveError}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskModal;

