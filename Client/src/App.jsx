import './App.css'
import Header from './components/common/Header'
import Sidebar from './components/common/Sidebar'
import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Attendance from './pages/Attendance'
import Clients from './pages/Clients'
import Projects from './pages/Projects'
import Tasks from './pages/Tasks'
import Profile from './pages/Profile'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/*"
          element={
            <div className="min-h-screen bg-gray-50">
              <Header />
              <div className="flex">
                <Sidebar />
                <main className="flex-1 p-6">
                  <Routes>
                    <Route path="/" element={<Navigate to={localStorage.getItem('onboardingComplete') === 'true' ? '/dashboard' : '/attendance'} replace />} />
                    <Route path="/dashboard" element={localStorage.getItem('onboardingComplete') === 'true' ? <Dashboard /> : <Navigate to="/attendance" replace />} />
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
          }
        />
      </Routes>
    </div>
  )
}

export default App
