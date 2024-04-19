import React, { useState, useEffect } from 'react';
import FullCalendar, { EventApi, EventInput, ViewClassNameRoot } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import moment from 'moment';

const RoomScheduler = () => {
    const [events, setEvents] = useState<EventInput[]>([]);
    const [selectedEvents, setSelectedEvents] = useState<EventInput[]>([]);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [currentView, setCurrentView] = useState<ViewClassNameRoot>('timeGridDay');
    const [calendarKey, setCalendarKey] = useState(0);


    const handleSelectSlot = (info: { start: Date; end: Date }) => {
        const newEvent: EventInput = {
            start: info.start,
            end: info.end,
            title: '',
        };
        setSelectedEvents((prevEvents) => [...prevEvents, newEvent]);
        console.log(newEvent)
    };

    const handleEventTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewEventTitle(event.target.value);
    };

    const handleBookEvents = () => {
        const newEvents = selectedEvents.map((event) => ({
            ...event,
            title: event.title || newEventTitle,
        }));
        setEvents((prevEvents) => [...prevEvents, ...newEvents]);
        setSelectedEvents([]);
        setNewEventTitle('');
    };

    const handleDeleteEvent = (event: EventApi) => {
        setEvents((prevEvents) => prevEvents.filter((e) => e !== event));
    };

    const handleViewChange = (viewName: ViewClassNameRoot) => {
        setCurrentView(viewName);
        // Increment the key to force re-render of FullCalendar
        setCalendarKey(calendarKey + 1);
    };

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
                weekends={false}
                eventAdd={handleBookEvents}
                eventRemove={handleDeleteEvent}
                select={handleSelectSlot}
                eventClassNames={(event) => (event.title ? 'booked-event' : '')}
                slotDuration="00:30:00"
                height="80vh"
                width="100%"
                slotMinTime="10:00:00" // Minimum visible or selectable time (10 am)
                slotMaxTime="19:00:00" // Maximum visible or selectable time (7 pm)
            />
            {selectedEvents.length > 0 && (
                <div>
                    <input
                        type="text"
                        placeholder="Enter event title"
                        value={newEventTitle}
                        onChange={handleEventTitleChange}
                    />
                    <button onClick={handleBookEvents} className='ml-10 mt-2 border rounded-lg px-4 py-2 mr-2 bg-green-200'>Book Events</button>
                </div>
            )}
            {events.map((event, index) => (
                <div key={index}>
                    {event.title} ({moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')})
                    <button onClick={() => handleDeleteEvent(event)} className='ml-10 mt-2 border rounded-lg px-4 py-2 mr-2 bg-red-100'>Unbook</button>
                </div>
            ))}
        </div>
    );
};

export default RoomScheduler;
