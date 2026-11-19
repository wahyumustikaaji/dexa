import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatDate, todayWIB } from '../../utils/format';

function StatCard({ label, value, color }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-4xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const today = todayWIB();
    Promise.all([
      api.get('/users'),
      api.get('/attendance', { params: { startDate: today, endDate: today, limit: 1 } }),
    ])
      .then(([usersRes, attendanceRes]) => {
        const active = usersRes.data.filter((u) => u.role === 'EMPLOYEE' && u.isActive).length;
        const present = attendanceRes.data.meta.total;
        setStats({ active, present, absent: Math.max(active - present, 0) });
      })
      .catch(() => setError('Gagal memuat ringkasan'));
  }, []);

  if (error) return <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>;
  if (!stats) return <p className="text-slate-500">Memuat...</p>;

  return (
    <div className="space-y-4">
      <p className="text-slate-500">{formatDate(todayWIB())}</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Karyawan aktif" value={stats.active} color="text-slate-800" />
        <StatCard label="Sudah absen hari ini" value={stats.present} color="text-green-600" />
        <StatCard label="Belum absen" value={stats.absent} color="text-amber-600" />
      </div>
    </div>
  );
}