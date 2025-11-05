import './App.css'
import Header from './components/common/Header'
import Sidebar from './components/common/Sidebar'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Dashboard from './pages/Dashboard'
import Attendance from './pages/Attendance'
import ClientsList from './pages/ClientsList' // Updated import
import ClientDetailsPage from './pages/ClientDetailsPage' // New import
import AddClient from './pages/AddClient' // New import
import AddProject from './pages/AddProject' // New import
import AddTask from './pages/AddTask' // New import
import Projects from './pages/Projects'
import Tasks from './pages/Tasks'
import Profile from './pages/Profile'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import RoleSelect from './pages/RoleSelect'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

function App() {
  const { user } = useAuth()
  
  // Protected route wrapper
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      // If no role selected yet, send user to choose role first
      const hasRoleSelection = (typeof window !== 'undefined') && (sessionStorage.getItem('selectedRole') || (new URLSearchParams(window.location.search)).get('role'))
      return <Navigate to={hasRoleSelection ? '/signin' : '/choose-role'} replace />
    }
    return children
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/choose-role" element={<RoleSelect />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex">
                  <Sidebar />
                  <main className="flex-1 p-6">
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/attendance" element={<Attendance />} />
                      <Route path="/clients" element={<ClientsList />} />
                      <Route path="/clients/add" element={<AddClient />} />
                      <Route path="/clients/:id" element={<ClientDetailsPage />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/projects/add" element={<AddProject />} />
                      <Route path="/tasks" element={<Tasks />} />
                      <Route path="/tasks/add" element={<AddTask />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="*" element={<div className="text-gray-600">Not Found</div>} />
                    </Routes>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App