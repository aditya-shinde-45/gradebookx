import { Teacher, CourseAssignment } from '../models/Course.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const teacherLogin = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const teacherEmail = email || username;
    
    if (!teacherEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const teacher = await Teacher.findOne({ where: { email: teacherEmail } });
    if (teacher && teacher.password === password) {
      res.json({
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        token: generateToken(teacher.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTeacherAssignments = async (req, res) => {
  try {
    const { email, academicYear } = req.query;
    console.log('Fetching assignments for email:', email, 'academic year:', academicYear);
    
    if (!email || email === 'undefined') {
      return res.status(400).json({ message: 'Teacher email is required' });
    }
    
    const whereClause = { teacherEmail: email };
    if (academicYear) {
      whereClause.academicYear = academicYear;
    }
    
    const assignments = await CourseAssignment.findAll({
      where: whereClause
    });
    
    console.log('Found assignments:', assignments.length);
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching teacher assignments:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllSubjectAssignments = async (req, res) => {
  try {
    const assignments = await CourseAssignment.findAll();
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTeacherStudents = async (req, res) => {
  try {
    const { email, academicYear } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Teacher email is required' });
    }
    
    // Get teacher's assignments
    const whereClause = { teacherEmail: email };
    if (academicYear) {
      whereClause.academicYear = academicYear;
    }
    
    const assignments = await CourseAssignment.findAll({
      where: whereClause
    });
    
    if (assignments.length === 0) {
      return res.json([]);
    }
    
    // Get students for each assignment
    const { Student } = await import('../models/Course.js');
    const students = [];
    
    for (const assignment of assignments) {
      const studentWhereClause = {
        courseId: assignment.courseId,
        division: assignment.division,
        semester: assignment.semester
      };
      if (assignment.academicYear) {
        studentWhereClause.academicYear = assignment.academicYear;
      }
      
      const assignmentStudents = await Student.findAll({
        where: studentWhereClause
      });
      
      // Add course and division info to each student
      assignmentStudents.forEach(student => {
        students.push({
          ...student.toJSON(),
          courseName: assignment.courseName,
          division: assignment.division,
          semester: assignment.semester,
          subject: assignment.subject,
          academicYear: assignment.academicYear
        });
      });
    }
    
    res.json(students);
  } catch (error) {
    console.error('Error fetching teacher students:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getTeacherClassStats = async (req, res) => {
  try {
    const { email, academicYear } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Teacher email is required' });
    }
    
    // Get teacher's assignments
    const whereClause = { teacherEmail: email };
    if (academicYear) {
      whereClause.academicYear = academicYear;
    }
    
    const assignments = await CourseAssignment.findAll({
      where: whereClause
    });
    
    if (assignments.length === 0) {
      return res.json([]);
    }
    
    // Get student count for each assignment
    const { Student } = await import('../models/Course.js');
    const classStats = [];
    
    for (const assignment of assignments) {
      const studentWhereClause = {
        courseId: assignment.courseId,
        division: assignment.division,
        semester: assignment.semester
      };
      if (assignment.academicYear) {
        studentWhereClause.academicYear = assignment.academicYear;
      }
      
      const studentCount = await Student.count({
        where: studentWhereClause
      });
      
      classStats.push({
        id: assignment.id,
        courseName: assignment.courseName,
        division: assignment.division,
        semester: assignment.semester,
        subject: assignment.subject,
        studentCount: studentCount,
        courseId: assignment.courseId,
        academicYear: assignment.academicYear
      });
    }
    
    res.json(classStats);
  } catch (error) {
    console.error('Error fetching teacher class stats:', error);
    res.status(500).json({ message: error.message });
  }
};