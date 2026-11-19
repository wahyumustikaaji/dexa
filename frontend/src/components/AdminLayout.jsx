import { NavLink, Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const tabClass = ({ isActive }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium ${
    isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'
  }`;

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar title="Dashboard HRD" />

      <nav className="mx-auto flex max-w-5xl gap-2 px-4 pt-4">
        <NavLink to="/admin" end className={tabClass}>Ringkasan</NavLink>
        <NavLink to="/admin/karyawan" className={tabClass}>Data Karyawan</NavLink>
      </nav>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}