import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
import teacherRoutes from './routes/teacherRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import marksRoutes from './routes/marksRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/marks', marksRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'GradeBookX API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
