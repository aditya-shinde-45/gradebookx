import { Student, CourseAssignment, Marks } from '../models/Course.js';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';

// Ensure uploads directory exists
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

export const addStudents = async (req, res) => {
  try {
    const { courseId, division, semester, academicYear, students } = req.body;

    if (!courseId || !division || !semester || !academicYear || !students || !Array.isArray(students)) {
      return res.status(400).json({ message: 'Course ID, division, semester, academic year, and students array are required' });
    }

    const createdStudents = [];
    const errors = [];

    for (const student of students) {
      try {
        const newStudent = await Student.create({
          studentName: student.studentName,
          email: student.email,
          rollNo: student.rollNo,
          enrollmentNo: student.enrollmentNo,
          courseId,
          division,
          semester: parseInt(semester),
          academicYear
        });
        createdStudents.push(newStudent);
      } catch (error) {
        errors.push({
          student: student.studentName,
          error: error.message
        });
      }
    }

    res.status(201).json({
      message: `${createdStudents.length} students added successfully`,
      students: createdStudents,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error adding students:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

export const getStudents = async (req, res) => {
  try {
    const { courseId, division, semester, academicYear } = req.query;
    
    const whereClause = {};
    if (courseId) whereClause.courseId = courseId;
    if (division) whereClause.division = division;
    if (semester) whereClause.semester = parseInt(semester);
    if (academicYear) whereClause.academicYear = academicYear;

    const students = await Student.findAll({ where: whereClause });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    await student.destroy();
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadCSV = (req, res, next) => {
  upload.single('csvFile')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

export const getCoursesForUpload = async (req, res) => {
  try {
    const courses = await CourseAssignment.findAll({
      attributes: ['courseId', 'courseName', 'semester', 'division'],
      group: ['courseId', 'courseName', 'semester', 'division'],
      order: [['courseId', 'ASC'], ['semester', 'ASC'], ['division', 'ASC']]
    });
    
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses for upload:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getStudentProgression = async (req, res) => {
  try {
    const { courseId, semester, division, academicYear } = req.query;
    
    if (!courseId || !semester || !division || !academicYear) {
      return res.status(400).json({ message: 'Course ID, semester, division, and academic year are required' });
    }
    
    // Get all students in the specified class
    const students = await Student.findAll({
      where: {
        courseId,
        division,
        semester: parseInt(semester),
        academicYear
      },
      include: [{
        model: Marks,
        required: false,
        where: { semester: parseInt(semester), academicYear }
      }],
      order: [['rollNo', 'ASC']]
    });
    
    // Process students to determine their progression status
    const processedStudents = students.map(student => {
      // Check if student has any failed subjects (marks < 40)
      const hasFailedSubjects = student.Marks && student.Marks.some(mark => mark.marks < 40);
      
      return {
        id: student.id,
        studentName: student.studentName,
        rollNo: student.rollNo,
        enrollmentNo: student.enrollmentNo,
        courseId: student.courseId,
        division: student.division,
        semester: student.semester,
        status: hasFailedSubjects ? 'failed' : 'passed',
        dateOfJoining: student.dateOfJoining
      };
    });
    
    res.json(processedStudents);
  } catch (error) {
    console.error('Error fetching student progression:', error);
    res.status(500).json({ message: error.message });
  }
};

export const processCSV = async (req, res) => {
  try {
    const { courseId, division, semester, academicYear } = req.body;
    const csvFile = req.file;

    console.log('CSV Upload - Request data:', { courseId, division, semester, academicYear });
    console.log('CSV Upload - File:', csvFile ? csvFile.originalname : 'No file');

    if (!csvFile) {
      return res.status(400).json({ message: 'CSV file is required' });
    }

    if (!courseId || !division || !semester || !academicYear) {
      if (fs.existsSync(csvFile.path)) {
        fs.unlinkSync(csvFile.path);
      }
      return res.status(400).json({ message: 'Course ID, division, semester, and academic year are required' });
    }
    
    const students = [];
    const errors = [];
    let rowCount = 0;

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvFile.path)
        .pipe(csv())
        .on('data', (row) => {
          rowCount++;
          console.log(`Row ${rowCount}:`, row);
          
          const studentData = {
            studentName: (row.studentName || '').trim(),
            email: (row.email || '').trim(),
            rollNo: (row.rollNo || '').trim(),
            enrollmentNo: (row.enrollmentNo || '').trim()
          };
          
          console.log('Parsed student data:', studentData);
          
          if (studentData.studentName && studentData.email) {
            students.push(studentData);
            console.log('Added student:', studentData.studentName);
          } else {
            console.log('Skipped row - missing name or email');
          }
        })
        .on('end', async () => {
          try {
            console.log(`CSV parsing complete. Total rows: ${rowCount}, Valid students: ${students.length}`);
            
            const createdStudents = [];
            
            for (const student of students) {
              try {
                const newStudent = await Student.create({
                  studentName: student.studentName,
                  email: student.email,
                  rollNo: student.rollNo,
                  enrollmentNo: student.enrollmentNo,
                  courseId,
                  division,
                  semester: parseInt(semester),
                  academicYear,
                  dateOfJoining: new Date().toISOString().split('T')[0]
                });
                createdStudents.push(newStudent);
                console.log('Created student:', newStudent.studentName);
              } catch (error) {
                console.log('Error creating student:', student.studentName, error.message);
                let errorMsg = error.message;
                if (error.name === 'SequelizeUniqueConstraintError') {
                  if (error.fields?.email) {
                    errorMsg = `Email ${student.email} already exists`;
                  } else if (error.fields?.enrollmentNo) {
                    errorMsg = `Enrollment number ${student.enrollmentNo} already exists`;
                  }
                }
                errors.push({
                  student: student.studentName,
                  error: errorMsg
                });
              }
            }

            if (fs.existsSync(csvFile.path)) {
              fs.unlinkSync(csvFile.path);
            }
            
            console.log(`Final result: ${createdStudents.length} students created, ${errors.length} errors`);
            
            res.json({
              message: `${createdStudents.length} students uploaded successfully`,
              totalProcessed: students.length,
              successful: createdStudents.length,
              failed: errors.length,
              students: createdStudents,
              errors: errors.length > 0 ? errors : undefined
            });
            resolve();
          } catch (error) {
            if (fs.existsSync(csvFile.path)) {
              fs.unlinkSync(csvFile.path);
            }
            console.error('Error in CSV processing:', error);
            res.status(500).json({ message: 'Error processing students', error: error.message });
            reject(error);
          }
        })
        .on('error', (error) => {
          if (fs.existsSync(csvFile.path)) {
            fs.unlinkSync(csvFile.path);
          }
          console.error('CSV parsing error:', error);
          res.status(500).json({ message: 'Error reading CSV file', error: error.message });
          reject(error);
        });
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('CSV upload error:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};