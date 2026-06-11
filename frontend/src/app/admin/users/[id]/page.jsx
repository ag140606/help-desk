"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import adminAxios from '@/lib/adminAxios';
import { getAdminAccessToken } from '@/lib/adminAuth';
import AdminTicketCard from './AdminTicketCard';

export default function AdminUserTicketsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getAdminAccessToken()) {
      router.push('/admin/login');
      return;
    }

    const loadUserTickets = async () => {
      try {
        const res = await adminAxios.get(`/admin/users/${id}/tickets`);
        setUser(res.data.user);
        setTickets(res.data.tickets);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          router.push('/admin/login');
          return;
        }
        if (err.response?.status === 404) {
          setError('User not found');
          return;
        }
        setError('Unable to load user tickets');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadUserTickets();
    }
  }, [id, router]);

  if (loading) {
    return <main><p>Loading tickets...</p></main>;
  }

  if (error) {
    return (
      <main>
        <p className="text-red-500">{error}</p>
        <button className="btn-primary" onClick={() => router.push('/admin/users')}>Back to Users</button>
      </main>
    );
  }

  return (
    <main>
      <nav>
        <h2>{user?.name}&apos;s Open Tickets</h2>
      </nav>
      <p>{user?.email}</p>

      {tickets.map((ticket) => (
        <AdminTicketCard
          key={ticket._id}
          ticket={ticket}
          onUpdated={(updatedTicket) => {
            setTickets((current) =>
              current.map((item) => (item._id === updatedTicket._id ? updatedTicket : item))
            );
          }}
          onDeleted={(ticketId) => {
            setTickets((current) => current.filter((item) => item._id !== ticketId));
          }}
        />
      ))}

      <br />

      {tickets.length === 0 && (
        <p className="text-center">This user has no open tickets.</p>
      )}

      <br />

      <center>
      <p>
        <button className="btn-primary" onClick={() => router.push('/admin/users')}>Back to Users</button>
      </p>
      </center>
    </main>
  );
}
