
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getEvent, registerForEvent, Event } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

const RegisterEvent = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchEvent = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const eventId = parseInt(id);
        const eventData = await getEvent(eventId);

        if (eventData) {
          setEvent(eventData);
        }
      } catch (error) {
        console.error("Failed to fetch event:", error);
        toast({
          title: "Error",
          description: "Failed to load event details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, isAuthenticated, navigate, toast]);

  const handleRegister = async () => {
    if (!event || !user) return;

    try {
      setIsRegistering(true);
      await registerForEvent(user.id, event.id);
      
      toast({
        title: "Registration Successful",
        description: `You have successfully registered for ${event.title}`,
      });
      
      // Navigate to user dashboard
      navigate("/user/dashboard");
    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        title: "Registration Failed",
        description: "There was a problem registering for this event",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 border-4 border-event border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-800">Event Not Found</h2>
        <p className="text-gray-600 mt-2">The event you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="inline-block mt-6 text-event hover:underline">
          Back to Events
        </Link>
      </div>
    );
  }

  if (event.currentAttendees >= event.maxAttendees) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Event Fully Booked</CardTitle>
            <CardDescription>
              We're sorry, but this event has reached its maximum capacity.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to={`/events/${id}`}>
              <Button variant="outline">Back to Event Details</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link to={`/events/${id}`} className="text-event hover:underline flex items-center">
          ← Back to Event Details
        </Link>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Event Registration</CardTitle>
          <CardDescription>Complete your registration for {event.title}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Event</h3>
                <p className="font-medium text-gray-900">{event.title}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p className="font-medium text-gray-900">
                  {format(new Date(event.date), "MMMM dd, yyyy")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <p className="font-medium text-gray-900">{event.location}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Available Spots</h3>
                <p className="font-medium text-gray-900">
                  {event.maxAttendees - event.currentAttendees} of {event.maxAttendees}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Attendee Information</h3>
              <div className="mt-1 p-3 bg-gray-50 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium text-gray-900">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch">
          <Button 
            className="bg-event hover:bg-event-muted text-white"
            disabled={isRegistering}
            onClick={handleRegister}
          >
            {isRegistering ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Confirm Registration"
            )}
          </Button>
          <p className="mt-4 text-sm text-gray-500 text-center">
            By registering for this event, you agree to our terms and conditions.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterEvent;
