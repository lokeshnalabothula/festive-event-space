
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getEvents, Event } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";

const Index = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || event.eventStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div>
      <section className="bg-gradient-to-r from-event to-event-muted py-16 text-white">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Discover Amazing Events</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Find and register for the best events happening around you.
          </p>
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search events..."
                className="pl-10 py-6 text-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h2 className="text-3xl font-bold mb-4 md:mb-0">Upcoming Events</h2>
            <div className="flex space-x-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                className={filterStatus === "all" ? "bg-event text-white" : ""}
              >
                All Events
              </Button>
              <Button
                variant={filterStatus === "upcoming" ? "default" : "outline"}
                onClick={() => setFilterStatus("upcoming")}
                className={filterStatus === "upcoming" ? "bg-event text-white" : ""}
              >
                Upcoming
              </Button>
              <Button
                variant={filterStatus === "ongoing" ? "default" : "outline"}
                onClick={() => setFilterStatus("ongoing")}
                className={filterStatus === "ongoing" ? "bg-event text-white" : ""}
              >
                Ongoing
              </Button>
              <Button
                variant={filterStatus === "completed" ? "default" : "outline"}
                onClick={() => setFilterStatus("completed")}
                className={filterStatus === "completed" ? "bg-event text-white" : ""}
              >
                Past Events
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 border-4 border-event border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading events...</p>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md event-card relative"
                >
                  <div className="h-48 overflow-hidden">
                    <img
                      src={event.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="event-card-badge">{event.eventStatus}</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {event.currentAttendees} / {event.maxAttendees} attendees
                      </span>
                      <Link to={`/events/${event.id}`}>
                        <Button className="bg-event hover:bg-event-muted text-white">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-600">No events found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
