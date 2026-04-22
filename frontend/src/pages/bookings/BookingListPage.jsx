import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '../../features/bookings/api/bookingApi';
import { useAuthContext } from '../../features/auth/context/AuthContext';

const BookingListPage = () => {
    const navigate = useNavigate();
    const { user, isStaff } = useAuthContext();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadBookings();
    }, [user]);

    const loadBookings = async () => {
        if (!user) return;
        try {
            setLoading(true);
            let data;
            if (isStaff) {
                data = await bookingApi.getAll();
            } else {
                data = await bookingApi.getByUserId(user.id);
            }
            // data inside ApiSuccessResponse is usually returned as data.data if interceptor unpacks response.data
            // If the backend returns { success: true, data: [...] }, we need to handle it.
            // Our axios interceptor usually returns response.data directly. So data is { success: true, data: [...] }
            const bookingsList = data.data || data; 
            
            // Sort by createdAt descending
            const sorted = Array.isArray(bookingsList) ? bookingsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
            setBookings(sorted);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Failed to load bookings.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await bookingApi.updateStatus(id, newStatus);
            // Update local state
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
        } catch (err) {
            console.error(err);
            alert("Failed to update status.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this booking?")) return;
        try {
            await bookingApi.delete(id);
            setBookings(prev => prev.filter(b => b.id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to delete booking.");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) return <div className="page"><div className="empty-state">Loading bookings...</div></div>;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h2 className="page-title">{isStaff ? 'All Bookings' : 'My Bookings'}</h2>
                    <p className="page-subtitle">Manage resource reservations and schedules.</p>
                </div>
                <button onClick={() => navigate('/bookings/new')} className="btn primary">
                    + New Booking
                </button>
            </div>

            {error && <div className="error-box">{error}</div>}

            {bookings.length === 0 ? (
                <div className="empty-state card">
                    <div className="empty-state-icon">📅</div>
                    <h3>No bookings found</h3>
                    <p>You haven't made any resource reservations yet.</p>
                </div>
            ) : (
                <div className="ticket-grid">
                    {bookings.map(booking => (
                        <div key={booking.id} className="card ticket-card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="card-header">
                                <span className={`status-badge status-${booking.status === 'APPROVED' ? 'resolved' : booking.status === 'REJECTED' || booking.status === 'CANCELLED' ? 'rejected' : 'pending'}`}>
                                    {booking.status}
                                </span>
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                    #{booking.id}
                                </span>
                            </div>

                            <h3 className="card-title">{booking.resourceName}</h3>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                Booked by: <strong>{booking.userName}</strong>
                            </div>

                            <div className="ticket-meta" style={{ flexGrow: 1 }}>
                                <div className="ticket-meta-item">
                                    <strong>START</strong>
                                    <span>{formatDate(booking.startTime)}</span>
                                </div>
                                <div className="ticket-meta-item">
                                    <strong>END</strong>
                                    <span>{formatDate(booking.endTime)}</span>
                                </div>
                                <div className="ticket-meta-item" style={{ flexBasis: '100%' }}>
                                    <strong>PURPOSE</strong>
                                    <span style={{ display: 'block', marginTop: '4px', whiteSpace: 'pre-wrap' }}>{booking.purpose}</span>
                                </div>
                            </div>

                            <div className="card-actions" style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                                {isStaff && booking.status === 'PENDING' && (
                                    <>
                                        <button onClick={() => handleStatusUpdate(booking.id, 'APPROVED')} className="btn primary" style={{ flex: 1, padding: '6px' }}>Approve</button>
                                        <button onClick={() => handleStatusUpdate(booking.id, 'REJECTED')} className="btn danger" style={{ flex: 1, padding: '6px' }}>Reject</button>
                                    </>
                                )}
                                {(!isStaff && booking.status === 'PENDING') && (
                                    <button onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')} className="btn secondary" style={{ flex: 1, padding: '6px' }}>Cancel Booking</button>
                                )}
                                {isStaff && (
                                    <button onClick={() => handleDelete(booking.id)} className="btn danger" style={{ flexBasis: '100%', padding: '6px', marginTop: '4px' }}>Delete</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BookingListPage;