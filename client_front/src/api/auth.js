import http from './http';

export const isLoggedIn = async () => {
  try {
    const res = await http.get('/auth/me');
    return res.status === 200;
  } catch {
    return false;
  }
};

export const logout = async () => {
  try {
    await http.post('/auth/logout');
  } catch { }
};

export const requireAuth = async (navigate) => {
  const loggedIn = await isLoggedIn();
  if (!loggedIn) {
    alert('로그인이 필요합니다.');
    navigate('/login');
    return false;
  }
  return true;
};