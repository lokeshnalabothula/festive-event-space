
# Event Management System

A comprehensive event management system with user authentication, event registration, employee management, and feedback collection.

## Features

- User authentication (register/login)
- Event listing and management
- Event registration for users
- Employee assignment to events
- Feedback submission for events
- Admin dashboard with statistics
- Responsive design

## Technologies Used

- **Frontend**: React.js, Tailwind CSS, shadcn/ui components
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/event-management-system.git
cd event-management-system
```

### 2. Set up the database

1. Log in to MySQL:
```bash
mysql -u root -p
```

2. Create the database:
```sql
CREATE DATABASE event_management;
USE event_management;
```

3. Import the database schema:
```bash
mysql -u root -p event_management < backend/db/database_schema.sql
```

### 3. Set up the backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file with the following content (replace with your values):
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=event_management
JWT_SECRET=your_jwt_secret
```

4. Start the backend server:
```bash
npm start
```

The server will run on http://localhost:5000.

### 4. Set up the frontend

1. Navigate to the frontend directory:
```bash
cd ../frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file with the following content:
```
REACT_APP_API_URL=http://localhost:5000
```

4. Start the frontend development server:
```bash
npm start
```

The application will open in your default web browser at http://localhost:3000.

## Demo Accounts

Use these accounts to test the application:

- **Admin User**:
  - Email: admin@example.com
  - Password: any password (for demo purposes)

- **Regular User**:
  - Email: user@example.com
  - Password: any password (for demo purposes)

## API Endpoints

### Authentication
- POST `/registerUser` - Register a new user
- POST `/login` - Authenticate users
- POST `/logout` - Log out user

### Events
- GET `/events` - Get all events
- GET `/events/:id` - Get event by ID
- POST `/createEvent` - Create a new event (admin only)
- POST `/registerEvent` - Register for an event

### Employees
- GET `/employees` - Get all employees (admin only)
- POST `/employees` - Create employee (admin only)
- PUT `/employees/:id` - Update employee (admin only)
- DELETE `/employees/:id` - Delete employee (admin only)
- POST `/assignEvent` - Assign employee to event (admin only)

### Feedback
- POST `/feedback` - Submit feedback for an event
- GET `/events/:id/feedback` - Get event feedback

### Registrations
- GET `/users/:id/registrations` - Get user registrations
- GET `/events/:id/registrations` - Get event registrations (admin only)

### Notifications
- GET `/notifications` - Get user notifications
- PUT `/notifications/:id/read` - Mark notification as read

## Project Structure

```
.
├── backend/
│   ├── db/
│   │   └── database_schema.sql
│   ├── server.js
│   └── package.json
├── src/
│   ├── components/
│   ├── contexts/
│   ├── pages/
│   ├── services/
│   └── ...
└── package.json
```

## License

This project is licensed under the MIT License.
