import React, { useState, useMemo, useEffect } from 'react';
import { CALENDAR_EVENTS, MOCK_TESTS } from '../../constants.ts';
import type { CalendarEvent, Student, MockTest } from '../../types.ts';
import { useStudent } from '../StudentPortalPage.tsx';
import { getItems } from '../../services/dataService.ts';

const eventTypeConfig: { [key in CalendarEvent['type']]: { label: string; color: string; filterColor: string } } = {
    class: { label: 'Class', color: 'bg-blue-500', filterColor: 'bg-blue-500' },
    deadline: { label: 'Deadline', color: 'bg-yellow-500', filterColor: 'bg-yellow-500' },
    exam: { label: 'Exam', color: 'bg-brand-red', filterColor: 'bg-brand-red' },
};

// Helper to get YYYY-MM-DD from a Date object in local timezone
const getLocalDateString = (d: Date): string => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const AgendaItem: React.FC<{ event: CalendarEvent }> = ({ event }) => (
    <div className="flex items-start p-3 bg-gray-50 rounded-lg">
        <div className={`w-3 h-3 rounded-full mt-1.5 mr-4 flex-shrink-0 ${eventTypeConfig[event.type].color}`}></div>
        <div className="flex-grow">
            <p className="font-semibold text-gray-800">{event.title}</p>
            <p className="text-sm text-gray-500">{event.paper}</p>
        </div>
        <div className="text-right flex-shrink-0">
            <p className="font-bold text-sm text-brand-dark">{event.startTime || 'All Day'}</p>
            {event.endTime && <p className="text-xs text-gray-500">to {event.endTime}</p>}
        </div>
    </div>
);


