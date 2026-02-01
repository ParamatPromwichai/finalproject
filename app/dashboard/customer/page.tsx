'use client';

import { useEffect } from 'react';

export default function CustomerDashboard() {
  useEffect(() => {
    async function checkRole() {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (!res.ok) {
        window.location.href = '/login';
        return;
      }

      const data = await res.json();

      if (data.role !== 'customer') {
        window.location.href = '/login';
      }
    }

    checkRole();
  }, []);

  return <h1>Dashboard ลูกค้า</h1>;
}
