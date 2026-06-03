"use client"
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import axios from '@/lib/axios'
import {
  clearAuthSession,
  getAccessToken,
  getAuthChangeEventName,
  getRefreshToken,
} from '@/lib/auth'
import Logo from './logo.png'

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getAccessToken()))

  useEffect(() => {
    const syncAuthState = () => setIsLoggedIn(Boolean(getAccessToken()))
    const authEvent = getAuthChangeEventName()

    window.addEventListener(authEvent, syncAuthState)
    window.addEventListener('storage', syncAuthState)

    return () => {
      window.removeEventListener(authEvent, syncAuthState)
      window.removeEventListener('storage', syncAuthState)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout', { refreshToken: getRefreshToken() })
    } catch (_) {
      // No-op: we still clear local session.
    } finally {
      clearAuthSession()
      setIsLoggedIn(false)
      window.location.href = '/login'
    }
  }

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
        <h1>MyHelpdesk</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1.25rem'}}>
          <Link href="/">Dashboard</Link>
          {isLoggedIn && <Link href="/tickets">Tickets</Link>}
          {isLoggedIn && <Link href="/tickets/create" className='addTicket'>Add Ticket</Link>}
          {!isLoggedIn && <Link href="/login">Login</Link>}
          {!isLoggedIn && <Link href="/signup">Sign Up</Link>}
          {isLoggedIn && (
            <button className="btn-secondary" onClick={handleLogout}>Logout</button>
          )}
        </div>
        
    </nav>
  )
}
