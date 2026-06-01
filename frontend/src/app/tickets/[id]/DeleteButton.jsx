"use client"
import { useRouter } from "next/navigation"
import axios from '@/lib/axios'

import React from 'react'

export default function DeleteButton({ id }) {
  const router = useRouter()

  const deleteTicket = async () => {
    try {
      const res = await axios.delete('/tickets/' + id)
      router.refresh()
      router.push('/tickets')
    } catch (error) {
      console.log('Delete error:', error)
    }
  }

  return (
    <center>
        <button className="btn-secondary" onClick={deleteTicket}>Delete Ticket</button>
    </center>
  )
}
