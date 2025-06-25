
import { EventCalendar } from '../components/Calendar/EventCalendar';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Event Calendar</h1>
          <p className="text-lg text-gray-600">Manage your events with drag-and-drop scheduling</p>
        </div>
        <EventCalendar />
      </div>
    </div>
  );
};

export default Index;
