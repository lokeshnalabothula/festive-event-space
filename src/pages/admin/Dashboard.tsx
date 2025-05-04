
import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getEvents, getEmployees, Event, Employee } from "@/services/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const AdminDashboard = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const eventsData = await getEvents();
        const employeesData = await getEmployees();
        
        setEvents(eventsData);
        setEmployees(employeesData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, isAdmin]);

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" />;
  }

  // Data for attendance chart
  const attendanceData = events.map(event => ({
    name: event.title,
    current: event.currentAttendees,
    max: event.maxAttendees,
    percentage: Math.round((event.currentAttendees / event.maxAttendees) * 100)
  }));

  // Data for event status pie chart
  const statusCounts = events.reduce((acc, event) => {
    acc[event.eventStatus] = (acc[event.eventStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#4f46e5', '#60a5fa', '#34d399', '#fb923c'];

  const upcomingEvents = events.filter(event => event.eventStatus === 'upcoming');
  const completedEvents = events.filter(event => event.eventStatus === 'completed');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage events, employees, and view statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="dashboard-card">
          <div className="dashboard-card-title">Total Events</div>
          <div className="dashboard-stat">{events.length}</div>
        </Card>

        <Card className="dashboard-card">
          <div className="dashboard-card-title">Upcoming Events</div>
          <div className="dashboard-stat">{upcomingEvents.length}</div>
        </Card>

        <Card className="dashboard-card">
          <div className="dashboard-card-title">Completed Events</div>
          <div className="dashboard-stat">{completedEvents.length}</div>
        </Card>

        <Card className="dashboard-card">
          <div className="dashboard-card-title">Total Employees</div>
          <div className="dashboard-stat">{employees.length}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Event Attendance</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={attendanceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="current"
                  name="Current Attendees"
                  stroke="#4f46e5"
                  activeDot={{ r: 8 }}
                />
                <Line type="monotone" dataKey="max" name="Max Capacity" stroke="#9ca3af" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Event Status Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Events</h2>
            <Link to="/admin/events/create">
              <Button className="bg-event hover:bg-event-muted text-white">Create Event</Button>
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-4">
              <div className="w-8 h-8 border-4 border-event border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {events.slice(0, 5).map((event) => (
                <div key={event.id} className="p-3 bg-gray-50 rounded-md flex justify-between items-center">
                  <div>
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-gray-500">{event.date}</div>
                  </div>
                  <div>
                    <span 
                      className={`text-xs px-2 py-1 rounded-full ${
                        event.eventStatus === "upcoming" 
                          ? "bg-blue-100 text-blue-800" 
                          : event.eventStatus === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                      {event.eventStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Employee Overview</h2>
            <Link to="/admin/employees">
              <Button className="bg-event hover:bg-event-muted text-white">View All</Button>
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-4">
              <div className="w-8 h-8 border-4 border-event border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {employees.map((employee) => (
                <div key={employee.id} className="p-3 bg-gray-50 rounded-md flex justify-between items-center">
                  <div>
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-sm text-gray-500">{employee.role}</div>
                  </div>
                  <div className="text-sm font-medium">${employee.salary.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/admin/events/create">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col justify-center items-center">
            <div className="rounded-full bg-event bg-opacity-10 p-5 mb-4">
              <svg className="h-8 w-8 text-event" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-center">Create New Event</h3>
            <p className="text-gray-500 text-center">Add a new event to your organization</p>
          </Card>
        </Link>

        <Link to="/admin/employees/assign">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col justify-center items-center">
            <div className="rounded-full bg-event bg-opacity-10 p-5 mb-4">
              <svg className="h-8 w-8 text-event" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-center">Assign Employees</h3>
            <p className="text-gray-500 text-center">Assign staff to manage events</p>
          </Card>
        </Link>

        <Link to="/admin/employees">
          <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col justify-center items-center">
            <div className="rounded-full bg-event bg-opacity-10 p-5 mb-4">
              <svg className="h-8 w-8 text-event" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-center">Manage Employees</h3>
            <p className="text-gray-500 text-center">Add or update employee information</p>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
