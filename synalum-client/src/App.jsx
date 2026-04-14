import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import LandingPage from './pages/LandingPage.jsx'
import AlumniVerification from './pages/AlumniVerification.jsx'
import RegisterRole from './pages/RegisterRole.jsx'
import AlumniDashboard from './pages/dashboard/AlumniDashboard.jsx'
import LecturerDashboard from './pages/dashboard/LecturerDashboard.jsx'
import StudentDashboard from './pages/dashboard/StudentDashboard.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegisterRole />} />
      <Route path="/verifikasi-alumni" element={<AlumniVerification />} />

      <Route element={<ProtectedRoute allowedRoles={['mahasiswa']} />}>
        <Route path="/dashboard/student" element={<StudentDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['alumni']} />}>
        <Route path="/dashboard/alumni" element={<AlumniDashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['dosen', 'admin']} />}>
        <Route path="/dashboard/dosen" element={<LecturerDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
