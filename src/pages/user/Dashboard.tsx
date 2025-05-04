
import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getUserRegistrations, getEvents, Event, Registration } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Star } from "lucide-react";
import { format } from "date-fns";

const UserDashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const fetchUserEvents = async () => {
      try {
        setLoading(true);
        const userRegistrations = await getUserRegistrations(user.id);
        const allEvents = await getEvents();
        
        // Enhance registrations with event data
        const enhancedRegistrations = userRegistrations.map((reg) => ({
          ...reg,
          event: allEvents.find((e) => e.id === reg.eventId),
        }));
        
        setRegistrations(enhancedRegistrations);
        setEvents(allEvents.filter(event => 
          event.eventStatus === "upcoming" && 
          !userRegistrations.some(reg => reg.eventId === event.id)
        ).slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch user events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserEvents();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const pastEvents = registrations.filter(reg => 
    reg.event?.eventStatus === "completed"
  );

  const upcomingEvents = registrations.filter(reg => 
    reg.event?.eventStatus !== "completed"
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}!</h1>
        <p className="text-gray-600">Manage your events and registrations</p>
      </div>
      
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Your Upcoming Events</h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-event border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((registration) => (
              <Card key={registration.id} className="event-card">
                <div className="h-40 overflow-hidden">
                  <img
                    src={registration.event?.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"}
                    alt={registration.event?.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold mb-2">{registration.event?.title}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDate(registration.event?.date)}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{registration.event?.location}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Link to={`/events/${registration.eventId}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Registered
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-4">You haven't registered for any upcoming events yet.</p>
            <Link to="/">
              <Button className="bg-event hover:bg-event-muted text-white">
                Browse Events
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Past Events</h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-event border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : pastEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((registration) => (
              <Card key={registration.id} className="event-card">
                <div className="h-40 overflow-hidden relative">
                  <img
                    src={registration.event?.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"}
                    alt={registration.event?.title}
                    className="w-full h-full object-cover filter grayscale opacity-80"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <span className="text-white font-medium">Completed</span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold mb-2">{registration.event?.title}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDate(registration.event?.date)}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{registration.event?.location}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Link to={`/events/${registration.eventId}/feedback`}>
                      <Button size="sm" className="flex items-center bg-event hover:bg-event-muted text-white">
                        <Star className="h-4 w-4 mr-1" />
                        Leave Feedback
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">You don't have any past events.</p>
          </div>
        )}
      </div>

      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Recommended for You</h2>
          <Link to="/" className="text-event hover:underline">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-event border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="event-card">
                <div className="h-40 overflow-hidden">
                  <img
                    src={event.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold mb-2">{event.title}</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex justify-end">
                    <Link to={`/events/${event.id}`}>
                      <Button size="sm" className="bg-event hover:bg-event-muted text-white">
                        View Event
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No recommended events available at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
