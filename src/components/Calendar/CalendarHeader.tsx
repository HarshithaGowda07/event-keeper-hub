
import React from 'react';
import { Button } from '@/components/ui/button';
import { format, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onAddEvent: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onDateChange,
  onAddEvent
}) => {
  const goToPreviousMonth = () => {
    onDateChange(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    onDateChange(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h1>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <Button variant="outline" onClick={goToToday}>
          Today
        </Button>
      </div>
      
      <Button onClick={onAddEvent} className="flex items-center space-x-2">
        <Plus className="h-4 w-4" />
        <span>Add Event</span>
      </Button>
    </div>
  );
};