const SchedulePage: React.FC = () => {
    const { student } = useStudent();
    const [view, setView] = useState<'month' | 'agenda'>('month');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [filters, setFilters] = useState({
        class: true,
        deadline: true,
        exam: true,
    });
    
    // State for events from the calendar management
    const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => getItems('calendarEvents', CALENDAR_EVENTS));
    // State for events derived from mock tests
    const [mockTestEvents, setMockTestEvents] = useState<CalendarEvent[]>([]);

    // Effect to load and listen for changes to both event sources
    useEffect(() => {
        const loadAndSetEvents = () => {
            // Load calendar events
            setCalendarEvents(getItems('calendarEvents', CALENDAR_EVENTS));

            // Load and transform mock tests
            const mockTests = getItems<MockTest[]>('mockTests', MOCK_TESTS);
            const testEvents: CalendarEvent[] = mockTests
                .filter(test => test.status === 'Published' && test.scheduledStartTime)
                .map(test => {
                    const startTime = new Date(test.scheduledStartTime!);
                    return {
                        id: `test-${test.id}`,
                        date: getLocalDateString(startTime),
                        title: `Mock Test: ${test.title}`,
                        type: 'exam',
                        startTime: startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                        paper: test.paper,
                    };
                });
            setMockTestEvents(testEvents);
        };
        
        loadAndSetEvents(); // Initial load

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'calendarEvents' || e.key === 'mockTests') {
                loadAndSetEvents();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Memo to combine all events
    const allEvents = useMemo(() => {
        const calendarEventIds = new Set(calendarEvents.map(e => e.id));
        const uniqueMockTestEvents = mockTestEvents.filter(e => !calendarEventIds.has(e.id));
        return [...calendarEvents, ...uniqueMockTestEvents];
    }, [calendarEvents, mockTestEvents]);

    const handleFilterChange = (type: CalendarEvent['type']) => {
        setFilters(prev => ({ ...prev, [type]: !prev[type] }));
    };
    
    const filteredEvents = useMemo(() => {
        if (!student) return [];
        const studentPaperCodes = new Set(student.enrolledPapers); // e.g. ['FR', 'AA']

        return allEvents
            .filter(event => {
                if (!event.paper) return false; // Only show events tied to a paper
                const eventPaperCode = event.paper.split(':')[0].trim();
                return studentPaperCodes.has(eventPaperCode);
            })
            .filter(event => filters[event.type]);
    }, [filters, allEvents, student]);

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(endOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const days = [];
    let day = new Date(startDate);

    while (day <= endDate) {
        days.push(new Date(day));
        day.setDate(day.getDate() + 1);
    }
    
    const isSameDay = (d1: Date, d2: Date) => d1.toDateString() === d2.toDateString();
    const isToday = (d: Date) => isSameDay(d, new Date());

    const changeMonth = (offset: number) => {
        setCurrentDate(current => {
            const newDate = new Date(current);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };

    const goToToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDate(today);
    };
    
    const selectedDayEvents = filteredEvents
        .filter(event => event.date === getLocalDateString(selectedDate))
        .sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));
        
    const agendaEvents = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thirtyDaysFromNow = new Date(today);
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        return filteredEvents
            .filter(event => {
                const eventDate = new Date(event.date + 'T00:00:00'); // Treat as local time to avoid timezone shift
                return eventDate >= today && eventDate <= thirtyDaysFromNow;
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));
    }, [filteredEvents]);
    
    const groupedAgendaEvents = agendaEvents.reduce((acc, event) => {
        const date = event.date;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(event);
        return acc;
    }, {} as Record<string, CalendarEvent[]>);

    if (!student) {
        return <div>Loading schedule...</div>;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-4xl font-bold text-brand-dark">My Schedule</h1>
                <div className="flex items-center gap-2 p-1 bg-gray-200 rounded-lg">
                    <button onClick={() => setView('month')} className={`px-4 py-1.5 text-sm font-semibold rounded-md ${view === 'month' ? 'bg-white shadow' : 'text-gray-600'}`}>Month</button>
                    <button onClick={() => setView('agenda')} className={`px-4 py-1.5 text-sm font-semibold rounded-md ${view === 'agenda' ? 'bg-white shadow' : 'text-gray-600'}`}>Agenda</button>
                </div>
            </div>
            
             <div className="bg-white p-6 rounded-lg shadow-md">
                 <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => changeMonth(-1)} className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors" aria-label="Previous month">&larr;</button>
                        <h2 className="text-2xl font-bold text-brand-dark text-center w-48">
                            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={() => changeMonth(1)} className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors" aria-label="Next month">&rarr;</button>
                        <button onClick={goToToday} className="px-3 py-2 text-sm font-semibold border rounded-md hover:bg-gray-100 transition-colors">Today</button>
                    </div>
                     <div className="flex items-center gap-4 mt-4 sm:mt-0">
                        {Object.entries(eventTypeConfig).map(([type, { label, filterColor }]) => (
                            <label key={type} className="flex items-center text-sm cursor-pointer">
                                <input type="checkbox" checked={filters[type as CalendarEvent['type']]} onChange={() => handleFilterChange(type as CalendarEvent['type'])} className={`h-4 w-4 rounded border-gray-300 focus:ring-transparent ${filterColor.replace('bg-','text-')}`}/>
                                <span className="ml-2 text-gray-700">{label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {view === 'month' ? (
                     <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                        <div className="lg:col-span-2">
                             <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-600 mb-2">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="py-2">{d}</div>)}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {days.map((d, i) => {
                                    const isCurrentMonth = d.getMonth() === currentDate.getMonth();
                                    const dateStr = getLocalDateString(d);
                                    const dayEvents = filteredEvents.filter(e => e.date === dateStr);
                                    const isSelected = isSameDay(d, selectedDate);

                                    return (
                                        <div 
                                            key={i}
                                            onClick={() => setSelectedDate(d)}
                                            className={`h-24 sm:h-28 border rounded-md flex flex-col overflow-hidden cursor-pointer transition-all duration-200 ${
                                                isSelected ? 'bg-red-100 border-brand-red scale-105 shadow-lg z-10' : 
                                                isToday(d) ? 'bg-red-50' : 
                                                isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                            }`}
                                        >
                                            <span className={`font-bold text-xs sm:text-base p-1 sm:p-2 ${isCurrentMonth ? 'text-gray-800' : 'text-gray-400'}`}>
                                                {d.getDate()}
                                            </span>
                                            <div className="flex-grow overflow-hidden px-1 space-y-1">
                                                {dayEvents.slice(0, 3).map((event) => (
                                                    <div key={event.id} className={`w-full h-1.5 rounded-full ${eventTypeConfig[event.type].color}`}></div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-8 lg:mt-0">
                            <div className="sticky top-10">
                                <h3 className="text-xl font-bold text-brand-dark border-b pb-2 mb-4">
                                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </h3>
                                 <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                                    {selectedDayEvents.length > 0 ? (
                                        selectedDayEvents.map(event => <AgendaItem key={event.id} event={event} />)
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">No events scheduled.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                     <div className="max-h-[70vh] overflow-y-auto pr-2">
                        {Object.keys(groupedAgendaEvents).length > 0 ? Object.entries(groupedAgendaEvents).map(([date, events]) => (
                            <div key={date} className="mb-6">
                                <h3 className="font-bold text-brand-dark mb-2 sticky top-0 bg-white py-2 border-b">
                                    {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </h3>
                                <div className="space-y-2">
                                    {events.map(event => <AgendaItem key={event.id} event={event} />)}
                                </div>
                            </div>
                        )) : <p className="text-gray-500 text-center py-12">No upcoming events in the next 30 days.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SchedulePage;