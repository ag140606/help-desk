import React from 'react'
import Link from 'next/link'
import axios from '@/lib/axios'

//For reusing data

//Function to fetch data; axios logic used here
async function getTickets() {
    const res = await axios.get('/tickets')
    return res.data;
}

//Declare as async function to use as server components
export default async function TicketList() {
    //Return data
  const tickets = await getTickets();
  return (
    //Empty tag for fragments
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
