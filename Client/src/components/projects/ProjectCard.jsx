import React from 'react';

const ProjectCard = ({ project, onEdit, onDelete, onView }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = () => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const progress = calculateProgress();
  const daysRemaining = project.endDate ? getDaysRemaining(project.endDate) : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors line-clamp-2"
              onClick={() => onView(project)}
            >
              {project.name}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {project.description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
              {project.priority}
            </span>
          </div>
          
          {project.budget && (
            <span className="text-sm font-medium text-gray-900">
              ${project.budget.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 pt-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-900">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Project Details */}
      <div className="p-6 space-y-3">
        {/* Client */}
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="truncate">{project.client?.name || 'No client assigned'}</span>
        </div>

        {/* Timeline */}
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>
            {project.startDate ? formatDate(project.startDate) : 'No start date'}
            {project.endDate && ` - ${formatDate(project.endDate)}`}
          </span>
        </div>

        {/* Tasks */}
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>
            {project.tasks ? `${project.tasks.filter(t => t.status === 'completed').length}/${project.tasks.length} tasks` : '0 tasks'}
          </span>
        </div>

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex items-start text-sm text-gray-600">
            <svg className="w-4 h-4 mr-3 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <div className="flex flex-wrap gap-1">
              {project.technologies.slice(0, 3).map((tech, index) => (
                <span key={index} className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                  {tech}
                </span>
              ))}
              {project.technologies.length > 3 && (
                <span className="inline-block bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">
                  +{project.technologies.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Days Remaining */}
        {daysRemaining !== null && project.status === 'active' && (
          <div className="flex items-center text-sm">
            <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={daysRemaining < 7 ? 'text-red-600 font-medium' : 'text-gray-600'}>
              {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
            </span>
          </div>
        )}
      </div>

      {/* Team Members (if any) */}
      {project.teamMembers && project.teamMembers.length > 0 && (
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Team</span>
            <div className="flex -space-x-2">
              {project.teamMembers.slice(0, 3).map((member, index) => (
                <div 
                  key={index}
                  className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white"
                  title={member.name}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {project.teamMembers.length > 3 && (
                <div className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                  +{project.teamMembers.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onView(project)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
          >
            View Details
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(project)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(project._id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;