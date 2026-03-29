import toast from 'react-hot-toast';

export const getClubToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  // Check common token keys used across app
  return (
    window.localStorage.getItem('clubToken') ||
    window.localStorage.getItem('club_token') ||
    window.localStorage.getItem('token') ||
    null
  );
};

export const getClubId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('clubId');
};

export const handleClubUnauthorized = (router: any, sessionExpiredRef: { current: boolean }) => {
  if (sessionExpiredRef.current) return;
  sessionExpiredRef.current = true;
  try {
    window.localStorage.removeItem('clubToken');
    window.localStorage.removeItem('club_token');
    window.localStorage.removeItem('token');
  } catch (e) {
    // ignore
  }
  toast.error('Session expired. Please login again.');
  router.push('/club/login');
};
