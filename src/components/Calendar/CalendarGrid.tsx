import React from 'react';
import { format, isSameDay } from 'date-fns';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { CalendarEvent, DayData } from '../../types/calendar';
import { cn } from '@/lib/utils';

interface CalendarGridProps {
  days: DayData[];
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onEventDrop: (eventId: string, newDate: Date) => void;
}

interface DraggableEventProps {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
}

const DraggableEvent: React.FC<DraggableEventProps> = ({ event, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id,
    data: event
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    backgroundColor: event.color,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "text-xs p-1 mb-1 rounded cursor-pointer text-white truncate transition-opacity",
        isDragging && "opacity-50"
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick(event);
      }}
    >
      {event.startTime} {event.title}
    </div>
  );
};

interface DroppableDayProps {
  day: DayData;
  onDayClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
}

const DroppableDay: React.FC<DroppableDayProps> = ({ day, onDayClick, onEventClick }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: format(day.date, 'yyyy-MM-dd'),
    data: { date: day.date }
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[120px] p-2 border border-gray-200 cursor-pointer transition-colors hover:bg-gray-50",
        !day.isCurrentMonth && "bg-gray-50 text-gray-400",
        day.isToday && "bg-blue-50 border-blue-200",
        isOver && "bg-blue-100"
      )}
      onClick={() => onDayClick(day.date)}
    >
      <div className={cn(
        "font-medium text-sm mb-2",
        day.isToday && "text-blue-600"
      )}>
        {format(day.date, 'd')}
      </div>
      
      <div className="space-y-1">
        {day.events.slice(0, 3).map((event) => (
          <DraggableEvent
            key={event.id}
            event={event}
            onClick={onEventClick}
          />
        ))}
        {day.events.length > 3 && (
          <div className="text-xs text-gray-500 font-medium">
            +{day.events.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
};

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  days,
  onDayClick,
  onEventClick,
  onEventDrop
}) => {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.data.current) {
      const eventData = active.data.current as CalendarEvent;
      const newDateStr = over.id as string;
      const newDate = new Date(newDateStr);
      
      if (!isSameDay(eventData.date, newDate)) {
        onEventDrop(eventData.id, newDate);
      }
    }
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b">
          {weekDays.map((day) => (
            <div key={day} className="p-3 text-sm font-medium text-gray-600 text-center">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => (
            <DroppableDay
              key={index}
              day={day}
              onDayClick={onDayClick}
              onEventClick={onEventClick}
            />
          ))}
        </div>
      </div>
    </DndContext>
  );
};
