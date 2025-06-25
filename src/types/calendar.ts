
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  color: string;
  category?: string;
  recurrence?: RecurrencePattern;
  originalDate?: Date; // For recurring events
}

export interface RecurrencePattern {
  type: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  interval?: number; // Every X days/weeks/months
  daysOfWeek?: number[]; // For weekly recurrence (0 = Sunday)
  endDate?: Date;
  count?: number; // Number of occurrences
}

export interface DayData {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}
