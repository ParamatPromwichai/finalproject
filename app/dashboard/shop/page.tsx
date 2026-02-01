'use client';

import { useEffect } from 'react';

export default function ShopDashboard() {
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

      if (data.role !== 'shop') {
        window.location.href = '/login';
      }
    }

    checkRole();
  }, []);

  return <h1>Dashboard ร้านค้า</h1>;
}
