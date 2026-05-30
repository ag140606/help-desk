"use client"
import { useRouter } from "next/navigation"
import axios from 'axios'

import React from 'react'

export default function DeleteButton({ id }) {
  const router = useRouter()
  console.log('DeleteButton rendered with id:', id)

  const deleteTicket = async () => {
    try {
      const res = await axios.delete('http://localhost:4000/tickets/' + id)
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
