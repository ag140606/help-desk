"use client"            //Use as client component
import React from 'react'

import { useRouter } from 'next/navigation'             //To re-route after submission
import { useState } from 'react'                        //For default values

export default function CreateForm() {
  const router = useRouter();

  const[title, setTitle] = useState('');
  const[body, setBody] = useState('');
  const[priority, setPriority] = useState('low');
  const [email, setEmail] = useState('');
  const[loading, setLoading] = useState(false);

  const handleSubmit = async (e)  => {
    e.preventDefault();
    setLoading(true);

    const newTicket = { title, body, priority, user_email: email }

    const res = await fetch('http://localhost:4000/tickets', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTicket)
    })

    if (res.status === 201) {                       //Check this line
      router.refresh()
      router.push('/tickets')
    }
    
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        <span>Title:</span>
        <input
          required 
          type="text"
          onChange={(e) => setTitle(e.target.value)}
          value={title}
        />
      </label>
      <label>
        <span>Body:</span>
        <textarea
          required
          onChange={(e) => setBody(e.target.value)}
          value={body}
        />
      </label>
      <label>
        <span>Email:</span>                      
        <input
          required
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
      </label>
      <label>
        <span>Priority:</span>
        <select 
          onChange={(e) => setPriority(e.target.value)}
          value={priority}
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
      </label>
      <button 
        className="btn-primary" 
        disabled={loading}
      >
      {loading && <span>Adding...</span>}
      {!loading && <span>Add Ticket</span>}
    </button>
    </form>
)
}
