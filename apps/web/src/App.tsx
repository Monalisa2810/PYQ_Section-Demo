import { Suspense, lazy } from 'react'
import { Spin } from 'antd'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const PyqSection = lazy(() => import('./pages/PyqSection'))
const SolvePyq = lazy(() => import('./pages/SolvePyq'))

function Loader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Spin size="large" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/pyq" element={<PyqSection />} />
          <Route path="/pyq/solve/:id" element={<SolvePyq />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </Suspense>
  )
}
