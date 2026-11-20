import { useState } from 'react';
import api from '../../api/axios';
import { getErrorMessage } from '../../utils/error';
import PasswordInput from '../../components/PasswordInput';

const inputClass =
  'w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-100';

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

export default function EmployeeForm({ employee, isSelf, onClose, onSaved }) {
  const isEdit = Boolean(employee);
  const [form, setForm] = useState({
    employeeCode: employee?.employeeCode ?? '',
    nama: employee?.nama ?? '',
    email: employee?.email ?? '',
    password: '',
    posisi: employee?.posisi ?? '',
    departemen: employee?.departemen ?? '',
    role: employee?.role ?? 'EMPLOYEE',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const payload = {
      employeeCode: form.employeeCode.trim(),
      nama: form.nama.trim(),
      email: form.email.trim(),
      posisi: form.posisi.trim(),
      departemen: form.departemen.trim(),
      role: form.role,
    };
    if (form.password) payload.password = form.password;

    try {
      if (isEdit) await api.patch(`/users/${employee.id}`, payload);
      else await api.post('/users', payload);
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal menyimpan data'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-full w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold text-slate-800">
          {isEdit ? 'Edit Karyawan' : 'Tambah Karyawan'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="Kode Karyawan">
            <input name="employeeCode" value={form.employeeCode} onChange={handleChange}
              required className={inputClass} placeholder="EMP001" />
          </Field>
          <Field label="Nama Lengkap">
            <input name="nama" value={form.nama} onChange={handleChange}
              required className={inputClass} />
          </Field>
          <Field label="Email">
            <input type="email" name="email" value={form.email} onChange={handleChange}
              required className={inputClass} />
          </Field>
          <Field label={isEdit ? 'Password Baru (kosongkan jika tidak diganti)' : 'Password'}>
            <PasswordInput name="password" value={form.password} onChange={handleChange}
              required={!isEdit} minLength={6} className={inputClass} placeholder="Minimal 6 karakter" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Jabatan">
              <input name="posisi" value={form.posisi} onChange={handleChange} className={inputClass} />
            </Field>
            <Field label="Departemen">
              <input name="departemen" value={form.departemen} onChange={handleChange} className={inputClass} />
            </Field>
          </div>
          <Field label="Role">
            <select name="role" value={form.role} onChange={handleChange}
              disabled={isSelf} className={inputClass}>
              <option value="EMPLOYEE">Karyawan</option>
              <option value="ADMIN">Admin HRD</option>
            </select>
            {isSelf && (
              <p className="mt-1 text-xs text-slate-500">Kamu tidak bisa mengubah role akunmu sendiri.</p>
            )}
          </Field>

          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
              Batal
            </button>
            <button type="submit" disabled={submitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}