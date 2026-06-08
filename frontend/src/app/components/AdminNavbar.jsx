"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import adminAxios from '@/lib/adminAxios';
import {
  clearAdminSession,
  getAdminAccessToken,
  getAdminAuthChangeEventName,
  getAdminRefreshToken,
} from '@/lib/adminAuth';
import Logo from './logo.png';

export default function AdminNavbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getAdminAccessToken()));

  useEffect(() => {
    const syncAuthState = () => setIsLoggedIn(Boolean(getAdminAccessToken()));
    const authEvent = getAdminAuthChangeEventName();

    window.addEventListener(authEvent, syncAuthState);
    window.addEventListener('storage', syncAuthState);

    return () => {
      window.removeEventListener(authEvent, syncAuthState);
      window.removeEventListener('storage', syncAuthState);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await adminAxios.post('/admin/auth/logout', { refreshToken: getAdminRefreshToken() });
    } catch (_) {
      // No-op: we still clear local session.
    } finally {
      clearAdminSession();
      setIsLoggedIn(false);
      window.location.href = '/admin/login';
    }
  };

  return (
    <nav>
      <Image
        src={Logo}
        alt="MyHelpdesk Logo"
        width={40}
        height={40}
        priority
        className="navbar-logo"
      />
      <h1>MyHelpdesk Admin</h1>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {isLoggedIn && <Link href="/admin">Dashboard</Link>}
        {isLoggedIn && <Link href="/admin/users">Users</Link>}
        {!isLoggedIn && <Link href="/admin/login">Admin Login</Link>}
        {isLoggedIn && (
          <button className="btn-secondary" onClick={handleLogout}>Logout</button>
        )}
      </div>
    </nav>
  );
}
