# Campus Skill Exchange Platform

Campus Skill Exchange is a full-stack MERN web application where students can list skills, discover peer instructors, request learning sessions, schedule accepted sessions, track progress, mark sessions as completed, and give reviews and ratings.

The platform is designed to make peer-to-peer learning inside a campus more organized and accessible.

---

## Problem Statement

In colleges, many students have useful skills, but there is no structured system to find who can teach a particular skill. Students usually depend on WhatsApp groups or personal contacts, which makes skill discovery and session management difficult.

Campus Skill Exchange solves this by providing a centralized platform where students can offer skills, request sessions, schedule learning, track progress, and review instructors.

---

## Features

### Authentication

* User registration and login
* JWT-based authentication
* Password hashing
* Protected routes
* Auth state management using frontend context

### Skill Management

* Add a skill
* View all listed skills
* Edit and delete own skills
* Skill category, description, and learning mode
* Instructor information on each skill

### Request and Session Management

* Send request to learn a skill
* Accept or reject received requests
* Schedule accepted sessions
* Mark session as In Progress
* Mark session as Completed
* Track sent and received requests from dashboard

### Reviews and Ratings

* Learner can review instructor after session completion
* Rating system for instructors
* Skill-specific instructor rating
* Instructor details page with:

  * Instructor name
  * Listed skills
  * Reviews
  * Overall rating
  * Skill-specific rating

### Additional Features

* User dashboard
* Profile page
* Notifications structure
* Analytics backend structure
* MongoDB Atlas database connection
* Clean frontend-backend API integration using Axios

---

## Tech Stack

### Frontend

* React.js
* Vite
* JavaScript
* HTML
* CSS
* React Router DOM
* Axios
* Context API

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs
* dotenv
* cors
* nodemon

### Database

* MongoDB Atlas

---

## Project Workflow

```txt
Request Sent
↓
Pending
↓
Accepted / Rejected
↓
Scheduled
↓
In Progress
↓
Completed
↓
Review and Rating
```

---

## Folder Structure

```txt
campus-skill-exchange/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── data/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── README.md


## Backend Setup

Go to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` folder.

You can refer to:

```txt
backend/.env.example
```

Add the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

Start backend server:

```bash
npm run dev
```

Backend runs on:

```txt
http://localhost:5000
```

---

## Frontend Setup

Open another terminal and go to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start frontend:

```bash
npm run dev
```

Frontend runs on:

```txt
http://localhost:5173
```

---

## Frontend and Backend Connection

The frontend connects to the backend using Axios.

File:

```txt
frontend/src/api/api.js
```

Example:

```js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;
```

For deployment, replace the local backend URL with your deployed backend URL.

---

## Environment Variables

The real `.env` file is not pushed to GitHub for security reasons.

Required backend variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

GitHub should include:

```txt
backend/.env.example
```

GitHub should not include:

```txt
backend/.env
```

---

## API Routes

### Auth Routes

```txt
POST /api/auth/register
POST /api/auth/login
```

### Skill Routes

```txt
GET    /api/skills
POST   /api/skills
GET    /api/skills/:id
PUT    /api/skills/:id
DELETE /api/skills/:id
```

### Request and Session Routes

```txt
POST /api/requests
GET  /api/requests/sent
GET  /api/requests/received
PUT  /api/requests/:id/status
PUT  /api/requests/:id/schedule
PUT  /api/requests/:id/progress
PUT  /api/requests/:id/complete
```

### Review Routes

```txt
POST /api/reviews
GET  /api/reviews
GET  /api/reviews/instructor/:instructorId
GET  /api/reviews/skill/:skillId
```

### Notification Routes

```txt
GET /api/notifications
PUT /api/notifications/:id/read
```

### Analytics Routes

```txt
GET /api/analytics
```

Route names may vary slightly depending on the final backend implementation.

---

## Database Collections

MongoDB stores data in collections such as:

```txt
users
skills
sessionrequests
reviews
notifications
```

Main database:

```txt
campusSkillExchange
```

---

## Screenshots

Add screenshots after uploading images to the repository.

```md
## Home Page
![Home Page](./screenshots/home.png)

## Skills Page
![Skills Page](./screenshots/skills.png)

## Dashboard
![Dashboard](./screenshots/dashboard.png)

## Instructor Profile
![Instructor Profile](./screenshots/instructor.png)
```

---

## Current Status

Completed:

* Frontend UI
* Backend APIs
* MongoDB Atlas connection
* User registration and login
* JWT authentication
* Protected routes
* Skill listing and management
* Request accept/reject workflow
* Session scheduling
* Session progress tracking
* Session completion
* Review and rating system
* Instructor profile/details page
* Dashboard
* Notifications backend structure
* Analytics backend structure

---

## Future Improvements

* Admin dashboard
* Trending skills section
* Skill recommendation system
* Search, filter, sorting, and pagination
* Real-time notifications
* Email notifications
* Deployment on Vercel and Render
* Profile image upload
* Calendar integration for scheduled sessions
* Certificate or badge system after completed sessions

---

## Resume Description

Campus Skill Exchange Platform is a full-stack MERN peer-learning platform where students can list skills, discover peer instructors, request learning sessions, schedule accepted sessions, track session progress, mark sessions as completed, and give reviews and ratings. The project includes JWT authentication, MongoDB database design, REST APIs, protected routes, instructor profiles, and frontend-backend integration using Axios.

---

## Resume Points

* Built a full-stack MERN peer-learning platform where students can list skills, request learning sessions, schedule accepted sessions, and track session progress.
* Implemented JWT authentication, password hashing, protected routes, REST APIs, and MongoDB models for users, skills, session requests, reviews, and notifications.
* Designed a complete request-to-session workflow including request acceptance, session scheduling, progress tracking, completion marking, and post-session review/rating.
* Developed instructor profile functionality showing instructor details, listed skills, reviews, overall rating, and skill-specific rating.

---

## Author

Developed by Anshuman Udgata.

---

## License

This project is created for learning, portfolio, and academic purposes.
