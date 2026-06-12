"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getAccessToken, getAuthChangeEventName } from '@/lib/auth'
import { LayoutDashboard, Ticket, User, LogIn, UserPlus, Moon, Sun, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function Sidebar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsLoggedIn(Boolean(getAccessToken()))
    
    const syncAuthState = () => setIsLoggedIn(Boolean(getAccessToken()))
    const authEvent = getAuthChangeEventName()

    window.addEventListener(authEvent, syncAuthState)
    window.addEventListener('storage', syncAuthState)

    return () => {
      window.removeEventListener(authEvent, syncAuthState)
      window.removeEventListener('storage', syncAuthState)
    }
  }, [])

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, show: true },
    { name: 'Tickets', href: '/tickets', icon: Ticket, show: isLoggedIn },
    { name: 'Profile', href: '/profile', icon: User, show: isLoggedIn },
    { name: 'Login', href: '/login', icon: LogIn, show: !isLoggedIn },
    { name: 'Sign Up', href: '/signup', icon: UserPlus, show: !isLoggedIn },
  ]

  return (
    <aside className={`fixed bottom-0 left-0 right-0 z-50 md:relative md:bottom-auto md:left-auto md:right-auto ${isCollapsed ? 'md:w-20' : 'md:w-64'} md:h-screen bg-sidebar border-t md:border-t-0 md:border-r border-border flex flex-row md:flex-col transition-all duration-300 md:sticky md:top-0`}>
      <div className="hidden md:flex p-4 items-center justify-between border-b border-border min-h-[73px]">
        {!isCollapsed && <span className="font-bold text-lg text-primary truncate">HelpDesk</span>}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className={`p-2 rounded-lg hover:bg-sidebar-hover text-foreground transition-colors ${isCollapsed ? 'mx-auto' : ''}`}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <div className="p-2 md:p-4 flex-1 flex flex-row md:flex-col gap-1 md:gap-2 overflow-x-auto md:overflow-x-hidden overflow-y-hidden md:overflow-y-auto items-center md:items-stretch justify-around md:justify-start">
        {!isCollapsed && <div className="hidden md:block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-2">Menu</div>}
        {navItems.filter(item => item.show).map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center justify-center md:justify-start ${isCollapsed ? 'md:justify-center' : 'md:gap-3 md:px-4'} p-3 md:py-3 rounded-lg transition-all font-medium ${
                isActive 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-foreground hover:bg-sidebar-hover'
              }`}
              title={isCollapsed || true ? item.name : undefined}
            >
              <Icon size={20} className="shrink-0" />
              {!isCollapsed && <span className="hidden md:block truncate">{item.name}</span>}
            </Link>
          )
        })}
      </div>
      
      {mounted && (
        <div className="p-2 md:p-4 border-l md:border-l-0 md:border-t border-border flex justify-center items-center">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`flex items-center justify-center md:justify-start ${isCollapsed ? 'md:justify-center' : 'md:gap-3 md:px-4'} p-3 md:py-3 w-full rounded-lg text-foreground hover:bg-sidebar-hover transition-all font-medium`}
            title={isCollapsed || true ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
          >
            {theme === 'dark' ? <Sun size={20} className="shrink-0" /> : <Moon size={20} className="shrink-0" />}
            {!isCollapsed && <span className="hidden md:block truncate">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
        </div>
      )}
    </aside>
  )
}
