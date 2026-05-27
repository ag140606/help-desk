import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Logo from './logo.png'

export default function Navbar() {
  return (
    <nav>
        <Image
          src = { Logo }
          alt = "MyHelpdesk Logo"
          width = { 30 }
          quality={ 100 }
          placeholder='blur' />
        <h1>MyHelpdesk</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1.25rem'}}>
          <Link href="/">Dashboard</Link>
          <Link href="/tickets">Tickets</Link>
          <Link href="/tickets/create" className='addTicket'>Add Ticket</Link>
        </div>
        
    </nav>
  )
}
