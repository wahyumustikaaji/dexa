import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { formatDate, formatTime, todayWIB } from '../../utils/format';

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
      api.get('/attendance', { params: { startDate: today, endDate: today, limit: 100 } }),
    ])
      .then(([usersRes, attendanceRes]) => {
        const active = usersRes.data.filter((u) => u.role === 'EMPLOYEE' && u.isActive).length;
        const present = attendanceRes.data.meta.total;
        setStats({ active, present, absent: Math.max(active - present, 0), list: attendanceRes.data.data });
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
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h3 className="mb-3 font-semibold text-slate-800">Sudah absen hari ini</h3>
        {stats.list.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada yang absen.</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {stats.list.map((a) => (
              <li key={a.id} className="flex justify-between py-2">
                <span className="text-slate-800">
                  {a.user?.nama} <span className="text-slate-400">({a.user?.employeeCode})</span>
                </span>
                <span className="flex items-center gap-4 text-slate-500">
                  {formatTime(a.checkInAt)}
                  <a href={`${import.meta.env.VITE_API_URL}/${a.photoPath}`} target="_blank" rel="noreferrer"
                    className="rounded-md border border-slate-300 px-3 py-1 text-xs text-blue-600 hover:bg-slate-50">
                    Lihat foto
                  </a>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}