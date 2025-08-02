import { sequelize } from './config/database.js';
import { Teacher, CourseAssignment, Student, Marks } from './models/Course.js';

const seedData = async () => {
  try {
    // Sync database
    await sequelize.sync({ alter: true });
    
    // Clear existing data
    await Marks.destroy({ where: {} });
    await CourseAssignment.destroy({ where: {} });
    await Teacher.destroy({ where: {} });
    await Student.destroy({ where: {} });
    
    // Create teachers
    const teachers = await Teacher.bulkCreate([
      { name: 'Alice Johnson', email: 'alice@university.edu', password: 'password123' },
      { name: 'Bob Smith', email: 'bob@university.edu', password: 'password123' },
      { name: 'Carol Davis', email: 'carol@university.edu', password: 'password123' },
      { name: 'David Wilson', email: 'david@university.edu', password: 'password123' }
    ]);
    
    // Create course assignments
    await CourseAssignment.bulkCreate([
      {
        courseId: 'CS101',
        courseName: 'Computer Science',
        subject: 'Programming Fundamentals',
        division: 'A',
        teacherName: 'Alice Johnson',
        teacherEmail: 'alice@university.edu',
        teacherPassword: 'password123'
      },
      {
        courseId: 'CS101',
        courseName: 'Computer Science',
        subject: 'Data Structures',
        division: 'B',
        teacherName: 'Alice Johnson',
        teacherEmail: 'alice@university.edu',
        teacherPassword: 'password123'
      },
      {
        courseId: 'MATH101',
        courseName: 'Mathematics',
        subject: 'Calculus',
        division: 'A',
        teacherName: 'Bob Smith',
        teacherEmail: 'bob@university.edu',
        teacherPassword: 'password123'
      },
      {
        courseId: 'PHY101',
        courseName: 'Physics',
        subject: 'Mechanics',
        division: 'A',
        teacherName: 'Carol Davis',
        teacherEmail: 'carol@university.edu',
        teacherPassword: 'password123'
      }
    ]);
    
    // Create students
    const students = await Student.bulkCreate([
      {
        studentName: 'John Doe',
        email: 'john@student.edu',
        rollNo: '101',
        enrollmentNo: 'EN2024001',
        courseId: 'CS101',
        division: 'A'
      },
      {
        studentName: 'Jane Smith',
        email: 'jane@student.edu',
        rollNo: '102',
        enrollmentNo: 'EN2024002',
        courseId: 'CS101',
        division: 'A'
      },
      {
        studentName: 'Mike Johnson',
        email: 'mike@student.edu',
        rollNo: '103',
        enrollmentNo: 'EN2024003',
        courseId: 'CS101',
        division: 'B'
      },
      {
        studentName: 'Sarah Wilson',
        email: 'sarah@student.edu',
        rollNo: '104',
        enrollmentNo: 'EN2024004',
        courseId: 'MATH101',
        division: 'A'
      },
      {
        studentName: 'Tom Brown',
        email: 'tom@student.edu',
        rollNo: '105',
        enrollmentNo: 'EN2024005',
        courseId: 'PHY101',
        division: 'A'
      }
    ], { returning: true });
    
    // Create some sample marks
    await Marks.bulkCreate([
      {
        studentId: students[0].id, // John Doe
        courseId: 'CS101',
        division: 'A',
        subject: 'Programming Fundamentals',
        marks: 85.5,
        teacherEmail: 'alice@university.edu'
      },
      {
        studentId: students[1].id, // Jane Smith
        courseId: 'CS101',
        division: 'A',
        subject: 'Programming Fundamentals',
        marks: 92.0,
        teacherEmail: 'alice@university.edu'
      },
      {
        studentId: students[2].id, // Mike Johnson
        courseId: 'CS101',
        division: 'B',
        subject: 'Data Structures',
        marks: 78.5,
        teacherEmail: 'alice@university.edu'
      },
      {
        studentId: students[3].id, // Sarah Wilson
        courseId: 'MATH101',
        division: 'A',
        subject: 'Calculus',
        marks: 88.0,
        teacherEmail: 'bob@university.edu'
      }
    ]);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();