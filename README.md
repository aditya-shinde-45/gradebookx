# GradeBookX - Student Grade Management System

A comprehensive web application for managing student grades, courses, and teacher assignments built with modern web technologies.

## 🚀 Tech Stack

### Frontend
- **React 19.1.0** - Modern JavaScript library for building user interfaces
- **Vite 7.0.4** - Fast build tool and development server
- **Tailwind CSS 4.1.11** - Utility-first CSS framework for rapid UI development
- **React Router DOM 7.7.1** - Declarative routing for React applications
- **PostCSS & Autoprefixer** - CSS processing and vendor prefixing

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js 4.18.2** - Fast, unopinionated web framework for Node.js
- **Sequelize 6.35.0** - Promise-based ORM for PostgreSQL
- **PostgreSQL** - Advanced open-source relational database
- **JWT (jsonwebtoken 9.0.2)** - Secure token-based authentication
- **bcryptjs 2.4.3** - Password hashing library
- **CORS 2.8.5** - Cross-Origin Resource Sharing middleware
- **dotenv 16.3.1** - Environment variable management

### Development Tools
- **ESLint** - Code linting and quality assurance
- **Nodemon** - Auto-restart development server
- **pg & pg-hstore** - PostgreSQL client for Node.js

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/)

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd gradebookx
```

### 2. Backend Setup

#### Navigate to backend directory
```bash
cd backend
```

#### Install dependencies
```bash
npm install
```

#### Environment Configuration
Create a `.env` file in the backend directory:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_postgresql_password
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

#### Database Setup
1. Start PostgreSQL service
2. Create a database (or use existing 'postgres' database)
3. Update the `.env` file with your PostgreSQL credentials

#### Start Backend Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:5000`

### 3. Frontend Setup

#### Navigate to frontend directory
```bash
cd ../frontend
```

#### Install dependencies
```bash
npm install
```

#### Start Development Server
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🏗️ Project Structure

```
gradebookx/
├── backend/
│   ├── config/
│   │   └── database.js          # Database connection configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── courseController.js  # Course management logic
│   │   └── teacherController.js # Teacher-specific operations
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT authentication middleware
│   ├── models/
│   │   ├── User.js             # User model (admin/teacher)
│   │   └── Course.js           # Course, Subject, Division, Teacher models
│   ├── routes/
│   │   ├── authRoutes.js       # Authentication endpoints
│   │   ├── courseRoutes.js     # Course management endpoints
│   │   └── teacherRoutes.js    # Teacher-specific endpoints
│   ├── .env                    # Environment variables
│   ├── package.json            # Backend dependencies
│   └── server.js               # Main server file
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── Components/
│   │   │   └── Teachers/       # Teacher-specific components
│   │   ├── Pages/
│   │   │   └── Teacher/        # Teacher dashboard pages
│   │   ├── AppRoutes/          # Application routing
│   │   ├── assets/             # Static assets
│   │   ├── App.jsx             # Main App component
│   │   ├── main.jsx            # Application entry point
│   │   └── index.css           # Global styles with Tailwind
│   ├── package.json            # Frontend dependencies
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   ├── postcss.config.js       # PostCSS configuration
│   └── vite.config.js          # Vite build configuration
└── README.md                   # Project documentation
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Teacher Authentication
- `POST /api/teacher/login` - Teacher login
- `GET /api/teacher/:id/assignments` - Get teacher's assigned subjects and classes

### Course Management
- `POST /api/courses/add` - Add new course with subjects and divisions
- `GET /api/courses` - Get all courses
- `DELETE /api/courses/:id` - Delete a course

## 📊 Database Schema

### Tables
- **Users** - Admin and teacher accounts
- **Courses** - Course information (courseId, courseName)
- **Subjects** - Subjects within courses
- **Divisions** - Class divisions within courses
- **Teachers** - Teacher accounts with credentials
- **SubjectAssignments** - Junction table linking teachers to subjects and divisions

## 🚀 Features

### Current Features
- **Course Management**: Create, view, and delete courses with subjects and divisions
- **Teacher Authentication**: Secure login system for teachers
- **Teacher Assignments**: View assigned subjects and classes
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

### Planned Features
- Student management
- Grade entry and calculation
- Report generation
- Attendance tracking
- Parent portal

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev  # Starts server with nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm run dev  # Starts Vite dev server with hot reload
```

### Building for Production
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm start
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`
   - Verify database exists

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing processes: `taskkill /f /im node.exe` (Windows)

3. **Module Not Found Errors**
   - Run `npm install` in both frontend and backend directories
   - Clear node_modules and reinstall if needed

4. **Tailwind Styles Not Loading**
   - Ensure Tailwind directives are in `src/index.css`
   - Check `tailwind.config.js` content paths

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000                    # Server port
DB_HOST=localhost           # Database host
DB_PORT=5432               # Database port
DB_NAME=postgres           # Database name
DB_USER=postgres           # Database username
DB_PASSWORD=your_password  # Database password
JWT_SECRET=your_secret     # JWT signing secret
NODE_ENV=development       # Environment mode
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

**Happy Coding! 🎉**