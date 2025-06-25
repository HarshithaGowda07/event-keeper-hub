
import React, { useState, useMemo } from 'react';
import { startOfMonth, endOfMonth, addDays, subDays } from 'date-fns';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { EventModal } from './EventModal';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { CalendarEvent, DayData } from '../../types/calendar';
import { generateCalendarDays, generateRecurringEvents, checkEventConflict } from '../../utils/dateUtils';
import { toast } from '@/hooks/use-toast';

export const EventCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useLocalStorage<CalendarEvent[]>('calendar-events', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>();

  // Generate calendar days with events
  const calendarDays = useMemo(() => {
    const days = generateCalendarDays(currentDate);
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = subDays(days[0].date, 7);
    const calendarEnd = addDays(days[days.length - 1].date, 7);

    // Generate all events including recurring ones for the visible period
    const allEvents: CalendarEvent[] = [];
    
    events.forEach(event => {
      const eventDate = typeof event.date === 'string' ? new Date(event.date) : event.date;
      const recurringEvents = generateRecurringEvents(
        { ...event, date: eventDate },
        calendarStart,
        calendarEnd
      );
      allEvents.push(...recurringEvents);
    });

    // Assign events to their respective days
    return days.map(day => ({
      ...day,
      events: allEvents.filter(event => {
        const eventDate = typeof event.date === 'string' ? new Date(event.date) : event.date;
        return eventDate.toDateString() === day.date.toDateString();
      }).sort((a, b) => a.startTime.localeCompare(b.startTime))
    }));
  }, [currentDate, events]);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(undefined);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedDate(typeof event.date === 'string' ? new Date(event.date) : event.date);
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleAddEvent = () => {
    setSelectedDate(new Date());
    setEditingEvent(undefined);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: editingEvent?.id || `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    // Check for conflicts
    const otherEvents = events.filter(e => e.id !== newEvent.id);
    const hasConflict = checkEventConflict(newEvent, otherEvents);
    
    if (hasConflict) {
      toast({
        title: "Schedule Conflict",
        description: "This event conflicts with another event at the same time.",
        variant: "destructive"
      });
      return;
    }

    if (editingEvent) {
      // Update existing event
      setEvents(events.map(event => 
        event.id === editingEvent.id ? newEvent : event
      ));
      toast({
        title: "Event Updated",
        description: "Your event has been successfully updated."
      });
    } else {
      // Add new event
      setEvents([...events, newEvent]);
      toast({
        title: "Event Added",
        description: "Your event has been successfully added."
      });
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
    toast({
      title: "Event Deleted",
      description: "Your event has been successfully deleted."
    });
  };

  const handleEventDrop = (eventId: string, newDate: Date) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const updatedEvent = { ...event, date: newDate };
    
    // Check for conflicts at the new date
    const otherEvents = events.filter(e => e.id !== eventId);
    const hasConflict = checkEventConflict(updatedEvent, otherEvents);
    
    if (hasConflict) {
      toast({
        title: "Cannot Move Event",
        description: "This would create a schedule conflict.",
        variant: "destructive"
      });
      return;
    }

    setEvents(events.map(e => e.id === eventId ? updatedEvent : e));
    toast({
      title: "Event Moved",
      description: "Your event has been moved successfully."
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <CalendarHeader
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onAddEvent={handleAddEvent}
      />
      
      <CalendarGrid
        days={calendarDays}
        onDayClick={handleDayClick}
        onEventClick={handleEventClick}
        onEventDrop={handleEventDrop}
      />
      
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        selectedDate={selectedDate}
        editingEvent={editingEvent}
      />
    </div>
  );
};
