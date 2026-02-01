'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    // 🔥 redirect ตาม role
    if (data.role === 'customer') {
      window.location.href = '/dashboard/customer';
    } else if (data.role === 'shop') {
      window.location.href = '/dashboard/shop';
    } else if (data.role === 'admin') {
      window.location.href = '/dashboard/admin';
    }
  }

  return (
    <div>
      <h1>Login</h1>

      <input
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="username"
      />

      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="password"
      />

      <button type="button" onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}
