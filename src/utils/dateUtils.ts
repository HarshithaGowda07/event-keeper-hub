
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday,
  addDays,
  addWeeks,
  addMonths,
  isSameDay,
  parseISO
} from 'date-fns';
import { CalendarEvent, RecurrencePattern, DayData } from '../types/calendar';

export const generateCalendarDays = (date: Date): DayData[] => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return days.map(day => ({
    date: day,
    isCurrentMonth: isSameMonth(day, date),
    isToday: isToday(day),
    events: []
  }));
};

export const generateRecurringEvents = (
  baseEvent: CalendarEvent,
  startDate: Date,
  endDate: Date
): CalendarEvent[] => {
  if (!baseEvent.recurrence || baseEvent.recurrence.type === 'none') {
    return [baseEvent];
  }

  const events: CalendarEvent[] = [];
  const pattern = baseEvent.recurrence;
  let currentDate = new Date(baseEvent.date);
  let count = 0;

  while (currentDate <= endDate && (pattern.count ? count < pattern.count : true)) {
    if (currentDate >= startDate) {
      events.push({
        ...baseEvent,
        id: `${baseEvent.id}-${count}`,
        date: new Date(currentDate),
        originalDate: baseEvent.date
      });
    }

    // Generate next occurrence
    switch (pattern.type) {
      case 'daily':
        currentDate = addDays(currentDate, pattern.interval || 1);
        break;
      case 'weekly':
        currentDate = addWeeks(currentDate, pattern.interval || 1);
        break;
      case 'monthly':
        currentDate = addMonths(currentDate, pattern.interval || 1);
        break;
      case 'custom':
        currentDate = addDays(currentDate, pattern.interval || 1);
        break;
    }

    count++;
    
    // Safety check to prevent infinite loops
    if (count > 1000) break;
  }

  return events;
};

export const formatEventTime = (startTime: string, endTime: string): string => {
  return `${startTime} - ${endTime}`;
};

export const checkEventConflict = (
  newEvent: CalendarEvent,
  existingEvents: CalendarEvent[]
): boolean => {
  return existingEvents.some(event => {
    if (!isSameDay(event.date, newEvent.date)) return false;
    
    const newStart = parseTime(newEvent.startTime);
    const newEnd = parseTime(newEvent.endTime);
    const existingStart = parseTime(event.startTime);
    const existingEnd = parseTime(event.endTime);
    
    return (newStart < existingEnd && newEnd > existingStart);
  });
};

const parseTime = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};
