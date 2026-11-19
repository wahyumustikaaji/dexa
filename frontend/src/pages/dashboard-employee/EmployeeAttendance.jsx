import { useCallback, useEffect, useState } from 'react';
import api from '../../api/axios';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { formatClock, formatDate, formatTime, photoUrl, todayWIB } from '../../utils/format';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function EmployeeAttendance() {
  const { user } = useAuth();
  const [now, setNow] = useState(new Date());
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const { data } = await api.get('/attendance/me');
      setHistory(data);
    } catch {
      setMessage({ type: 'error', text: 'Gagal memuat riwayat absen' });
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const todayRecord = history.find((h) => h.date === todayWIB());

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    setMessage(null);
    if (!selected) return;

    if (!ALLOWED_TYPES.includes(selected.type)) {
      setMessage({ type: 'error', text: 'Foto harus berformat JPG, PNG, atau WEBP' });
      e.target.value = '';
      return;
    }
    if (selected.size > MAX_SIZE) {
      setMessage({ type: 'error', text: 'Ukuran foto maksimal 5 MB' });
      e.target.value = '';
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async () => {
    if (!file) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      await api.post('/attendance', formData);

      setFile(null);
      setPreview(null);
      setMessage({ type: 'success', text: 'Absen berhasil dicatat. Selamat bekerja!' });
      await loadHistory();
    } catch (err) {
      const msg = err.response?.data?.message;
      setMessage({
        type: 'error',
        text: Array.isArray(msg) ? msg.join(', ') : msg || 'Gagal absen, coba lagi',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar title="Absensi Karyawan" />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <section className="rounded-xl bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-slate-500">Halo, {user?.nama}</p>
          <p className="mt-2 text-5xl font-bold tabular-nums text-slate-800">
            {formatClock(now)}
          </p>
          <p className="mt-2 text-slate-500">{formatDate(todayWIB())} (WIB)</p>
        </section>

        {message && (
          <div
            className={`rounded-md px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {message.text}
          </div>
        )}

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Absen Hari Ini</h2>

          {loadingHistory ? (
            <p className="text-slate-500">Memuat...</p>
          ) : todayRecord ? (
            <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
              <img
                src={photoUrl(todayRecord.photoPath)}
                alt="Foto absen hari ini"
                className="h-40 w-40 rounded-lg object-cover"
              />
              <div>
                <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                  ✓ Sudah absen
                </span>
                <p className="mt-2 text-slate-600">
                  Tercatat pukul{' '}
                  <span className="font-semibold">{formatTime(todayRecord.checkInAt)} WIB</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">
                Ambil atau pilih foto sebagai bukti kamu sedang bekerja dari rumah.
              </p>

              {preview && (
                <img
                  src={preview}
                  alt="Pratinjau foto"
                  className="max-h-72 rounded-lg object-contain"
                />
              )}

              <div className="flex flex-wrap gap-3">
                <label className="cursor-pointer rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  {file ? 'Ganti Foto' : 'Pilih / Ambil Foto'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="user"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={handleSubmit}
                  disabled={!file || submitting}
                  className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? 'Mengirim...' : 'Absen Sekarang'}
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Riwayat Absen</h2>

          {history.length === 0 ? (
            <p className="text-slate-500">Belum ada riwayat absen.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-4 font-medium">Tanggal</th>
                    <th className="py-2 pr-4 font-medium">Jam</th>
                    <th className="py-2 font-medium">Foto</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 pr-4 text-slate-700">{formatDate(h.date)}</td>
                      <td className="py-2 pr-4 text-slate-700">{formatTime(h.checkInAt)} WIB</td>
                      <td className="py-2">
                        <a href={photoUrl(h.photoPath)} target="_blank" rel="noreferrer">
                          <img
                            src={photoUrl(h.photoPath)}
                            alt="Bukti absen"
                            className="h-12 w-12 rounded object-cover hover:opacity-80"
                          />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}