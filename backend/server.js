
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password', // Change this to your MySQL password
  database: 'event_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret'); // Use environment variable in production
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Admin middleware
const isAdmin = async (req, res, next) => {
  try {
    const [admins] = await pool.query(
      'SELECT * FROM ADMIN WHERE userID = ?',
      [req.user.id]
    );

    if (admins.length === 0) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    next();
  } catch (error) {
    console.error('Admin check failed:', error);
    res.status(500).json({ message: 'Server error during admin verification' });
  }
};

// Routes

// User Registration
app.post('/registerUser', async (req, res) => {
  try {
    const { name, email, password, phoneNumber, address } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM USER WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const [result] = await pool.query(
      'INSERT INTO USER (name, email, password, phoneNumber, address) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phoneNumber, address]
    );

    const userId = result.insertId;

    // Create attendee record
    await pool.query(
      'INSERT INTO ATTENDEE (userID) VALUES (?)',
      [userId]
    );

    res.status(201).json({ message: 'User registered successfully', userId });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// User Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check if user exists
    const [users] = await pool.query(
      'SELECT * FROM USER WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check if user is admin
    const [admins] = await pool.query(
      'SELECT * FROM ADMIN WHERE userID = ?',
      [user.userID]
    );

    const isAdmin = admins.length > 0;

    // Create and assign token
    const token = jwt.sign(
      { id: user.userID, name: user.name, email: user.email, isAdmin },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    // Log login
    await pool.query(
      'INSERT INTO LOGIN (userID, loginTime) VALUES (?, NOW())',
      [user.userID]
    );

    res.status(200).json({
      token,
      user: {
        id: user.userID,
        name: user.name,
        email: user.email,
        isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Log out (update logout time)
app.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Get the latest login record for this user
    const [logins] = await pool.query(
      'SELECT loginID FROM LOGIN WHERE userID = ? AND logoutTime IS NULL ORDER BY loginTime DESC LIMIT 1',
      [req.user.id]
    );

    if (logins.length > 0) {
      await pool.query(
        'UPDATE LOGIN SET logoutTime = NOW() WHERE loginID = ?',
        [logins[0].loginID]
      );
    }

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// Get all events
app.get('/events', async (req, res) => {
  try {
    const [events] = await pool.query(
      `SELECT e.*, 
        (SELECT COUNT(*) FROM REGISTRATION r WHERE r.eventID = e.eventID) as currentAttendees,
        o.userID as organizerUserID
       FROM EVENT e
       JOIN ORGANIZER o ON e.organizerID = o.organizerID
       ORDER BY e.date DESC`
    );

    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Server error while fetching events' });
  }
});

// Get event by ID
app.get('/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    
    const [events] = await pool.query(
      `SELECT e.*,
        (SELECT COUNT(*) FROM REGISTRATION r WHERE r.eventID = e.eventID) as currentAttendees,
        o.userID as organizerUserID
       FROM EVENT e
       JOIN ORGANIZER o ON e.organizerID = o.organizerID
       WHERE e.eventID = ?`,
      [eventId]
    );

    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json(events[0]);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Server error while fetching event' });
  }
});

// Register for an event
app.post('/registerEvent', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user.id;

    // Get attendee ID for the user
    const [attendees] = await pool.query(
      'SELECT attendeeID FROM ATTENDEE WHERE userID = ?',
      [userId]
    );

    if (attendees.length === 0) {
      return res.status(400).json({ message: 'User is not registered as an attendee' });
    }

    const attendeeId = attendees[0].attendeeID;

    // Check if already registered
    const [existingRegistrations] = await pool.query(
      'SELECT * FROM REGISTRATION WHERE attendeeID = ? AND eventID = ?',
      [attendeeId, eventId]
    );

    if (existingRegistrations.length > 0) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    // Check if event exists and has space
    const [events] = await pool.query(
      `SELECT e.*,
        (SELECT COUNT(*) FROM REGISTRATION r WHERE r.eventID = e.eventID) as currentAttendees
       FROM EVENT e
       WHERE e.eventID = ?`,
      [eventId]
    );

    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const event = events[0];

    if (event.currentAttendees >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event is fully booked' });
    }

    if (event.eventStatus === 'completed' || event.eventStatus === 'cancelled') {
      return res.status(400).json({ message: 'Cannot register for a completed or cancelled event' });
    }

    // Register for the event
    const [result] = await pool.query(
      'INSERT INTO REGISTRATION (attendeeID, eventID, registerDate) VALUES (?, ?, CURDATE())',
      [attendeeId, eventId]
    );

    // Create notification
    await pool.query(
      'INSERT INTO NOTIFICATION (eventID, userID, message) VALUES (?, ?, ?)',
      [eventId, userId, `You have successfully registered for ${event.title}`]
    );

    res.status(201).json({
      message: 'Successfully registered for the event',
      registrationId: result.insertId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during event registration' });
  }
});

// Create a new event (admin only)
app.post('/createEvent', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, date, location, description, maxAttendees, eventStatus, image } = req.body;
    const userId = req.user.id;

    // Check if user is an organizer, if not create an organizer record
    let [organizers] = await pool.query(
      'SELECT organizerID FROM ORGANIZER WHERE userID = ?',
      [userId]
    );

    let organizerId;

    if (organizers.length === 0) {
      // Create organizer record
      const [result] = await pool.query(
        'INSERT INTO ORGANIZER (userID, contactInfo) VALUES (?, ?)',
        [userId, '']
      );
      organizerId = result.insertId;
    } else {
      organizerId = organizers[0].organizerID;
    }

    // Create event
    const [result] = await pool.query(
      'INSERT INTO EVENT (organizerID, title, date, location, description, maxAttendees, eventStatus, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [organizerId, title, date, location, description, maxAttendees, eventStatus, image]
    );

    res.status(201).json({
      message: 'Event created successfully',
      eventId: result.insertId
    });
  } catch (error) {
    console.error('Event creation error:', error);
    res.status(500).json({ message: 'Server error during event creation' });
  }
});

// Get all employees (admin only)
app.get('/employees', authenticateToken, isAdmin, async (req, res) => {
  try {
    const [employees] = await pool.query(
      'SELECT * FROM EMPLOYEEDETAILS ORDER BY name'
    );

    res.status(200).json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error while fetching employees' });
  }
});

// Create employee (admin only)
app.post('/employees', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, role, salary } = req.body;

    // Validate inputs
    if (!name || !role || !salary) {
      return res.status(400).json({ message: 'Please provide name, role, and salary' });
    }

    // Create employee
    const [result] = await pool.query(
      'INSERT INTO EMPLOYEEDETAILS (name, role, salary, hireDate) VALUES (?, ?, ?, CURDATE())',
      [name, role, salary]
    );

    res.status(201).json({
      message: 'Employee added successfully',
      employeeId: result.insertId
    });
  } catch (error) {
    console.error('Employee creation error:', error);
    res.status(500).json({ message: 'Server error during employee creation' });
  }
});

