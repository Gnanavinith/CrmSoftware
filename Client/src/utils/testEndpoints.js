// Test script to check if endpoints are working from frontend
import { api } from '../services/api';

export const testEndpoints = async () => {
  try {
    console.log('Testing endpoints...');
    
    // Test projects list
    console.log('Testing projects list...');
    const projectsResponse = await api.get('/api/projects/list');
    console.log('Projects response:', projectsResponse.data);
    
    // Test users list
    console.log('Testing users list...');
    const usersResponse = await api.get('/api/users/list');
    console.log('Users response:', usersResponse.data);
    
    return {
      projects: projectsResponse.data,
      users: usersResponse.data
    };
  } catch (error) {
    console.error('Error testing endpoints:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};
