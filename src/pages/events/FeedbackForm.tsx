
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getEvent, submitFeedback, Event } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const FeedbackForm = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
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
        setError("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError("Please provide a rating");
      return;
    }

    if (!comment.trim()) {
      setError("Please provide a comment");
      return;
    }

    if (!event || !user) return;

    try {
      setIsSubmitting(true);
      await submitFeedback({
        userId: user.id,
        eventId: event.id,
        rating,
        comment,
      });

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      });

      navigate("/user/dashboard");
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link to="/user/dashboard" className="text-event hover:underline flex items-center">
          ← Back to My Events
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Event Feedback</CardTitle>
          <CardDescription>Share your experience about {event.title}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How would you rate this event?
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="p-1 focus:outline-none"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(0)}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        value <= (hoverRating || rating)
                          ? "text-yellow-500 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                Your Feedback
              </label>
              <Textarea
                id="comment"
                placeholder="Share your thoughts about the event..."
                rows={5}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-event hover:bg-event-muted text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default FeedbackForm;
