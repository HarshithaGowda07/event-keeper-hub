
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarEvent, RecurrencePattern } from '../../types/calendar';
import { format } from 'date-fns';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  onDelete?: (eventId: string) => void;
  selectedDate: Date;
  editingEvent?: CalendarEvent;
}

const EVENT_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#84cc16', // Lime
];

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  selectedDate,
  editingEvent
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [color, setColor] = useState(EVENT_COLORS[0]);
  const [recurrenceType, setRecurrenceType] = useState<RecurrencePattern['type']>('none');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDescription(editingEvent.description || '');
      setStartTime(editingEvent.startTime);
      setEndTime(editingEvent.endTime);
      setColor(editingEvent.color);
      setRecurrenceType(editingEvent.recurrence?.type || 'none');
      setRecurrenceInterval(editingEvent.recurrence?.interval || 1);
    } else {
      // Reset form for new event
      setTitle('');
      setDescription('');
      setStartTime('09:00');
      setEndTime('10:00');
      setColor(EVENT_COLORS[0]);
      setRecurrenceType('none');
      setRecurrenceInterval(1);
    }
  }, [editingEvent, isOpen]);

  const handleSave = () => {
    if (!title.trim()) return;

    const recurrence: RecurrencePattern = {
      type: recurrenceType,
      interval: recurrenceType !== 'none' ? recurrenceInterval : undefined
    };

    const eventData: Omit<CalendarEvent, 'id'> = {
      title: title.trim(),
      description: description.trim(),
      date: selectedDate,
      startTime,
      endTime,
      color,
      recurrence: recurrenceType === 'none' ? undefined : recurrence
    };

    onSave(eventData);
    onClose();
  };

  const handleDelete = () => {
    if (editingEvent && onDelete) {
      onDelete(editingEvent.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingEvent ? 'Edit Event' : 'Add New Event'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter event description (optional)"
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Event Color</Label>
            <div className="flex gap-2 mt-2">
              {EVENT_COLORS.map((eventColor) => (
                <button
                  key={eventColor}
                  className={`w-8 h-8 rounded-full border-2 ${
                    color === eventColor ? 'border-gray-600' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: eventColor }}
                  onClick={() => setColor(eventColor)}
                />
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="recurrence">Recurrence</Label>
            <Select value={recurrenceType} onValueChange={(value: RecurrencePattern['type']) => setRecurrenceType(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Recurrence</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {recurrenceType !== 'none' && (
            <div>
              <Label htmlFor="interval">Repeat every</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="interval"
                  type="number"
                  min="1"
                  value={recurrenceInterval}
                  onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                  className="w-20"
                />
                <span className="text-sm text-gray-600">
                  {recurrenceType === 'daily' && 'day(s)'}
                  {recurrenceType === 'weekly' && 'week(s)'}
                  {recurrenceType === 'monthly' && 'month(s)'}
                </span>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-600">
            <strong>Date:</strong> {format(selectedDate, 'MMMM d, yyyy')}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <div>
            {editingEvent && onDelete && (
              <Button variant="destructive" onClick={handleDelete}>
                Delete Event
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!title.trim()}>
              {editingEvent ? 'Update' : 'Save'} Event
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
