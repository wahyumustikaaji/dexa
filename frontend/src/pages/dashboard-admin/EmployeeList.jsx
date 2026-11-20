import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/error';
import EmployeeForm from './EmployeeForm';

export default function EmployeeList() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memuat data karyawan'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.nama, u.employeeCode, u.email].some((v) => v?.toLowerCase().includes(q)),
    );
  }, [users, search]);

  const toggleActive = async (u) => {
    const action = u.isActive ? 'menonaktifkan' : 'mengaktifkan kembali';
    if (!window.confirm(`Yakin ingin ${action} ${u.nama}?`)) return;
    try {
      if (u.isActive) await api.delete(`/users/${u.id}`);
      else await api.patch(`/users/${u.id}`, { isActive: true });
      await loadUsers();
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal mengubah status karyawan'));
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-800">Data Karyawan</h2>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, kode, email..."
            className="w-56 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          <button
            onClick={() => setModal({ employee: null })}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Tambah
          </button>
        </div>
      </div>

      {error && <p className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-slate-500">Memuat...</p>
      ) : filtered.length === 0 ? (
        <p className="text-slate-500">Tidak ada data karyawan.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 pr-4 font-medium">Kode</th>
                <th className="py-2 pr-4 font-medium">Nama</th>
                <th className="py-2 pr-4 font-medium">Jabatan / Dept.</th>
                <th className="py-2 pr-4 font-medium">Role</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 pr-4 text-slate-700">{u.employeeCode}</td>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-slate-800">{u.nama}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </td>
                  <td className="py-3 pr-4 text-slate-600">
                    {[u.posisi, u.departemen].filter(Boolean).join(' / ') || '-'}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {u.role === 'ADMIN' ? 'Admin' : 'Karyawan'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {u.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-3">
                      <button onClick={() => setModal({ employee: u })}
                        className="text-blue-600 hover:underline">
                        Edit
                      </button>
                      {u.id !== me.id && (
                        <button onClick={() => toggleActive(u)}
                          className={u.isActive ? 'text-red-600 hover:underline' : 'text-green-600 hover:underline'}>
                          {u.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <EmployeeForm
          employee={modal.employee}
          isSelf={modal.employee?.id === me.id}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            loadUsers();
          }}
        />
      )}
    </div>
  );
}