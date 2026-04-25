import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '../../features/bookings/api/bookingApi';
import { useAuthContext } from '../../features/auth/context/AuthContext';

const BookingListPage = () => {
    const navigate = useNavigate();
    const { user, isAdmin } = useAuthContext();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [editingBooking, setEditingBooking] = useState(null);
    const [editForm, setEditForm] = useState({
        purpose: '',
        startTime: '',
        endTime: '',
    });

    const loadBookings = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = isAdmin
                ? await bookingApi.getAll()
                : await bookingApi.getByUserId(user.id);
            const bookingsList = data?.data?.data || data?.data || data || [];
            
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
    }, [isAdmin, user]);

    useEffect(() => {
        loadBookings();
    }, [loadBookings]);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            setUpdatingId(id);
            const response = await bookingApi.updateStatus(id, newStatus);
            const updatedBooking = response?.data?.data || response?.data || response;
            setBookings(prev => prev.map(b => b.id === id ? { ...b, ...updatedBooking, status: newStatus } : b));
        } catch (err) {
            console.error(err);
            alert("Failed to update status.");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this booking?")) return;
        try {
            setDeletingId(id);
            await bookingApi.delete(id);
            setBookings(prev => prev.filter(b => b.id !== id));
        } catch (err) {
            console.error(err);
            alert("Failed to delete booking.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleUpdate = (booking) => {
        const toLocalDateTimeInput = (value) => {
            if (!value) return '';
            const date = new Date(value);
            const pad = (num) => String(num).padStart(2, '0');
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
        };

        setEditingBooking(booking);
        setEditForm({
            purpose: booking.purpose || '',
            startTime: toLocalDateTimeInput(booking.startTime),
            endTime: toLocalDateTimeInput(booking.endTime),
        });
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const closeEditModal = () => {
        setEditingBooking(null);
        setEditForm({
            purpose: '',
            startTime: '',
            endTime: '',
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        if (!editingBooking) return;

        const formatDateTime = (value) => {
            if (!value) return value;
            return value.length === 16 ? `${value}:00` : value;
        };

        const getBookingDate = (value) => {
            if (!value) return value;
            return value.slice(0, 10);
        };

        const payload = {
            resourceId: editingBooking.resourceId,
            userId: editingBooking.userId,
            purpose: editForm.purpose.trim(),
            bookingDate: getBookingDate(editForm.startTime),
            startTime: formatDateTime(editForm.startTime),
            endTime: formatDateTime(editForm.endTime),
        };

        try {
            setUpdatingId(editingBooking.id);

            let updatedBooking;

            if (typeof bookingApi.update === 'function') {
                updatedBooking = await bookingApi.update(editingBooking.id, payload);
                updatedBooking = updatedBooking?.data?.data || updatedBooking?.data || updatedBooking;
            } else {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/bookings/${editingBooking.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error('Failed to update booking');
                }

                const result = await response.json();
                updatedBooking = result?.data || result;
            }

            setBookings(prev => prev.map(b => b.id === editingBooking.id ? { ...b, ...updatedBooking } : b));
            alert('Booking updated successfully.');
            closeEditModal();
        } catch (err) {
            console.error(err);
            console.error("backend response:", err.response?.data);
            alert('Failed to update booking.');
        } finally {
            setUpdatingId(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusClass = (status) => {
        if (status === 'APPROVED' || status === 'COMPLETED') return 'resolved';
        if (status === 'REJECTED' || status === 'CANCELLED') return 'rejected';
        return 'pending';
    };

    const getStatusLabel = (status) => {
        if (status === 'REJECTED') return 'DECLINED';
        return status;
    };

    if (loading) return <div className="page"><div className="empty-state">Loading bookings...</div></div>;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h2 className="page-title">{isAdmin ? 'All Bookings' : 'My Bookings'}</h2>
                    <p className="page-subtitle">
                        {isAdmin
                            ? 'Review every campus reservation, approve pending requests, decline conflicts, or remove invalid bookings.'
                            : 'Manage your resource reservations and schedules.'}
                    </p>
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
                        <div key={booking.id} className="card ticket-card booking-card">
                            <div className="booking-card-header">
                                <span className={`status-badge status-${getStatusClass(booking.status)}`}>
                                    {getStatusLabel(booking.status)}
                                </span>
                                <span className="booking-card-id">#{booking.id}</span>
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
                                {isAdmin && booking.status === 'PENDING' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusUpdate(booking.id, 'APPROVED')}
                                            className="btn primary"
                                            style={{ flex: 1, padding: '6px' }}
                                            disabled={updatingId === booking.id}
                                        >
                                            {updatingId === booking.id ? 'Updating...' : 'Approve'}
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(booking.id, 'REJECTED')}
                                            className="btn danger"
                                            style={{ flex: 1, padding: '6px' }}
                                            disabled={updatingId === booking.id}
                                        >
                                            {updatingId === booking.id ? 'Updating...' : 'Decline'}
                                        </button>
                                    </>
                                )}

                                {!isAdmin && booking.status === 'PENDING' && (
                                    <button
                                        onClick={() => handleUpdate(booking)}
                                        className="btn secondary"
                                        style={{ flex: 1, padding: '6px' }}
                                        disabled={updatingId === booking.id}
                                    >
                                        {updatingId === booking.id ? 'Updating...' : 'Update'}
                                    </button>
                                )}

                                {!isAdmin && booking.status === 'PENDING' && (
                                    <button onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')} className="btn secondary" style={{ flex: 1, padding: '6px' }}>Cancel Booking</button>
                                )}

                                {(isAdmin || booking.status === 'PENDING' || booking.status === 'CANCELLED') && (
                                    <button
                                        onClick={() => handleDelete(booking.id)}
                                        className="btn danger"
                                        style={{ flexBasis: '100%', padding: '6px', marginTop: '4px' }}
                                        disabled={deletingId === booking.id}
                                    >
                                        {deletingId === booking.id ? 'Deleting...' : 'Delete'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editingBooking && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '16px',
                    }}
                >
                    <div
                        className="card"
                        style={{
                            width: '100%',
                            maxWidth: '500px',
                            padding: '24px',
                            borderRadius: '12px',
                            background: 'white',
                        }}
                    >
                        <h3 style={{ marginBottom: '16px' }}>Update Booking</h3>

                        <form onSubmit={handleEditSubmit}>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                                    Resource
                                </label>
                                <input
                                    type="text"
                                    value={editingBooking.resourceName || ''}
                                    disabled
                                    style={{ width: '100%', padding: '10px' }}
                                />
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                                    Purpose
                                </label>
                                <input
                                    type="text"
                                    name="purpose"
                                    value={editForm.purpose}
                                    onChange={handleEditFormChange}
                                    required
                                    style={{ width: '100%', padding: '10px' }}
                                />
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                                    Start Time
                                </label>
                                <input
                                    type="datetime-local"
                                    name="startTime"
                                    value={editForm.startTime}
                                    onChange={handleEditFormChange}
                                    required
                                    style={{ width: '100%', padding: '10px' }}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                                    End Time
                                </label>
                                <input
                                    type="datetime-local"
                                    name="endTime"
                                    value={editForm.endTime}
                                    onChange={handleEditFormChange}
                                    required
                                    style={{ width: '100%', padding: '10px' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="btn secondary"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn primary"
                                    disabled={updatingId === editingBooking.id}
                                >
                                    {updatingId === editingBooking.id ? 'Updating...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingListPage;