// Update employee (admin only)
app.put('/employees/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const employeeId = req.params.id;
    const { name, role, salary } = req.body;

    // Validate inputs
    if (!name || !role || !salary) {
      return res.status(400).json({ message: 'Please provide name, role, and salary' });
    }

    // Update employee
    await pool.query(
      'UPDATE EMPLOYEEDETAILS SET name = ?, role = ?, salary = ? WHERE employeeID = ?',
      [name, role, salary, employeeId]
    );

    res.status(200).json({
      message: 'Employee updated successfully'
    });
  } catch (error) {
    console.error('Employee update error:', error);
    res.status(500).json({ message: 'Server error during employee update' });
  }
});

// Delete employee (admin only)
app.delete('/employees/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const employeeId = req.params.id;

    // Delete employee
    await pool.query(
      'DELETE FROM EMPLOYEEDETAILS WHERE employeeID = ?',
      [employeeId]
    );

    res.status(200).json({
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Employee deletion error:', error);
    res.status(500).json({ message: 'Server error during employee deletion' });
  }
});

// Assign employee to event (admin only)
app.post('/assignEvent', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { employeeId, eventId, role } = req.body;

    // Validate inputs
    if (!employeeId || !eventId || !role) {
      return res.status(400).json({ message: 'Please provide employeeId, eventId, and role' });
    }

    // Check if already assigned
    const [existingAssignments] = await pool.query(
      'SELECT * FROM ASSIGNEVENT WHERE employeeID = ? AND eventID = ?',
      [employeeId, eventId]
    );

    if (existingAssignments.length > 0) {
      return res.status(400).json({ message: 'Employee is already assigned to this event' });
    }

    // Assign employee to event
    const [result] = await pool.query(
      'INSERT INTO ASSIGNEVENT (employeeID, eventID, role) VALUES (?, ?, ?)',
      [employeeId, eventId, role]
    );

    res.status(201).json({
      message: 'Employee assigned successfully',
      assignId: result.insertId
    });
  } catch (error) {
    console.error('Assignment error:', error);
    res.status(500).json({ message: 'Server error during employee assignment' });
  }
});

