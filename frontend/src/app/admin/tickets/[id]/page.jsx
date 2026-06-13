"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import adminAxios from '@/lib/adminAxios';
import { getAdminAccessToken } from '@/lib/adminAuth';

export default function AdminTicketDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editing state
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  // Reply state
  const [replyBody, setReplyBody] = useState('');
  const [replying, setReplying] = useState(false);
  const [replyError, setReplyError] = useState('');

  useEffect(() => {
    if (!getAdminAccessToken()) {
      router.push('/admin/login');
      return;
    }

    const loadTicket = async () => {
      try {
        const res = await adminAxios.get(`/admin/tickets/${id}`);
        setTicket(res.data);
        setTitle(res.data.title);
        setBody(res.data.body);
        setPriority(res.data.priority);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.push('/admin/login');
          return;
        }
        if (err.response?.status === 404) {
          setError('Ticket not found');
          return;
        }
        setError('Unable to load ticket');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadTicket();
    }
  }, [id, router]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaveLoading(true);

    try {
      const res = await adminAxios.put(`/admin/tickets/${ticket._id}`, {
        title,
        body,
        priority,
      });
      setTicket(res.data);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to update ticket');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;

    setError('');
    setSaveLoading(true);

    try {
      await adminAxios.delete(`/admin/tickets/${ticket._id}`);
      router.push('/admin/tickets'); // Navigate back after deletion
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to delete ticket');
      setSaveLoading(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyBody.trim()) return;

    setReplying(true);
    setReplyError('');
    try {
      const res = await adminAxios.post(`/admin/tickets/${ticket._id}/replies`, { body: replyBody });
      setTicket(res.data);
      setReplyBody('');
    } catch (err) {
      setReplyError(err.response?.data?.error || 'Unable to add reply');
    } finally {
      setReplying(false);
    }
  };

  if (loading) {
    return <main><p>Loading ticket...</p></main>;
  }

  if (error || !ticket) {
    return (
      <main>
        <p className="text-red-500">{error || 'Ticket not found'}</p>
        <button className="btn-primary mt-4" onClick={() => router.back()}>Go Back</button>
      </main>
    );
  }

  return (
    <main>
      <nav>
        <h2>Ticket Details</h2>
      </nav>

      <button className="text-sm text-gray-600 underline mb-4 inline-block hover:text-gray-900" onClick={() => router.back()}>
        &larr; Back
      </button>

      {editing ? (
        <div className="card my-5">
          <form onSubmit={handleSave}>
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
              <button type="submit" className="btn-primary" disabled={saveLoading}>
                {saveLoading ? 'Saving...' : 'Save'}
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
                disabled={saveLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card my-5">
          <h3>{ticket.title}</h3>
          <small className="block text-gray-500 mb-2"><b>User Email:</b> {ticket.user_email}</small>
          <p>{ticket.body}</p>
          <div className={`pill ${ticket.priority}`}>{ticket.priority} priority</div>

          {error && <p className="text-red-500">{error}</p>}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button className="btn-primary" onClick={() => setEditing(true)} disabled={saveLoading}>
              Edit
            </button>
            <button className="btn-secondary" onClick={handleDelete} disabled={saveLoading}>
              {saveLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}

      {/* Replies Section */}
      <div className="mt-8">
        <h4 className="text-xl font-bold mb-4">Conversation</h4>
        {ticket.replies && ticket.replies.length > 0 ? (
          ticket.replies.map((reply, idx) => (
            <div key={idx} className={`card ${reply.sender === 'admin' ? 'border-primary border-l-4 shadow-sm' : 'border-gray-200'}`}>
              <small className="text-gray-500 block mb-2">
                <b>{reply.sender === 'admin' ? `You (${reply.sender_email})` : 'User'}</b> • {new Date(reply.createdAt).toLocaleString()}
              </small>
              <p className='text-sm text-gray-500 mb-4'>{reply.body}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 mb-4">No replies yet.</p>
        )}

        <form onSubmit={handleReplySubmit} className="mt-6 bg-white p-4 rounded-md border border-gray-100 shadow-sm">
          <label className="block mb-2 font-semibold">Add a Reply</label>
          <textarea
            required
            rows="3"
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Type your message to the user..."
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            disabled={replying}
          ></textarea>
          {replyError && <p className="text-red-500 mt-2">{replyError}</p>}
          <button type="submit" className="btn-primary mt-3" disabled={replying}>
            {replying ? 'Sending...' : 'Send Reply'}
          </button>
        </form>
      </div>
    </main>
  );
}
