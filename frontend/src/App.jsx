import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import AdminDashboard from './pages/dashboard-admin/AdminDashboard';
import EmployeeList from './pages/dashboard-admin/EmployeeList';
import EmployeeAttendance from './pages/dashboard-employee/EmployeeAttendance';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/absen"
        element={
          <ProtectedRoute role="EMPLOYEE">
            <EmployeeAttendance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="karyawan" element={<EmployeeList />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}