// Submit feedback
app.post('/feedback', authenticateToken, async (req, res) => {
  try {
    const { eventId, rating, comment } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (!eventId || !rating) {
      return res.status(400).json({ message: 'Please provide eventId and rating' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if already submitted feedback
    const [existingFeedback] = await pool.query(
      'SELECT * FROM FEEDBACK WHERE userID = ? AND eventID = ?',
      [userId, eventId]
    );

    if (existingFeedback.length > 0) {
      return res.status(400).json({ message: 'You have already submitted feedback for this event' });
    }

    // Submit feedback
    const [result] = await pool.query(
      'INSERT INTO FEEDBACK (userID, eventID, rating, comment) VALUES (?, ?, ?, ?)',
      [userId, eventId, rating, comment]
    );

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedbackId: result.insertId
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ message: 'Server error during feedback submission' });
  }
});

// Get user registrations
app.get('/users/:id/registrations', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Ensure user can only access their own registrations
    if (req.user.id !== parseInt(userId) && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get attendee ID
    const [attendees] = await pool.query(
      'SELECT attendeeID FROM ATTENDEE WHERE userID = ?',
      [userId]
    );

    if (attendees.length === 0) {
      return res.json([]);
    }

    const attendeeId = attendees[0].attendeeID;

    // Get registrations with event details
    const [registrations] = await pool.query(
      `SELECT r.*, e.*
       FROM REGISTRATION r
       JOIN EVENT e ON r.eventID = e.eventID
       WHERE r.attendeeID = ?
       ORDER BY e.date DESC`,
      [attendeeId]
    );

    res.status(200).json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ message: 'Server error while fetching registrations' });
  }
});

// Get event registrations (admin only)
app.get('/events/:id/registrations', authenticateToken, isAdmin, async (req, res) => {
  try {
    const eventId = req.params.id;

    const [registrations] = await pool.query(
      `SELECT r.*, a.userID, u.name, u.email
       FROM REGISTRATION r
       JOIN ATTENDEE a ON r.attendeeID = a.attendeeID
       JOIN USER u ON a.userID = u.userID
       WHERE r.eventID = ?
       ORDER BY r.registerDate DESC`,
      [eventId]
    );

    res.status(200).json(registrations);
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    res.status(500).json({ message: 'Server error while fetching registrations' });
  }
});

// Get event feedback
app.get('/events/:id/feedback', async (req, res) => {
  try {
    const eventId = req.params.id;

    const [feedback] = await pool.query(
      `SELECT f.*, u.name
       FROM FEEDBACK f
       JOIN USER u ON f.userID = u.userID
       WHERE f.eventID = ?
       ORDER BY f.submittedAt DESC`,
      [eventId]
    );

    res.status(200).json(feedback);
  } catch (error) {
    console.error('Error fetching event feedback:', error);
    res.status(500).json({ message: 'Server error while fetching feedback' });
  }
});

// Get notifications
app.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [notifications] = await pool.query(
      `SELECT n.*, e.title as eventTitle
       FROM NOTIFICATION n
       LEFT JOIN EVENT e ON n.eventID = e.eventID
       WHERE n.userID = ?
       ORDER BY n.createdAt DESC`,
      [userId]
    );

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error while fetching notifications' });
  }
});

// Mark notification as read
app.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    // Ensure user can only mark their own notifications
    const [notifications] = await pool.query(
      'SELECT * FROM NOTIFICATION WHERE notificationID = ? AND userID = ?',
      [notificationId, userId]
    );

    if (notifications.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Mark as read
    await pool.query(
      'UPDATE NOTIFICATION SET isRead = true WHERE notificationID = ?',
      [notificationId]
    );

    res.status(200).json({
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ message: 'Server error while updating notification' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
