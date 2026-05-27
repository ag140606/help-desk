import React from 'react'
import { notFound } from 'next/navigation';


async function getTicket(id) {
    const res = await fetch('http://localhost:4000/tickets/' + id, {
        next: { revalidate: 60 }        //Check this line
    });
    if (!res.ok) return null; 
    return res.json();
}

export default async function TicketDetails( { params } ) {
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
            <div className = {`pill ${ticket.priority}`}> {ticket.priority} priority</div>
        </div>
    </main>
  )
}
