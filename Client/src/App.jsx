import './App.css'
import Header from './components/common/Header'
import Sidebar from './components/common/Sidebar'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Dashboard from './pages/Dashboard'
import Attendance from './pages/Attendance'
import Clients from './pages/Clients'
import Projects from './pages/Projects'
import Tasks from './pages/Tasks'
import Profile from './pages/Profile'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'

function App() {
  const { user } = useAuth()
  
  // Protected route wrapper
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/signin" replace />
    }
    return children
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
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
                      <Route path="/clients" element={<Clients />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/tasks" element={<Tasks />} />
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
