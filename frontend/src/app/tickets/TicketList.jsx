"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from '@/lib/axios'
import { useRouter } from 'next/navigation'

export default function TicketList() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const loadTickets = async () => {
      try {
        const res = await axios.get('/tickets')
        setTickets(res.data)
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.push('/login')
          return
        }
        setError('Unable to load tickets')
      } finally {
        setLoading(false)
      }
    }

    loadTickets()
  }, [router])

  if (loading) {
    return <p>Loading tickets...</p>
  }

  if (error) {
    return <p className='text-red-500'>{error}</p>
  }

  return (
    <>
        {tickets.map((ticket) => (
            <div key = {ticket._id} className='card my-5'>
                <Link href={`/tickets/${ticket._id}`}>
                <h3> {ticket.title} </h3>
                <p> {ticket.body.slice(0,200)}... </p>
                <div className = {`pill ${ticket.priority}`}> {ticket.priority} priority</div>
                </Link>
            </div>
        ))}
        
        {tickets.length === 0 && (
            <p className='text-center'>There are no open tickets!</p>
        )}
    </>
    )
}
