export const getErrorMessage = (err, fallback = 'Terjadi kesalahan, coba lagi') => {
  const msg = err.response?.data?.message;
  return Array.isArray(msg) ? msg.join(', ') : msg || fallback;
};