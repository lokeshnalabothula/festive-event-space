
import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getEvents, getEmployees, assignEmployeeToEvent, Event, Employee } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useSearchParams } from "react-router-dom";

const AssignEmployee = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [eventsData, employeesData] = await Promise.all([
          getEvents(),
          getEmployees(),
        ]);
        
        // Filter only upcoming and ongoing events
        const activeEvents = eventsData.filter(event => 
          event.eventStatus === 'upcoming' || event.eventStatus === 'ongoing'
        );
        
        setEvents(activeEvents);
        setEmployees(employeesData);
        
        // If employeeId is provided in URL, pre-select it
        const employeeIdParam = searchParams.get('employeeId');
        if (employeeIdParam) {
          setSelectedEmployee(employeeIdParam);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, isAdmin, searchParams]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEvent || !selectedEmployee || !role.trim()) {
      toast({
        title: "Validation Error",
        description: "Please complete all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await assignEmployeeToEvent(
        parseInt(selectedEmployee),
        parseInt(selectedEvent),
        role
      );
      
      toast({
        title: "Assignment Successful",
        description: "The employee has been assigned to the event",
      });
      
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Failed to assign employee:", error);
      toast({
        title: "Assignment Failed",
        description: "There was an error assigning the employee",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Assign Employee to Event</h1>
        <p className="text-gray-600">
          Select an employee and event to create an assignment
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Event Assignment</CardTitle>
          <CardDescription>
            Assign team members to manage specific events
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAssign}>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-event border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading data...</p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="employee">Select Employee</Label>
                  <Select 
                    value={selectedEmployee} 
                    onValueChange={setSelectedEmployee}
                  >
                    <SelectTrigger id="employee">
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.name} - {employee.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event">Select Event</Label>
                  <Select 
                    value={selectedEvent} 
                    onValueChange={setSelectedEvent}
                  >
                    <SelectTrigger id="event">
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id.toString()}>
                          {event.title} - {event.date}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Assignment Role</Label>
                  <Input
                    id="role"
                    placeholder="e.g., Coordinator, Technical Support, etc."
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                  />
                </div>

                {events.length === 0 && (
                  <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm">
                    No upcoming events available for assignment. Please create a new event first.
                  </div>
                )}

                {employees.length === 0 && (
                  <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md text-sm">
                    No employees available for assignment. Please add employees first.
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex justify-between w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/dashboard")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-event hover:bg-event-muted text-white"
                disabled={isSubmitting || loading || events.length === 0 || employees.length === 0}
              >
                {isSubmitting ? "Assigning..." : "Assign Employee"}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AssignEmployee;
