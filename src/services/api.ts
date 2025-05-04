
// Types
export interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  description: string;
  maxAttendees: number;
  currentAttendees: number;
  organizerId: number;
  eventStatus: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  image?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
}

export interface Employee {
  id: number;
  name: string;
  role: string;
  salary: number;
}

export interface Registration {
  id: number;
  attendeeId: number;
  eventId: number;
  registerDate: string;
  attendee?: User;
  event?: Event;
}

export interface Feedback {
  id: number;
  userId: number;
  eventId: number;
  rating: number;
  comment: string;
}

// Mock data (in a real app, this would come from API calls)
const mockEvents: Event[] = [
  {
    id: 1,
    title: "Tech Conference 2023",
    date: "2023-12-15",
    location: "San Francisco Convention Center",
    description: "Join us for the biggest tech conference of the year featuring keynotes, workshops and networking opportunities.",
    maxAttendees: 500,
    currentAttendees: 320,
    organizerId: 1,
    eventStatus: 'upcoming',
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Music Festival",
    date: "2023-11-20",
    location: "Central Park",
    description: "A weekend of music, art, and culture with performances from top artists and local talents.",
    maxAttendees: 1000,
    currentAttendees: 750,
    organizerId: 2,
    eventStatus: 'upcoming',
    image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Business Summit",
    date: "2023-10-10",
    location: "Grand Hotel",
    description: "Network with industry leaders and learn about the latest trends in business and entrepreneurship.",
    maxAttendees: 200,
    currentAttendees: 180,
    organizerId: 1,
    eventStatus: 'completed',
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=2070&auto=format&fit=crop"
  },
];

const mockEmployees: Employee[] = [
  {
    id: 1,
    name: "John Smith",
    role: "Event Coordinator",
    salary: 55000
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "Marketing Specialist",
    salary: 48000
  },
  {
    id: 3,
    name: "Michael Brown",
    role: "Technical Support",
    salary: 52000
  },
];

const mockRegistrations: Registration[] = [
  {
    id: 1,
    attendeeId: 1,
    eventId: 1,
    registerDate: "2023-09-15",
  },
  {
    id: 2,
    attendeeId: 2,
    eventId: 1,
    registerDate: "2023-09-20",
  },
];

const mockFeedback: Feedback[] = [
  {
    id: 1,
    userId: 1,
    eventId: 3,
    rating: 4,
    comment: "Great event, learned a lot!"
  },
  {
    id: 2,
    userId: 2,
    eventId: 3,
    rating: 5,
    comment: "Excellent speakers and content!"
  },
];

// API Functions
export const getEvents = async (): Promise<Event[]> => {
  // In a real app: return fetch('/api/events').then(res => res.json());
  return Promise.resolve(mockEvents);
};

export const getEvent = async (id: number): Promise<Event | undefined> => {
  // In a real app: return fetch(`/api/events/${id}`).then(res => res.json());
  return Promise.resolve(mockEvents.find(event => event.id === id));
};

export const createEvent = async (event: Omit<Event, 'id'>): Promise<Event> => {
  // In a real app: return fetch('/api/events', { method: 'POST', body: JSON.stringify(event) }).then(res => res.json());
  const newEvent: Event = {
    ...event,
    id: mockEvents.length + 1,
    currentAttendees: 0,
  };
  mockEvents.push(newEvent);
  return Promise.resolve(newEvent);
};

export const getEmployees = async (): Promise<Employee[]> => {
  // In a real app: return fetch('/api/employees').then(res => res.json());
  return Promise.resolve(mockEmployees);
};

export const createEmployee = async (employee: Omit<Employee, 'id'>): Promise<Employee> => {
  // In a real app: return fetch('/api/employees', { method: 'POST', body: JSON.stringify(employee) }).then(res => res.json());
  const newEmployee: Employee = {
    ...employee,
    id: mockEmployees.length + 1,
  };
  mockEmployees.push(newEmployee);
  return Promise.resolve(newEmployee);
};

export const assignEmployeeToEvent = async (employeeId: number, eventId: number, role: string): Promise<void> => {
  // In a real app: return fetch('/api/assignEvent', { method: 'POST', body: JSON.stringify({ employeeId, eventId, role }) }).then(res => res.json());
  console.log(`Assigned employee ${employeeId} to event ${eventId} as ${role}`);
  return Promise.resolve();
};

export const registerForEvent = async (userId: number, eventId: number): Promise<Registration> => {
  // In a real app: return fetch('/api/registerEvent', { method: 'POST', body: JSON.stringify({ userId, eventId }) }).then(res => res.json());
  const newRegistration: Registration = {
    id: mockRegistrations.length + 1,
    attendeeId: userId,
    eventId: eventId,
    registerDate: new Date().toISOString().split('T')[0],
  };
  mockRegistrations.push(newRegistration);
  
  // Update the event's attendee count
  const event = mockEvents.find(e => e.id === eventId);
  if (event) {
    event.currentAttendees += 1;
  }
  
  return Promise.resolve(newRegistration);
};

export const submitFeedback = async (feedback: Omit<Feedback, 'id'>): Promise<Feedback> => {
  // In a real app: return fetch('/api/feedback', { method: 'POST', body: JSON.stringify(feedback) }).then(res => res.json());
  const newFeedback: Feedback = {
    ...feedback,
    id: mockFeedback.length + 1,
  };
  mockFeedback.push(newFeedback);
  return Promise.resolve(newFeedback);
};

export const getUserRegistrations = async (userId: number): Promise<Registration[]> => {
  // In a real app: return fetch(`/api/users/${userId}/registrations`).then(res => res.json());
  return Promise.resolve(mockRegistrations.filter(reg => reg.attendeeId === userId));
};

export const getEventRegistrations = async (eventId: number): Promise<Registration[]> => {
  // In a real app: return fetch(`/api/events/${eventId}/registrations`).then(res => res.json());
  return Promise.resolve(mockRegistrations.filter(reg => reg.eventId === eventId));
};

export const getEventFeedback = async (eventId: number): Promise<Feedback[]> => {
  // In a real app: return fetch(`/api/events/${eventId}/feedback`).then(res => res.json());
  return Promise.resolve(mockFeedback.filter(fb => fb.eventId === eventId));
};
