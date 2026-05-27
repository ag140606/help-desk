import React from 'react'
import Link from 'next/link'

//For reusing data

//Function to fetch data; fetch logic used here
async function getTickets() {
    const res = await fetch('http://localhost:4000/tickets')
    return res.json();
}

//Declare as async function to use as server components & use fetch API directly
export default async function TicketList() {
    //Return data
  const tickets = await getTickets();
  return (
    //Empty tag for fragments
    <>
        {tickets.map((ticket) => (
            <div key = {ticket.id} className='card my-5'>
                <Link href={`/tickets/${ticket.id}`}>
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
