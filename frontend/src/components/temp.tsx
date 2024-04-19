import React, { useState, useEffect } from 'react';
import FullCalendar, { EventApi, EventInput, ViewClassNameRoot } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import moment from 'moment';
import axios from 'axios';



const RoomScheduler = ({ room_id }: any) => {
    console.log(room_id, "room id from scheduler")
    const [events, setEvents] = useState<EventInput[]>([]);
    const [selectedEvents, setSelectedEvents] = useState<EventInput[]>([]);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [currentView, setCurrentView] = useState<ViewClassNameRoot>('timeGridDay');
    const [calendarKey, setCalendarKey] = useState(0);

    useEffect(() => {
        // Fetch events for the specified room_id
        fetchRoomEvents(room_id);
    }, [room_id]);


    const fetchRoomEvents = async (roomId: string) => {
        try {
            // Make a GET request to the backend API endpoint
            const response = await axios.get(`http://localhost:8787/api/v1/bookings/${roomId}`);
            let events = [];

            // Check if the response data is an array
            if (Array.isArray(response.data)) {
                // If it's an array, map over it
                events = response.data.map((booking: any) => ({
                    id: booking.id,
                    title: booking.title,
                    start: moment().set('date', booking.booking_date).set('hours', booking.start_time / 60).set('minutes', booking.start_time % 60).toDate(),
                    end: moment().set('date', booking.booking_date).set('hours', booking.end_time / 60).set('minutes', booking.end_time % 60).toDate(),
                }));
            } else {
                // If it's not an array, assume it's an object with a 'bookings' property
                const bookings = response.data.bookings || [];
                events = bookings.map((booking: any) => ({
                    id: booking.id,
                    title: booking.title,
                    start: moment().set('date', booking.booking_date).set('hours', booking.start_time / 60).set('minutes', booking.start_time % 60).toDate(),
                    end: moment().set('date', booking.booking_date).set('hours', booking.end_time / 60).set('minutes', booking.end_time % 60).toDate(),
                }));

            }
            console.log("start_time", events[1].start);

            //console.log(events, "events line", response.data);
            // Update the events state with the processed events
            setEvents(events);
            console.log(events);
        } catch (error) {
            console.error('Error fetching room events:', error);
            // Handle the error, e.g., display an error message to the user
        }
    };


    const handleSelectSlot = (info: { date: Date, start: Date; end: Date }) => {
        const newEvent: EventInput = {
            date: parseInt(moment(info.start).format('DD')),
            start: parseInt(moment(info.start).format('HH')) * 60 + parseInt(moment(info.start).format('mm')),
            end: parseInt(moment(info.end).format('HH')) * 60 + parseInt(moment(info.end).format('mm')),
            title: '',
        };
        setSelectedEvents((prevEvents) => [...prevEvents, newEvent]);
    };

    const handleEventTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewEventTitle(event.target.value);
    };

    const handleBookEvents = async () => {
        try {
            const response = await axios.post('http://localhost:8787/api/v1/bookings', {
                room_id,
                booking_date: selectedEvents[0].date, // Assuming only one event is selected
                start_time: selectedEvents[0].start,
                end_time: selectedEvents[0].end,
                title: newEventTitle

            }, { withCredentials: true });
            console.log(selectedEvents)
            // Update events state with the newly created booking
            const bookingData = response.data;
            setEvents((prevEvents) => [...prevEvents, bookingData]);

            // Clear selectedEvents and newEventTitle
            setSelectedEvents([]);
            setNewEventTitle('');
        } catch (error) {
            console.error('Error creating booking:', error);
        }
    };

    const handleDeleteEvent = async (event: EventApi) => {
        try {
            await axios.delete(`http://localhost:8787/api/v1/bookings/${event.id}`);
            setEvents((prevEvents) => prevEvents.filter((e) => e.id !== event.id));

        } catch (err) {

            console.error('Error deleting event:', err);
        }

    };


    const handleViewChange = (viewName: ViewClassNameRoot) => {
        setCurrentView(viewName);
        // Increment the key to force re-render of FullCalendar
        setCalendarKey(calendarKey + 1);
    };
    console.log(selectedEvents, "selected event")

    return (
        <div key={calendarKey}>
            <div className="mb-4">
                <button
                    className={`px-4 py-2 mr-2 ${currentView === 'timeGridDay' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => handleViewChange('timeGridDay')}
                >
                    Day
                </button>
                <button
                    className={`px-4 py-2 mr-2 ${currentView === 'dayGridMonth' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => handleViewChange('dayGridMonth')}
                >
                    Month
                </button>
            </div>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
                initialView={currentView}
                events={events}
                selectable
                selectMirror
                selectHelper
                dayMaxEvents
                weekends={true}
                eventAdd={handleBookEvents}
                eventRemove={handleDeleteEvent}
                select={handleSelectSlot}
                eventClassNames={(event) => (event.title ? 'booked-event' : '')}
                slotDuration="00:30:00"
                height="80vh"
                width="100%"
                slotMinTime="10:00:00"
                slotMaxTime="19:00:00"
            />
            {selectedEvents.length > 0 && (
                <div>
                    <input
                        type="text"
                        placeholder="Enter event title"
                        value={newEventTitle}
                        onChange={handleEventTitleChange}
                    />
                    <button onClick={handleBookEvents} className="ml-10 mt-2 border rounded-lg px-4 py-2 mr-2 bg-green-200">
                        Book
                    </button>
                </div>
            )}
            {events.map((event, index) => (
                <div key={index}>
                    {event.title} ({moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')})
                    <button onClick={() => handleDeleteEvent(event)} className="ml-10 mt-2 border rounded-lg px-4 py-2 mr-2 bg-red-100">
                        Unbook
                    </button>
                </div>
            ))}
        </div>
    );
};

export default RoomScheduler;
