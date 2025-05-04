
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getEvent, getEventFeedback, Event, Feedback } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Users, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const eventId = parseInt(id);
        const eventData = await getEvent(eventId);
        
        if (eventData) {
          setEvent(eventData);
          const feedbackData = await getEventFeedback(eventId);
          setFeedback(feedbackData);
        }
      } catch (error) {
        console.error("Failed to fetch event details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const handleRegister = () => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      navigate(`/events/${id}/register`);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      return format(new Date(dateString), "MMMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  const calculateAverageRating = () => {
    if (feedback.length === 0) return 0;
    const sum = feedback.reduce((acc, item) => acc + item.rating, 0);
    return (sum / feedback.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 border-4 border-event border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800">Event Not Found</h2>
        <p className="text-gray-600 mt-2">The event you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="inline-block mt-6 text-event hover:underline">
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <Link to="/" className="text-event hover:underline flex items-center">
          ← Back to Events
        </Link>
      </div>

      <div className="bg-white rounded-lg overflow-hidden shadow-md mb-8">
        <div className="h-64 overflow-hidden relative">
          <img
            src={event.image || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 bg-event px-3 py-1 rounded-full text-white text-sm font-medium">
            {event.eventStatus}
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 md:mb-0">{event.title}</h1>
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-500 mr-1" />
              <span className="font-medium">{calculateAverageRating()}</span>
              <span className="text-gray-500 ml-1">({feedback.length} reviews)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-event mr-2" />
              <div>
                <div className="text-sm text-gray-500">Date</div>
                <div className="font-medium">{formatDate(event.date)}</div>
              </div>
            </div>

            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-event mr-2" />
              <div>
                <div className="text-sm text-gray-500">Location</div>
                <div className="font-medium">{event.location}</div>
              </div>
            </div>

            <div className="flex items-center">
              <Users className="h-5 w-5 text-event mr-2" />
              <div>
                <div className="text-sm text-gray-500">Attendees</div>
                <div className="font-medium">
                  {event.currentAttendees} / {event.maxAttendees}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">About This Event</h2>
            <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
          </div>

          <div className="flex justify-center">
            <Button 
              className="bg-event hover:bg-event-muted text-white px-8 py-6 text-lg"
              disabled={event.currentAttendees >= event.maxAttendees || event.eventStatus === 'completed'}
              onClick={handleRegister}
            >
              {event.currentAttendees >= event.maxAttendees
                ? "Event Fully Booked"
                : event.eventStatus === 'completed'
                ? "Event Completed"
                : isAuthenticated
                ? "Register for this Event"
                : "Login to Register"}
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Attendee Feedback</h2>
        {feedback.length > 0 ? (
          <div className="space-y-4">
            {feedback.map((item) => (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < item.rating ? "text-yellow-500" : "text-gray-300"
                          }`}
                          fill={i < item.rating ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-500">
                      User #{item.userId}
                    </span>
                  </div>
                  <p className="text-gray-700">{item.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No feedback yet for this event.</p>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
