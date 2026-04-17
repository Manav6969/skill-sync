const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return '';
};

const normalizeUrl = (url) => {
  if (!url) {
    throw new Error('fetchWithAuth requires a valid URL');
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    throw new Error('API base URL is unavailable');
  }

  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const fetchWithAuth = async (url, options = {}) => {
  const resolvedUrl = normalizeUrl(url);
  let token = localStorage.getItem('access_token');

  if (!options.headers) options.headers = {};

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (!options.headers['Content-Type'] && ['POST', 'PUT', 'PATCH'].includes(options.method)) {
    options.headers['Content-Type'] = 'application/json';
  }

  try {
    let res = await fetch(resolvedUrl, {
      ...options,
      credentials: 'include',
    });

    if (res.status === 403) {
      try {
        const refreshRes = await fetch(normalizeUrl('/api/auth/refresh'), {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshRes.ok) {
          const { accessToken } = await refreshRes.json();
          localStorage.setItem('access_token', accessToken);
          options.headers.Authorization = `Bearer ${accessToken}`;

          res = await fetch(resolvedUrl, {
            ...options,
            credentials: 'include',
          });
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (err) {
        console.error('Token refresh failed:', err);
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }

    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }

    return res;
  } catch (err) {
    console.error('fetchWithAuth error:', err, 'URL:', resolvedUrl);
    throw err;
  }
};
