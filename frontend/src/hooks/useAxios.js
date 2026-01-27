'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

const useAxios = (url, method = 'GET', body = null, deps = []) => {
  const [data, setData] = useState(null);  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Skip request if URL is null or undefined
    if (!url) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const response = await axios({
          url,
          method,
          data: body,
        });

        setData(response.data);
      } catch (err) {
        setError(err.message || 'API call failed');
      } finally {
        setLoading(false);
      }
    })();
  }, deps);

  return { data, loading, error };
};

export default useAxios;
