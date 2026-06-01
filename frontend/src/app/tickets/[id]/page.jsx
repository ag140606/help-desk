import React from 'react'
import { notFound } from 'next/navigation';
import DeleteButton from './DeleteButton';
import axios from '@/lib/axios'


async function getTicket(id) {
    try {
        const res = await axios.get('/tickets/' + id)
        return res.data;
    } catch (error) {
        return null;
    }
}

export default async function TicketDetails({ params }) {
  const { id } = await params;
  const ticket = await getTicket(id)
  if (!ticket) notFound(); 



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