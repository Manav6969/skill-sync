export const fetchWithAuth = async (url, options = {}) => {
  let token = localStorage.getItem('access_token');

  if (!options.headers) options.headers = {};

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (!options.headers['Content-Type'] && ['POST', 'PUT', 'PATCH'].includes(options.method)) {
    options.headers['Content-Type'] = 'application/json';
  }

  let res = await fetch(url, {
    ...options,
    credentials: 'include', 
  });

  if (res.status === 403) {
    const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshRes.ok) {
      const { accessToken } = await refreshRes.json();
      localStorage.setItem('access_token', accessToken);
      options.headers.Authorization = `Bearer ${accessToken}`;

      res = await fetch(url, {
        ...options,
        credentials: 'include',
      });
    } else {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
  }

  return res;
};
