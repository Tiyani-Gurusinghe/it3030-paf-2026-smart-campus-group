import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { bookingApi } from '../../features/bookings/api/bookingApi';
import resourceApi from '../../features/resources/api/resourceApi';
import { useAuthContext } from '../../features/auth/context/AuthContext';

const BLOCKING_STATUSES = ['PENDING', 'APPROVED'];

const getTodayDateInput = () => {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const getTimeFromDateTime = (value) => {
    if (!value) return '';
    return value.includes('T') ? value.split('T')[1].slice(0, 5) : '';
};

const getMinutes = (time) => {
    if (!time) return 0;
    const [hours, minutes] = time.slice(0, 5).split(':').map(Number);
    return hours * 60 + minutes;
};

const getNowMinutes = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
};

const roundUpToHour = (minutes) => Math.ceil(minutes / 60) * 60;

const formatSlotTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const normalizeDateTimeHour = (value) => {
    if (!value || !value.includes('T')) return value;
    const [date, time] = value.split('T');
    return `${date}T${time.slice(0, 2)}:00`;
};

const formatDisplayTime = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

const formatResourceLabel = (value) => value?.replaceAll('_', ' ') || '';

const BookingFormPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const resourceIdParam = searchParams.get('resourceId');
    const resourceNameParam = searchParams.get('resourceName');

    const { user } = useAuthContext();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [resources, setResources] = useState([]);
    const [selectedResource, setSelectedResource] = useState(null);
    const [resourceBookings, setResourceBookings] = useState([]);
    const [calendarDate, setCalendarDate] = useState(getTodayDateInput);
    const [calendarLoading, setCalendarLoading] = useState(false);
    const [availableQuantity, setAvailableQuantity] = useState(null);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [alternativeResources, setAlternativeResources] = useState([]);
    const [alternativesLoading, setAlternativesLoading] = useState(false);

    const [formData, setFormData] = useState({
        resourceId: resourceIdParam || '',
        startTime: '',
        endTime: '',
        quantity: '1',
        purpose: ''
    });

    useEffect(() => {
        let ignore = false;

        resourceApi.getAllResources()
            .then(data => {
                if (ignore) return;
                const bookable = data.filter(r =>
                    r.status === 'ACTIVE' && ['SPACE', 'EQUIPMENT', 'UTILITY'].includes(r.category)
                );
                setResources(bookable);
            })
            .catch(err => console.error("Failed to fetch resources", err));

        if (resourceIdParam) {
            resourceApi.getResourceById(resourceIdParam)
                .then((resource) => {
                    if (!ignore) setSelectedResource(resource);
                })
                .catch(err => console.error("Failed to fetch selected resource", err));
        }

        return () => {
            ignore = true;
        };
    }, [resourceIdParam]);

    useEffect(() => {
        if (!resourceIdParam) return;
        setFormData(prev => ({ ...prev, resourceId: resourceIdParam }));
    }, [resourceIdParam]);

    useEffect(() => {
        if (!formData.resourceId || resourceIdParam) return;
        const resource = resources.find(r => String(r.id) === String(formData.resourceId));
        setSelectedResource(resource || null);
    }, [formData.resourceId, resourceIdParam, resources]);

    useEffect(() => {
        if (!formData.resourceId) {
            setResourceBookings([]);
            return;
        }

        let ignore = false;
        setCalendarLoading(true);

        bookingApi.getByResourceId(formData.resourceId)
            .then((response) => {
                if (ignore) return;
                const bookings = response?.data?.data || response?.data || [];
                setResourceBookings(Array.isArray(bookings) ? bookings : []);
            })
            .catch((err) => {
                if (!ignore) {
                    console.error("Failed to fetch resource bookings", err);
                    setResourceBookings([]);
                }
            })
            .finally(() => {
                if (!ignore) setCalendarLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, [formData.resourceId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const nextValue = name === 'startTime' || name === 'endTime'
            ? normalizeDateTimeHour(value)
            : value;

        setFormData(prev => {
            const next = { ...prev, [name]: nextValue };
            if (name === 'startTime' && nextValue && next.endTime) {
                const start = new Date(nextValue);
                const end = new Date(next.endTime);
                const maxEnd = new Date(start.getTime() + 2 * 60 * 60 * 1000);
                if (end <= start || end > maxEnd) {
                    next.endTime = `${nextValue.split('T')[0]}T${formatSlotTime(getMinutes(getTimeFromDateTime(nextValue)) + 120)}`;
                }
            }
            if (name === 'endTime' && next.startTime && nextValue) {
                const start = new Date(next.startTime);
                const end = new Date(nextValue);
                const maxEnd = new Date(start.getTime() + 2 * 60 * 60 * 1000);
                if (end > maxEnd) {
                    next.endTime = `${next.startTime.split('T')[0]}T${formatSlotTime(getMinutes(getTimeFromDateTime(next.startTime)) + 120)}`;
                }
            }
            return next;
        });

        if (name === 'startTime' && nextValue) {
            setCalendarDate(nextValue.split('T')[0]);
        }
    };

    const handleQuantityChange = (e) => {
        const { value } = e.target;
        if (value !== '' && !/^\d+$/.test(value)) return;
        setFormData(prev => ({ ...prev, quantity: value }));
    };

    const isInventory = selectedResource && ['EQUIPMENT', 'UTILITY'].includes(selectedResource.category);
    const totalQuantity = selectedResource?.capacity || 1;
    const maxQuantity = availableQuantity ?? totalQuantity;
    const availabilityStart = selectedResource?.availableFrom?.slice(0, 5) || '08:00';
    const availabilityEnd = selectedResource?.availableTo?.slice(0, 5) || '18:00';
    const dayStart = getMinutes(availabilityStart);
    const dayEnd = Math.max(getMinutes(availabilityEnd), dayStart + 60);
    const dayDuration = dayEnd - dayStart;
    const todayDate = getTodayDateInput();
    const isPastCalendarDate = calendarDate < todayDate;
    const bookableStart = calendarDate === todayDate
        ? Math.min(Math.max(roundUpToHour(getNowMinutes()), dayStart), dayEnd)
        : dayStart;
    const selectedDateBookings = resourceBookings
        .filter((booking) => BLOCKING_STATUSES.includes(booking.status))
        .filter((booking) => booking.startTime?.slice(0, 10) === calendarDate)
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    const bookingBlocks = selectedDateBookings.map((booking) => {
        const start = Math.max(getMinutes(getTimeFromDateTime(booking.startTime)), dayStart);
        const end = Math.min(getMinutes(getTimeFromDateTime(booking.endTime)), dayEnd);
        return {
            ...booking,
            start,
            end,
            left: `${Math.max(((start - dayStart) / dayDuration) * 100, 0)}%`,
            width: `${Math.max(((end - start) / dayDuration) * 100, 2)}%`,
        };
    }).filter((booking) => booking.end > booking.start);
    const getSlotRemainingQuantity = (start, end) => {
        if (!isInventory) return null;

        let peakBookedQuantity = 0;
        for (let cursor = start; cursor < end; cursor += 60) {
            const segmentEnd = Math.min(cursor + 60, end);
            const segmentBookedQuantity = selectedDateBookings.reduce((total, booking) => {
                const bookingStart = getMinutes(getTimeFromDateTime(booking.startTime));
                const bookingEnd = getMinutes(getTimeFromDateTime(booking.endTime));
                const overlapsSegment = bookingStart < segmentEnd && bookingEnd > cursor;
                return overlapsSegment ? total + (Number(booking.quantity) || 1) : total;
            }, 0);
            peakBookedQuantity = Math.max(peakBookedQuantity, segmentBookedQuantity);
        }

        return Math.max(totalQuantity - peakBookedQuantity, 0);
    };
    const freeSlots = (() => {
        if (isPastCalendarDate) return [];
        const slots = [];

        for (let start = roundUpToHour(bookableStart); start < dayEnd; start += 60) {
            const end = Math.min(start + 120, dayEnd);
            if (end - start < 60) continue;

            if (isInventory) {
                const remaining = getSlotRemainingQuantity(start, end);
                if (remaining > 0) {
                    slots.push({ start, end, remaining });
                }
                continue;
            }

            const isOccupied = bookingBlocks.some((booking) => booking.start < end && booking.end > start);
            if (!isOccupied) {
                slots.push({ start, end });
            }
        }

        return slots;
    })();

    useEffect(() => {
        if (!selectedResource || !formData.resourceId || !formData.startTime || !formData.endTime) {
            setAvailableQuantity(null);
            return;
        }

        let ignore = false;
        setAvailabilityLoading(true);

        bookingApi.getAvailableQuantity(formData.resourceId, {
            startTime: formData.startTime,
            endTime: formData.endTime,
        })
            .then((response) => {
                if (ignore) return;
                const value = response?.data?.data ?? response?.data;
                setAvailableQuantity(typeof value === 'number' ? value : null);
            })
            .catch((err) => {
                if (!ignore) {
                    console.error("Failed to fetch available quantity", err);
                    setAvailableQuantity(null);
                }
            })
            .finally(() => {
                if (!ignore) setAvailabilityLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, [formData.endTime, formData.resourceId, formData.startTime, selectedResource]);

    useEffect(() => {
        if (!isInventory || availableQuantity == null) return;
        if (Number(formData.quantity) > availableQuantity) {
            setFormData(prev => ({ ...prev, quantity: String(availableQuantity || 1) }));
        }
    }, [availableQuantity, formData.quantity, isInventory]);

    const handleCalendarDateChange = (e) => {
        const nextDate = e.target.value;
        setCalendarDate(nextDate);
        setFormData(prev => ({
            ...prev,
            startTime: prev.startTime ? `${nextDate}T${getTimeFromDateTime(prev.startTime)}` : prev.startTime,
            endTime: prev.endTime ? `${nextDate}T${getTimeFromDateTime(prev.endTime)}` : prev.endTime,
        }));
    };

    const applyFreeSlot = (slot) => {
        if (isPastCalendarDate || slot.start < bookableStart) return;
        setFormData(prev => ({
            ...prev,
            startTime: `${calendarDate}T${formatSlotTime(slot.start)}`,
            endTime: `${calendarDate}T${formatSlotTime(slot.end)}`,
        }));
    };

    const selectedQuantity = isInventory ? Number(formData.quantity) || 1 : 1;
    const selectedSlotUnavailable = Boolean(
        selectedResource &&
        formData.startTime &&
        formData.endTime &&
        availableQuantity != null &&
        availableQuantity < selectedQuantity
    );

    useEffect(() => {
        if (!selectedSlotUnavailable || !selectedResource || resources.length === 0) {
            setAlternativeResources([]);
            return;
        }

        let ignore = false;
        setAlternativesLoading(true);

        const startMinutes = getMinutes(getTimeFromDateTime(formData.startTime));
        const endMinutes = getMinutes(getTimeFromDateTime(formData.endTime));
        const candidateResources = resources
            .filter((resource) => String(resource.id) !== String(selectedResource.id))
            .filter((resource) => resource.category === selectedResource.category)
            .filter((resource) => resource.type === selectedResource.type)
            .filter((resource) => {
                const resourceStart = getMinutes(resource.availableFrom?.slice(0, 5) || '08:00');
                const resourceEnd = getMinutes(resource.availableTo?.slice(0, 5) || '18:00');
                return resourceStart <= startMinutes && resourceEnd >= endMinutes;
            })
            .map((resource) => {
                let score = 0;
                if (resource.location && selectedResource.location && resource.location === selectedResource.location) score += 30;
                if (resource.floor && selectedResource.floor && resource.floor === selectedResource.floor) score += 20;
                if ((resource.capacity || 0) >= (selectedResource.capacity || 0)) score += 8;
                return { resource, score };
            })
            .sort((a, b) => b.score - a.score || a.resource.name.localeCompare(b.resource.name))
            .slice(0, 8);

        Promise.all(candidateResources.map(async ({ resource, score }) => {
            try {
                const response = await bookingApi.getAvailableQuantity(resource.id, {
                    startTime: formData.startTime,
                    endTime: formData.endTime,
                });
                const remaining = response?.data?.data ?? response?.data ?? 0;
                return { ...resource, remaining, score };
            } catch (err) {
                console.error("Failed to check alternative availability", err);
                return null;
            }
        }))
            .then((results) => {
                if (ignore) return;
                const neededQuantity = selectedQuantity;
                const availableAlternatives = results
                    .filter(Boolean)
                    .filter((resource) => Number(resource.remaining) >= neededQuantity)
                    .sort((a, b) => b.score - a.score || Number(b.remaining) - Number(a.remaining))
                    .slice(0, 3);
                setAlternativeResources(availableAlternatives);
            })
            .finally(() => {
                if (!ignore) setAlternativesLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, [
        formData.endTime,
        formData.startTime,
        resources,
        selectedQuantity,
        selectedResource,
        selectedSlotUnavailable,
    ]);

    const applyAlternativeResource = (resource) => {
        setSelectedResource(resource);
        setAvailableQuantity(Number(resource.remaining) || null);
        setFormData(prev => ({
            ...prev,
            resourceId: String(resource.id),
            quantity: isInventory ? String(Math.min(Number(prev.quantity) || 1, Number(resource.remaining) || 1)) : prev.quantity,
        }));

        if (resourceIdParam) {
            navigate(`/bookings/new?resourceId=${resource.id}&resourceName=${encodeURIComponent(resource.name)}`, { replace: true });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.resourceId || !formData.startTime || !formData.endTime || !formData.purpose) {
            setError("Please fill in all fields.");
            return;
        }

        if (!user || !user.id) {
            setError("User not authenticated.");
            return;
        }

        const start = new Date(formData.startTime);
        const end = new Date(formData.endTime);
        const durationMinutes = (end - start) / 60000;

        if (getTimeFromDateTime(formData.startTime).slice(3, 5) !== '00' || getTimeFromDateTime(formData.endTime).slice(3, 5) !== '00') {
            setError("Bookings must start and end on whole hours.");
            return;
        }

        if (durationMinutes <= 0 || durationMinutes > 120) {
            setError("Bookings must be between 1 and 2 hours.");
            return;
        }

        if (isInventory) {
            const quantity = Number(formData.quantity);
            if (!quantity || quantity < 1) {
                setError("Please enter a valid quantity.");
                return;
            }
            if (quantity > maxQuantity) {
                setError(`Quantity cannot exceed available quantity (${maxQuantity}).`);
                return;
            }
        }

        const payload = {
            userId: user.id,
            resourceId: formData.resourceId,
            startTime: formData.startTime,
            endTime: formData.endTime,
            quantity: isInventory ? Number(formData.quantity) : 1,
            purpose: formData.purpose,
            bookingDate: formData.startTime.split("T")[0]
        };

        try {
            setLoading(true);
            await bookingApi.create(payload);
            navigate('/bookings'); // Redirect to bookings list
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("Failed to create booking. It might conflict with an existing one.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <h2 className="page-title">New Booking</h2>
                <p className="page-subtitle">Reserve a campus resource for your activities.</p>
            </div>

            {error && <div className="error-box">{error}</div>}

            <div className="booking-create-layout">
            <div className="card booking-form-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Resource</label>
                        {resourceIdParam ? (
                            <div style={{ padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                                <strong>{resourceNameParam || 'Selected Resource'}</strong>
                                {selectedResource && (
                                    <div style={{ marginTop: '4px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                                        {selectedResource.category} · {selectedResource.type?.replace('_', ' ')}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <select 
                                name="resourceId" 
                                value={formData.resourceId} 
                                onChange={handleChange}
                                className="filter-input" 
                                style={{ width: '100%', padding: '10px' }}
                                required
                            >
                                <option value="">-- Select a Resource --</option>
                                {resources.map(r => (
                                    <option key={r.id} value={r.id}>
                                        {r.name} ({r.category} · {r.type.replace('_', ' ')})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {isInventory && (
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                Quantity
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleQuantityChange}
                                className="filter-input"
                                style={{ width: '100%', padding: '10px' }}
                                required
                            />
                            <p className="field-hint" style={{ marginTop: '6px' }}>
                                {availabilityLoading
                                    ? 'Checking available quantity for selected slot...'
                                    : formData.startTime && formData.endTime
                                        ? `Available inventory count for selected slot: ${maxQuantity} of ${totalQuantity}`
                                        : `Total inventory count: ${totalQuantity}. Select a time slot to see availability.`}
                            </p>
                        </div>
                    )}

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Start Time</label>
                        <input 
                            type="datetime-local" 
                            name="startTime" 
                            value={formData.startTime} 
                            onChange={handleChange} 
                            className="filter-input"
                            style={{ width: '100%', padding: '10px' }}
                            step="3600"
                            required
                        />
                        <p className="field-hint" style={{ marginTop: '6px' }}>Whole-hour bookings only. Maximum duration is 2 hours.</p>
                    </div>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>End Time</label>
                        <input 
                            type="datetime-local" 
                            name="endTime" 
                            value={formData.endTime} 
                            onChange={handleChange} 
                            className="filter-input"
                            style={{ width: '100%', padding: '10px' }}
                            step="3600"
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '24px' }}>
                        <label className="form-label" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Purpose / Remarks</label>
                        <textarea 
                            name="purpose" 
                            value={formData.purpose} 
                            onChange={handleChange} 
                            className="filter-input"
                            style={{ width: '100%', padding: '10px', minHeight: '100px', resize: 'vertical' }}
                            placeholder="Briefly describe the purpose of this booking..."
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => navigate(-1)} className="btn secondary">Cancel</button>
                        <button type="submit" disabled={loading} className="btn primary">
                            {loading ? 'Submitting...' : 'Confirm Booking'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="card booking-calendar-card">
                <div className="booking-calendar-header">
                    <div>
                        <h3>Daily Availability</h3>
                        <p>{selectedResource ? selectedResource.name : 'Select a resource to view its day schedule.'}</p>
                    </div>
                    <input
                        type="date"
                        value={calendarDate}
                        onChange={handleCalendarDateChange}
                        className="filter-input"
                    />
                </div>

                {!selectedResource ? (
                    <div className="booking-calendar-empty">Choose a resource to show occupied and free slots.</div>
                ) : calendarLoading ? (
                    <div className="booking-calendar-empty">Loading schedule...</div>
                ) : (
                    <>
                        <div className="booking-calendar-window">
                            <span>{availabilityStart}</span>
                            <span>{availabilityEnd}</span>
                        </div>
                        <div className="booking-day-timeline">
                            <div className="booking-day-free" />
                            {bookingBlocks.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="booking-day-block"
                                    style={{ left: booking.left, width: booking.width }}
                                    title={`${formatDisplayTime(booking.startTime)} - ${formatDisplayTime(booking.endTime)}`}
                                >
                                    <strong>{booking.status}</strong>
                                    <span>{formatDisplayTime(booking.startTime)} - {formatDisplayTime(booking.endTime)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="booking-calendar-legend">
                            <span><i className="legend-free" /> Free</span>
                            <span><i className="legend-booked" /> Occupied</span>
                        </div>

                        <div className="booking-free-slots">
                            <h4>Free slots</h4>
                            {freeSlots.length === 0 ? (
                                <p>No free slots for this day.</p>
                            ) : (
                                <div>
                                    {freeSlots.map((slot) => (
                                        <button
                                            key={`${slot.start}-${slot.end}`}
                                            type="button"
                                            className="booking-free-slot"
                                            onClick={() => applyFreeSlot(slot)}
                                        >
                                            {formatSlotTime(slot.start)} - {formatSlotTime(slot.end)}
                                            {isInventory && slot.remaining != null && (
                                                <span>{slot.remaining} left</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedSlotUnavailable && (
                            <div className="booking-alternatives">
                                <div>
                                    <h4>Nearby alternatives</h4>
                                    <p>Similar resources available for the selected time.</p>
                                </div>

                                {alternativesLoading ? (
                                    <p className="booking-alternatives-muted">Checking matching resources...</p>
                                ) : alternativeResources.length === 0 ? (
                                    <p className="booking-alternatives-muted">No matching alternatives are free for this slot.</p>
                                ) : (
                                    <div className="booking-alternative-list">
                                        {alternativeResources.map((resource) => (
                                            <button
                                                key={resource.id}
                                                type="button"
                                                className="booking-alternative-card"
                                                onClick={() => applyAlternativeResource(resource)}
                                            >
                                                <span>
                                                    <strong>{resource.name}</strong>
                                                    <small>
                                                        {formatResourceLabel(resource.type)}
                                                        {resource.floor ? ` · Floor ${resource.floor}` : ''}
                                                        {resource.location ? ` · ${resource.location}` : ''}
                                                    </small>
                                                </span>
                                                <em>{Number(resource.remaining)} available</em>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedDateBookings.length > 0 && (
                            <div className="booking-day-list">
                                <h4>Bookings on this day</h4>
                                {selectedDateBookings.map((booking) => (
                                    <div key={booking.id} className="booking-day-list-item">
                                        <span>{formatDisplayTime(booking.startTime)} - {formatDisplayTime(booking.endTime)}</span>
                                        <strong>{booking.status}</strong>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            </div>
        </div>
    );
};

export default BookingFormPage;
