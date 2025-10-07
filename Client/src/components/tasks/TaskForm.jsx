import React, { useState, useEffect } from 'react';
import { taskService } from '../../services/taskService';
import { projectService } from '../../services/projectService';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';

const TaskForm = ({ onTaskAdded, editTask, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    project: '',
    assignee: '',
    dueDate: '',
    labels: [],
    estimatedHours: '',
    tags: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [newLabel, setNewLabel] = useState('');
  const [newTag, setNewTag] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (editTask) {
      setFormData({
        title: editTask.title || '',
        description: editTask.description || '',
        status: editTask.status || 'pending',
        priority: editTask.priority || 'medium',
        project: editTask.project?._id || '',
        assignee: editTask.assignee?._id || '',
        dueDate: editTask.dueDate ? new Date(editTask.dueDate).toISOString().split('T')[0] : '',
        labels: editTask.labels || [],
        estimatedHours: editTask.estimatedHours || '',
        tags: editTask.tags || []
      });
    }
  }, [editTask]);

  // Fetch projects and users
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('TaskForm: Fetching projects and users data...');
        
        const [projectsRes, usersRes] = await Promise.all([
          projectService.getProjectsList({ limit: 100 }),
          userService.getUsersList({ limit: 100 })
        ]);
        
        console.log('TaskForm: Projects response:', projectsRes);
        console.log('TaskForm: Users response:', usersRes);
        
        setProjects(projectsRes.projects || []);
        setUsers(usersRes.users || []);
        
        console.log('TaskForm: Set projects:', projectsRes.projects?.length || 0);
        console.log('TaskForm: Set users:', usersRes.users?.length || 0);
        
        toast.success(`Loaded ${projectsRes.projects?.length || 0} projects and ${usersRes.users?.length || 0} users`);
      } catch (error) {
        console.error('TaskForm: Error fetching data:', error);
        console.error('TaskForm: Error response:', error.response?.data);
        toast.error('Failed to load projects and users data: ' + (error.response?.data?.message || error.message));
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddLabel = () => {
    if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
      setFormData(prev => ({
        ...prev,
        labels: [...prev.labels, newLabel.trim()]
      }));
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (labelToRemove) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(label => label !== labelToRemove)
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        project: formData.project || undefined,
        assignee: formData.assignee || undefined
      };

      if (editTask) {
        await taskService.updateTask(editTask._id, submitData);
        toast.success('Task updated successfully!');
      } else {
        await taskService.createTask(submitData);
        toast.success('Task created successfully!');
      }
      onTaskAdded();
      
      // Reset form if not editing
      if (!editTask) {
        setFormData({
          title: '',
          description: '',
          status: 'pending',
          priority: 'medium',
          project: '',
          assignee: '',
          dueDate: '',
          labels: [],
          estimatedHours: '',
          tags: []
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">
          {editTask ? 'Edit Task' : 'Create New Task'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {editTask ? 'Update task information' : 'Enter task details to create a new task'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter task title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter task description"
              />
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Project and Assignee */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project
                </label>
                <select
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Project ({projects.length} available)</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>{project.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignee
                </label>
                <select
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Assignee ({users.length} available)</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>{user.name} ({user.role})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due Date and Estimated Hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Hours
                </label>
                <input
                  type="number"
                  name="estimatedHours"
                  value={formData.estimatedHours}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Labels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Labels
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.labels.map((label, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={() => handleRemoveLabel(label)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLabel())}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Add label"
                />
                <button
                  type="button"
                  onClick={handleAddLabel}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-gray-600 hover:text-gray-800"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Add tag"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{editTask ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <span>{editTask ? 'Update Task' : 'Create Task'}</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;