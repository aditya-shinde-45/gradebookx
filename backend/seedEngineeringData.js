import { sequelize } from './config/database.js';
import { Teacher, CourseAssignment, Student, Marks } from './models/Course.js';

const seedEngineeringData = async () => {
  try {
    console.log('Starting NAPS ITI data seeding...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection successful');
    
    // Sync database
    await sequelize.sync({ alter: true });
    console.log('Database sync completed');
    
    // Create teachers for ITI subjects
    const teachersData = [
      { name: 'Shri Ramesh Kumar', email: 'ramesh@napsiti.edu', password: 'password123' },
      { name: 'Smt. Sunita Devi', email: 'sunita@napsiti.edu', password: 'password123' },
      { name: 'Shri Manoj Singh', email: 'manoj@napsiti.edu', password: 'password123' },
      { name: 'Smt. Kavita Sharma', email: 'kavita@napsiti.edu', password: 'password123' },
      { name: 'Shri Rajesh Yadav', email: 'rajesh@napsiti.edu', password: 'password123' },
      { name: 'Smt. Priya Gupta', email: 'priya@napsiti.edu', password: 'password123' },
      { name: 'Shri Deepak Verma', email: 'deepak@napsiti.edu', password: 'password123' },
      { name: 'Smt. Anita Patel', email: 'anita@napsiti.edu', password: 'password123' }
    ];
    
    const teachers = [];
    for (const teacherData of teachersData) {
      const teacher = await Teacher.create(teacherData);
      teachers.push(teacher);
    }
    
    // ITI subjects by semester
    const semesterSubjects = {
      3: ['CP35301T', 'CP35302T', 'CP35303T', 'CP35304T', 'CP35305T'],
      4: ['CP35401T', 'CP35402T', 'CP35403T', 'CP35404T', 'CP35405T'],
      5: ['CP35501T', 'CP35502T', 'CP35503T', 'CP35504T', 'CP35505T'],
      6: ['CP35601T', 'CP35602T', 'CP35603T', 'CP35604T', 'CP35605T']
    };
    
    // Create course assignments for NAPS ITI (3 divisions: A, B, C)
    const assignments = [];
    const divisions = ['A', 'B', 'C'];
    const semesters = [3, 4, 5, 6];
    const academicYear = '2024-25';
    
    semesters.forEach(semester => {
      divisions.forEach(division => {
        semesterSubjects[semester].forEach((subject, subIndex) => {
          assignments.push({
            courseId: 'NAPS-ITI',
            courseName: 'NAPS ITI',
            academicYear: academicYear,
            semester: semester,
            subject: subject,
            division: division,
            teacherName: teachers[subIndex % teachers.length].name,
            teacherEmail: teachers[subIndex % teachers.length].email,
            teacherPassword: 'password123'
          });
        });
      });
    });
    
    for (const assignment of assignments) {
      await CourseAssignment.create(assignment);
    }
    
    // Generate realistic Indian student names
    const firstNames = [
      'Rahul', 'Amit', 'Suresh', 'Vikash', 'Ravi', 'Deepak', 'Manoj', 'Sanjay', 'Ajay', 'Vinod',
      'Rajesh', 'Mukesh', 'Ashok', 'Santosh', 'Dinesh', 'Ramesh', 'Naresh', 'Mahesh', 'Sunil', 'Anil',
      'Pooja', 'Sunita', 'Kavita', 'Anita', 'Geeta', 'Seema', 'Neha', 'Priya', 'Ritu', 'Sita',
      'Rekha', 'Meera', 'Radha', 'Shanti', 'Kamala', 'Usha', 'Asha', 'Lata', 'Maya', 'Devi'
    ];
    
    const lastNames = [
      'Kumar', 'Singh', 'Yadav', 'Sharma', 'Gupta', 'Verma', 'Patel', 'Mishra', 'Tiwari', 'Pandey',
      'Joshi', 'Agarwal', 'Srivastava', 'Chaudhary', 'Thakur', 'Maurya', 'Chauhan', 'Rajput', 'Jain', 'Shah'
    ];
    
    // Create students with proper semester progression (failed students stay in same semester)
    const students = [];
    let rollNo = 1;
    
    // Calculate joining dates: 6 months gap per semester starting from 2023
    const getJoiningDate = (semester) => {
      const baseDate = new Date('2023-01-01');
      const monthsToAdd = (semester - 1) * 6;
      baseDate.setMonth(baseDate.getMonth() + monthsToAdd);
      return baseDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    };
    
    // Create all students for all semesters (25 per division per semester)
    semesters.forEach(semester => {
      divisions.forEach(division => {
        for (let i = 0; i < 25; i++) {
          const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
          const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
          const studentName = `${firstName} ${lastName}`;
          
          students.push({
            studentName: studentName,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${rollNo}@napsiti.edu`,
            rollNo: `${semester}${division}${rollNo.toString().padStart(2, '0')}`,
            enrollmentNo: `ITI2024${rollNo.toString().padStart(4, '0')}`,
            courseId: 'NAPS-ITI',
            academicYear: academicYear,
            semester: semester,
            division: division,
            dateOfJoining: getJoiningDate(semester),
            status: 'active'
          });
          rollNo++;
        }
      });
    });
    
    const createdStudents = [];
    for (const studentData of students) {
      const student = await Student.create(studentData);
      createdStudents.push(student);
    }
    
    // Generate realistic marks for each student
    const marks = [];
    
    createdStudents.forEach(student => {
      const subjects = semesterSubjects[student.semester];
      let hasFailedSubject = false;
      
      subjects.forEach(subject => {
        let baseScore;
        const random = Math.random();
        
        // Normal distribution for all students
        if (random < 0.15) { // 15% excellent
          baseScore = 80 + Math.random() * 20; // 80-100
        } else if (random < 0.35) { // 20% good
          baseScore = 65 + Math.random() * 15; // 65-80
        } else if (random < 0.75) { // 40% average
          baseScore = 45 + Math.random() * 20; // 45-65
        } else { // 25% below average
          baseScore = 30 + Math.random() * 15; // 30-45
        }
        
        // Add subject-specific variation
        if (subject.includes('Mathematics') || subject.includes('Physics')) {
          baseScore -= Math.random() * 5;
        }
        if (subject.includes('Communication') || subject.includes('Environmental')) {
          baseScore += Math.random() * 5;
        }
        
        const finalScore = Math.max(25, Math.min(100, Math.round(baseScore * 100) / 100));
        
        if (finalScore < 40) {
          hasFailedSubject = true;
        }
        
        marks.push({
          studentId: student.id,
          courseId: 'NAPS-ITI',
          academicYear: academicYear,
          semester: student.semester,
          division: student.division,
          subject: subject,
          marks: finalScore,
          teacherEmail: teachers[subjects.indexOf(subject) % teachers.length].email
        });
      });
    });
    
    for (const markData of marks) {
      await Marks.create(markData);
    }
    
    // Update student status based on their marks
    for (const student of createdStudents) {
      if (student.status === 'active') {
        const studentMarks = marks.filter(m => m.studentId === student.id);
        const hasFailedSubject = studentMarks.some(m => m.marks < 40);
        
        if (hasFailedSubject) {
          await Student.update(
            { status: 'failed' },
            { where: { id: student.id } }
          );
        }
      }
    }
    
    console.log('NAPS ITI data seeded successfully!');
    console.log(`Created ${teachers.length} teachers`);
    console.log(`Created ${createdStudents.length} students across ${semesters.length} semesters and 3 divisions`);
    console.log(`Created ${marks.length} marks entries`);
    
    // Print semester-wise student count and status
    const semesterCounts = {};
    const statusCounts = { active: 0, failed: 0, promoted: 0 };
    createdStudents.forEach(s => {
      semesterCounts[s.semester] = (semesterCounts[s.semester] || 0) + 1;
    });
    
    // Count students by status after marks processing
    const updatedStudents = await Student.findAll();
    updatedStudents.forEach(s => {
      statusCounts[s.status]++;
    });
    
    console.log('Students per semester:', semesterCounts);
    console.log('Students by status:', statusCounts);
  } catch (error) {
    console.error('Error seeding NAPS ITI data:', error);
    throw error;
  }
};

// Run the seed function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedEngineeringData().then(() => {
    console.log('Seeding completed');
    process.exit(0);
  }).catch(error => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
}

export default seedEngineeringData;