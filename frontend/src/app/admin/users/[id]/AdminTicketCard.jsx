"use client";

import { useState } from 'react';
import adminAxios from '@/lib/adminAxios';

export default function AdminTicketCard({ ticket, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(ticket.title);
  const [body, setBody] = useState(ticket.body);
  const [priority, setPriority] = useState(ticket.priority);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await adminAxios.put(`/admin/tickets/${ticket._id}`, {
        title,
        body,
        priority,
      });
      onUpdated(res.data);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setError('');
    setLoading(true);

    try {
      await adminAxios.delete(`/admin/tickets/${ticket._id}`);
      onDeleted(ticket._id);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to delete ticket');
      setLoading(false);
    }
  };

  if (editing) {
    return (
      <div className="card my-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <label>
            <span>Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </label>
          <label>
            <span>Body</span>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} required />
          </label>
          <label>
            <span>Priority</span>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          {error && <p className="text-red-500">{error}</p>}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setTitle(ticket.title);
                setBody(ticket.body);
                setPriority(ticket.priority);
                setEditing(false);
                setError('');
              }}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card my-5">
      <h3>{ticket.title}</h3>
      <p>{ticket.body}</p>
      <div className={`pill ${ticket.priority}`}>{ticket.priority} priority</div>

      {error && <p className="text-red-500">{error}</p>}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
        <button className="btn-primary" onClick={() => setEditing(true)} disabled={loading}>
          Edit
        </button>
        <button className="btn-secondary" onClick={handleDelete} disabled={loading}>
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
