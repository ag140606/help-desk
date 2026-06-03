"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DeleteButton from './DeleteButton';
import axios from '@/lib/axios'

export default function TicketDetails() {
  const { id } = useParams()
  const router = useRouter()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadTicket = async () => {
      try {
        const res = await axios.get('/tickets/' + id)
        setTicket(res.data)
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.push('/login')
          return
        }
        if (err.response?.status === 404) {
          setError('Ticket not found')
          return
        }
        setError('Unable to load ticket')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadTicket()
    }
  }, [id, router])

  if (loading) {
    return <main><p>Loading ticket...</p></main>
  }

  if (!ticket) {
    return <main><p>{error || 'Ticket not found'}</p></main>
  }

  return (
    <main>
        <nav>
            <h2>Ticket Details</h2>
        </nav>
        <div className='card'>
            <h3>{ticket.title}</h3>
            <small><b>Created by: </b>{ticket.user_email}</small>
            <p>{ticket.body}</p>
            <div className={`pill ${ticket.priority}`}>{ticket.priority} priority</div>
        </div>
        <DeleteButton id={id} />
    </main>
  )
}