const TZ = 'Asia/Jakarta';

export const todayWIB = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: TZ });

export const formatDate = (dateStr) =>
  new Date(`${dateStr}T00:00:00`).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString('id-ID', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
  });

export const formatClock = (date) =>
  date.toLocaleTimeString('id-ID', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

export const photoUrl = (path) => `${import.meta.env.VITE_API_URL}/${path}`;