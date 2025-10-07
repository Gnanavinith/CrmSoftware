import React, { useState, useEffect } from 'react';
import { projectService } from '../../services/projectService';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';

const TaskFormDebug = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testEndpoints = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Testing projects endpoint...');
      const projectsRes = await projectService.getProjectsList({ limit: 100 });
      console.log('Projects response:', projectsRes);
      setProjects(projectsRes.projects || []);
      
      console.log('Testing users endpoint...');
      const usersRes = await userService.getUsersList({ limit: 100 });
      console.log('Users response:', usersRes);
      setUsers(usersRes.users || []);
      
      toast.success('Endpoints tested successfully!');
    } catch (error) {
      console.error('Error testing endpoints:', error);
      setError(error.message);
      toast.error('Error testing endpoints: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testEndpoints();
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">TaskForm Debug</h2>
      
      <button
        onClick={testEndpoints}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Endpoints'}
      </button>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Projects ({projects.length})</h3>
          <div className="max-h-40 overflow-y-auto">
            {projects.map(project => (
              <div key={project._id} className="p-2 border-b">
                <strong>{project.name}</strong> - {project.status}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Users ({users.length})</h3>
          <div className="max-h-40 overflow-y-auto">
            {users.map(user => (
              <div key={user._id} className="p-2 border-b">
                <strong>{user.name}</strong> - {user.email} ({user.role})
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFormDebug;
