import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Event } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Users, Info, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const startDate = new Date(event.startDate);
  const formattedDay = format(startDate, 'dd');
  const formattedMonth = format(startDate, 'MMM');
  
  const formattedDate = event.endDate 
    ? `${format(startDate, 'MMMM d')}-${format(new Date(event.endDate), 'd, yyyy')}`
    : format(startDate, 'MMMM d, yyyy');
  
  return (
    <div className="bg-cream rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
      <div className="relative">
        <img 
          src={event.imageUrl || 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'} 
          alt={event.title} 
          className="w-full h-48 object-cover" 
        />
        <div className="absolute top-0 left-0 bg-teal text-white p-2">
          <div className="text-center">
            <span className="block text-xl font-bold">{formattedDay}</span>
            <span className="text-xs uppercase">{formattedMonth}</span>
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="font-playfair text-xl font-bold text-warmGray">{event.title}</h3>
        
        <div className="mt-3 text-warmGray/80 space-y-2">
          <p className="flex items-center text-sm">
            <Calendar className="text-terracotta w-5 h-5 mr-2" />
            {formattedDate}
          </p>
          <p className="flex items-center text-sm">
            <MapPin className="text-terracotta w-5 h-5 mr-2" />
            {event.location || 'Location TBA'}
          </p>
          {event.organizer && (
            <p className="flex items-center text-sm">
              <Users className="text-terracotta w-5 h-5 mr-2" />
              {event.organizer}
            </p>
          )}
          {event.price ? (
            <p className="flex items-center text-sm">
              <IndianRupee className="text-terracotta w-5 h-5 mr-2" />
              ₹{event.price.toLocaleString('en-IN')} {event.eventType === 'workshop' ? 'per person' : ''}
            </p>
          ) : (
            <p className="flex items-center text-sm">
              <Info className="text-terracotta w-5 h-5 mr-2" />
              Free Entry
            </p>
          )}
        </div>
        
        <div className="mt-4">
          <Link href={`/events/${event.id}`} className="block text-center bg-terracotta text-white font-medium py-2 rounded-md hover:bg-amber transition duration-300">
            {event.eventType === 'workshop' ? 'Book Your Spot' : 'Register to Attend'}
          </Link>
        </div>
      </div>
    </div>
  );
};

const EventSkeleton = () => (
  <div className="bg-cream rounded-lg overflow-hidden shadow-md">
    <div className="relative">
      <Skeleton className="w-full h-48" />
      <div className="absolute top-0 left-0 w-12 h-14 bg-teal" />
    </div>
    <div className="p-5">
      <Skeleton className="h-6 w-full mb-3" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
      </div>
      <Skeleton className="h-10 w-full mt-4 rounded-md" />
    </div>
  </div>
);

export default function UpcomingEvents() {
  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-playfair text-3xl font-bold text-warmGray">Upcoming Events</h2>
          <Link href="/events" className="text-teal font-medium hover:text-terracotta transition">
            View All Events
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading && (
            <>
              <EventSkeleton />
              <EventSkeleton />
              <EventSkeleton />
            </>
          )}
          
          {events?.slice(0, 3).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
          
          {events?.length === 0 && (
            <div className="col-span-3 text-center py-8">
              <p className="text-warmGray/80">No upcoming events. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
