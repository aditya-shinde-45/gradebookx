import { sequelize } from './config/database.js';
import { Teacher, CourseAssignment, Student, Marks } from './models/Course.js';

const seedRealisticData = async () => {
  try {
    // Sync database
    await sequelize.sync({ alter: true });
    
    // Clear existing data
    await Marks.destroy({ where: {} });
    await CourseAssignment.destroy({ where: {} });
    await Teacher.destroy({ where: {} });
    await Student.destroy({ where: {} });
    
    // Create teachers for 10th standard subjects
    const teachers = await Teacher.bulkCreate([
      { name: 'Dr. Rajesh Kumar', email: 'rajesh@school.edu', password: 'password123' },
      { name: 'Mrs. Priya Sharma', email: 'priya@school.edu', password: 'password123' },
      { name: 'Mr. Amit Singh', email: 'amit@school.edu', password: 'password123' },
      { name: 'Ms. Sunita Patel', email: 'sunita@school.edu', password: 'password123' },
      { name: 'Dr. Vikram Gupta', email: 'vikram@school.edu', password: 'password123' },
      { name: 'Mrs. Kavita Joshi', email: 'kavita@school.edu', password: 'password123' }
    ], { returning: true });
    
    // 10th standard subjects
    const subjects = [
      'Mathematics',
      'Science',
      'English',
      'Hindi',
      'Social Science',
      'Computer Science'
    ];
    
    // Create course assignments for 10th standard (3 divisions: A, B, C)
    const assignments = [];
    const divisions = ['A', 'B', 'C'];
    
    divisions.forEach((division, divIndex) => {
      subjects.forEach((subject, subIndex) => {
        assignments.push({
          courseId: 'CLASS10',
          courseName: 'Class 10',
          subject: subject,
          division: division,
          teacherName: teachers[subIndex].name,
          teacherEmail: teachers[subIndex].email,
          teacherPassword: 'password123'
        });
      });
    });
    
    await CourseAssignment.bulkCreate(assignments);
    
    // Generate realistic student names
    const firstNames = [
      'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan',
      'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Rishabh', 'Aryan', 'Kabir', 'Ansh', 'Kian', 'Rudra',
      'Saanvi', 'Aadya', 'Kiara', 'Diya', 'Pihu', 'Prisha', 'Ananya', 'Fatima', 'Anika', 'Myra',
      'Sara', 'Pari', 'Kavya', 'Ira', 'Riya', 'Navya', 'Zara', 'Jiya', 'Arya', 'Tara'
    ];
    
    const lastNames = [
      'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Jain', 'Agarwal', 'Bansal', 'Mittal',
      'Joshi', 'Tiwari', 'Mishra', 'Yadav', 'Pandey', 'Srivastava', 'Saxena', 'Arora', 'Malhotra', 'Kapoor',
      'Chopra', 'Bhatia', 'Sethi', 'Khanna', 'Goel', 'Aggarwal', 'Singhal', 'Goyal', 'Jindal', 'Mahajan'
    ];
    
    // Create 75 students (25 per division)
    const students = [];
    let rollNo = 1;
    
    divisions.forEach(division => {
      for (let i = 0; i < 25; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const studentName = `${firstName} ${lastName}`;
        
        students.push({
          studentName: studentName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${rollNo}@student.edu`,
          rollNo: rollNo.toString().padStart(3, '0'),
          enrollmentNo: `EN2024${rollNo.toString().padStart(3, '0')}`,
          courseId: 'CLASS10',
          division: division
        });
        rollNo++;
      }
    });
    
    const createdStudents = await Student.bulkCreate(students, { returning: true });
    
    // Generate realistic marks for each student in each subject
    const marks = [];
    
    createdStudents.forEach(student => {
      subjects.forEach(subject => {
        // Generate realistic marks with some variation
        let baseScore;
        const random = Math.random();
        
        if (random < 0.1) { // 10% excellent students
          baseScore = 85 + Math.random() * 15; // 85-100
        } else if (random < 0.3) { // 20% good students
          baseScore = 70 + Math.random() * 15; // 70-85
        } else if (random < 0.7) { // 40% average students
          baseScore = 50 + Math.random() * 20; // 50-70
        } else { // 30% below average students
          baseScore = 35 + Math.random() * 15; // 35-50
        }
        
        // Add some subject-specific variation
        if (subject === 'Mathematics' || subject === 'Science') {
          baseScore -= Math.random() * 5; // Slightly harder subjects
        }
        if (subject === 'English' || subject === 'Hindi') {
          baseScore += Math.random() * 3; // Language subjects slightly easier
        }
        
        const finalScore = Math.max(25, Math.min(100, Math.round(baseScore * 100) / 100));
        
        marks.push({
          studentId: student.id,
          courseId: 'CLASS10',
          division: student.division,
          subject: subject,
          marks: finalScore,
          teacherEmail: teachers[subjects.indexOf(subject)].email
        });
      });
    });
    
    await Marks.bulkCreate(marks);
    
    console.log('Realistic 10th standard data seeded successfully!');
    console.log(`Created ${teachers.length} teachers`);
    console.log(`Created ${createdStudents.length} students across 3 divisions`);
    console.log(`Created ${marks.length} marks entries`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding realistic data:', error);
    process.exit(1);
  }
};

seedRealisticData();