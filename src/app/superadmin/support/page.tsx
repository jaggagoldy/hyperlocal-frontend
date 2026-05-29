'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);

  const fetchTickets = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:5001/api/v1/superadmin/tickets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setTickets(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleResolve = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`http://localhost:5001/api/v1/superadmin/tickets/${id}/resolve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTickets();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Support Board</h1>
        <p className="text-gray-500 mt-2">Manage customer queries, complaints, and moderation reports.</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ticket.type === 'Report' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                    {ticket.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-900 truncate max-w-xs" title={ticket.message}>{ticket.message}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ticket.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleResolve(ticket.id)}
                    disabled={ticket.status === 'resolved'}
                    className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded disabled:opacity-50"
                  >
                    Mark Resolved
                  </button>
                  <Link
                    href={`https://wa.me/`} 
                    target="_blank"
                    className="text-green-600 hover:text-green-900 bg-green-50 px-2 py-1 rounded inline-block"
                  >
                    WhatsApp User
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
