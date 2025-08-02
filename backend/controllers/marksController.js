import { Marks, Student, CourseAssignment } from '../models/Course.js';

// Helper function to update student status based on marks
const updateStudentStatus = async (studentId, semester) => {
  try {
    // Get all marks for the student in the current semester
    const studentMarks = await Marks.findAll({
      where: { studentId, semester }
    });
    
    // Check if student has failed any subject (marks < 40)
    const hasFailedSubject = studentMarks.some(mark => mark.marks < 40);
    
    // Update student status
    const newStatus = hasFailedSubject ? 'failed' : 'active';
    await Student.update(
      { status: newStatus },
      { where: { id: studentId } }
    );
    
    return newStatus;
  } catch (error) {
    console.error('Error updating student status:', error);
    throw error;
  }
};

// Helper function to check if student is eligible for a semester
const checkStudentEligibility = async (studentId, requestedSemester) => {
  try {
    const student = await Student.findByPk(studentId);
    if (!student) return { eligible: false, reason: 'Student not found' };
    
    // If student is in the same semester they're requesting, they're eligible
    if (student.semester === requestedSemester) {
      return { eligible: true };
    }
    
    // If student is requesting a higher semester, check if they passed previous semesters
    if (requestedSemester > student.semester) {
      // Check if student failed in their current semester
      if (student.status === 'failed') {
        return { 
          eligible: false, 
          reason: `Not eligible for semester ${requestedSemester}. Student failed in semester ${student.semester}. Must clear semester ${student.semester} first.` 
        };
      }
    }
    
    return { eligible: true };
  } catch (error) {
    console.error('Error checking student eligibility:', error);
    return { eligible: false, reason: 'Error checking eligibility' };
  }
};

// Helper function to prevent failed students from appearing in next semester
const shouldStudentAppearInSemester = async (student, semester) => {
  // If student's current semester matches requested semester, they should appear
  if (student.semester === semester) {
    return true;
  }
  
  // If student is in a lower semester but requesting higher semester
  // Check if they have failed status - if yes, they shouldn't appear in higher semester
  if (student.semester < semester && student.status === 'failed') {
    return false;
  }
  
  return student.semester === semester;
};

export const getStudentsForMarks = async (req, res) => {
  try {
    const { courseId, division, subject, semester, academicYear } = req.query;
    const teacherEmail = req.query.teacherEmail;

    if (!courseId || !division || !subject || !semester || !academicYear || !teacherEmail) {
      return res.status(400).json({ message: 'Course ID, division, subject, semester, academic year, and teacher email are required' });
    }

    // Verify teacher has access to this class
    const assignment = await CourseAssignment.findOne({
      where: {
        courseId,
        division,
        subject,
        semester: parseInt(semester),
        academicYear,
        teacherEmail
      }
    });

    if (!assignment) {
      return res.status(403).json({ message: 'You are not assigned to teach this class/subject' });
    }

    // Get students for this class - only those who are actually in this semester
    const students = await Student.findAll({
      where: {
        courseId,
        division,
        semester: parseInt(semester),
        academicYear
      },
      include: [{
        model: Marks,
        where: { subject, semester: parseInt(semester), academicYear },
        required: false
      }]
    });

    const studentsWithMarks = students.map(student => ({
      id: student.id,
      studentName: student.studentName,
      rollNo: student.rollNo,
      enrollmentNo: student.enrollmentNo,
      status: student.status,
      marks: student.Marks.length > 0 ? student.Marks[0].marks : null
    }));

    res.json(studentsWithMarks);
  } catch (error) {
    console.error('Error fetching students for marks:', error);
    res.status(500).json({ message: error.message });
  }
};

export const submitMarks = async (req, res) => {
  try {
    const { courseId, division, subject, semester, academicYear, teacherEmail, marksData } = req.body;

    if (!courseId || !division || !subject || !semester || !academicYear || !teacherEmail || !marksData) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Verify teacher has access to this class
    const assignment = await CourseAssignment.findOne({
      where: {
        courseId,
        division,
        subject,
        semester: parseInt(semester),
        academicYear,
        teacherEmail
      }
    });

    if (!assignment) {
      return res.status(403).json({ message: 'You are not assigned to teach this class/subject' });
    }

    // Process marks data
    const results = [];
    for (const markEntry of marksData) {
      const { studentId, marks } = markEntry;

      // Check if marks already exist
      const existingMark = await Marks.findOne({
        where: {
          studentId,
          courseId,
          division,
          subject,
          semester: parseInt(semester),
          academicYear
        }
      });

      if (existingMark) {
        // Update existing marks
        await existingMark.update({ marks });
        results.push({ studentId, action: 'updated', marks });
      } else {
        // Create new marks entry
        await Marks.create({
          studentId,
          courseId,
          division,
          subject,
          semester: parseInt(semester),
          academicYear,
          marks,
          teacherEmail
        });
        results.push({ studentId, action: 'created', marks });
      }
    }

    // Update student status for each student whose marks were submitted
    const statusUpdates = [];
    for (const result of results) {
      try {
        const newStatus = await updateStudentStatus(result.studentId, parseInt(semester));
        statusUpdates.push({ studentId: result.studentId, status: newStatus });
      } catch (error) {
        console.error(`Error updating status for student ${result.studentId}:`, error);
      }
    }
    
    res.json({
      message: 'Marks submitted successfully',
      results,
      statusUpdates
    });
  } catch (error) {
    console.error('Error submitting marks:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getTeacherSubjects = async (req, res) => {
  try {
    const teacherEmail = req.query.email;
    console.log('Fetching subjects for teacher:', teacherEmail);

    if (!teacherEmail) {
      return res.status(400).json({ message: 'Teacher email is required' });
    }

    const assignments = await CourseAssignment.findAll({
      where: { teacherEmail },
      attributes: ['courseId', 'courseName', 'division', 'subject', 'semester']
    });

    console.log('Found assignments:', assignments.length);
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching teacher subjects:', error);
    res.status(500).json({ message: error.message });
  }
};

// Admin endpoints
export const getAdminCourses = async (req, res) => {
  try {
    const courses = await CourseAssignment.findAll({
      attributes: ['courseId', 'courseName'],
      group: ['courseId', 'courseName']
    });
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getAdminDivisions = async (req, res) => {
  try {
    const { courseId, semester, academicYear } = req.query;
    const whereClause = { courseId };
    if (semester) whereClause.semester = parseInt(semester);
    if (academicYear) whereClause.academicYear = academicYear;
    
    const divisions = await CourseAssignment.findAll({
      where: whereClause,
      attributes: ['division'],
      group: ['division']
    });
    res.json(divisions.map(d => d.division));
  } catch (error) {
    console.error('Error fetching divisions:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getAdminSubjects = async (req, res) => {
  try {
    const { courseId, division, semester } = req.query;
    const whereClause = { courseId, division };
    if (semester) whereClause.semester = parseInt(semester);
    
    const subjects = await CourseAssignment.findAll({
      where: whereClause,
      attributes: ['subject'],
      group: ['subject']
    });
    res.json(subjects.map(s => s.subject));
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getAdminMarks = async (req, res) => {
  try {
    const { courseId, division, subject, semester } = req.query;
    const whereClause = { courseId, division, subject };
    if (semester) whereClause.semester = parseInt(semester);
    
    const marks = await Marks.findAll({
      where: whereClause,
      include: [{
        model: Student,
        attributes: ['studentName', 'rollNo', 'enrollmentNo', 'dateOfJoining', 'status']
      }],
      order: [['Student', 'rollNo', 'ASC']]
    });
    res.json(marks);
  } catch (error) {
    console.error('Error fetching marks:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateAdminMark = async (req, res) => {
  try {
    const { id } = req.params;
    const { marks } = req.body;
    
    const mark = await Marks.findByPk(id);
    if (!mark) {
      return res.status(404).json({ message: 'Mark not found' });
    }
    
    await mark.update({ marks });
    res.json({ message: 'Mark updated successfully' });
  } catch (error) {
    console.error('Error updating mark:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteAdminMark = async (req, res) => {
  try {
    const { id } = req.params;
    
    const mark = await Marks.findByPk(id);
    if (!mark) {
      return res.status(404).json({ message: 'Mark not found' });
    }
    
    await mark.destroy();
    res.json({ message: 'Mark deleted successfully' });
  } catch (error) {
    console.error('Error deleting mark:', error);
    res.status(500).json({ message: error.message });
  }
};

// Student eligibility check endpoint
export const checkStudentEligibilityEndpoint = async (req, res) => {
  try {
    const { studentId, semester } = req.query;
    
    if (!studentId || !semester) {
      return res.status(400).json({ message: 'Student ID and semester are required' });
    }
    
    const eligibility = await checkStudentEligibility(parseInt(studentId), parseInt(semester));
    res.json(eligibility);
  } catch (error) {
    console.error('Error checking student eligibility:', error);
    res.status(500).json({ message: error.message });
  }
};

// Gradesheet endpoints
export const getGradesheet = async (req, res) => {
  try {
    const { courseId, division, semester, academicYear } = req.query;
    
    if (!courseId || !division || !semester || !academicYear) {
      return res.status(400).json({ message: 'Course ID, division, semester, and academic year are required' });
    }
    
    // Get all students from this course and division (from all semesters up to requested semester)
    const allStudents = await Student.findAll({
      where: { 
        courseId, 
        division,
        academicYear
      },
      include: [{
        model: Marks,
        required: false
      }]
    });
    
    // Filter students who should appear in this semester
    const students = allStudents.filter(student => {
      // Include students who are in this semester OR students from previous semesters
      return student.semester <= parseInt(semester);
    });
    
    // Get current semester marks for these students
    for (const student of students) {
      const currentMarks = await Marks.findAll({
        where: {
          studentId: student.id,
          semester: parseInt(semester),
          academicYear
        }
      });
      student.Marks = currentMarks;
    }
    
    // Get all subjects for this class and semester
    const subjects = await CourseAssignment.findAll({
      where: { courseId, division, semester: parseInt(semester), academicYear },
      attributes: ['subject', 'courseName'],
      group: ['subject', 'courseName']
    });
    
    const subjectList = subjects.map(s => s.subject);
    const courseName = subjects.length > 0 ? subjects[0].courseName : courseId;
    
    // Check if students failed in previous semester
    const studentsWithPreviousStatus = [];
    for (const student of students) {
      let failedInPrevious = false;
      
      if (parseInt(semester) > 1) {
        const previousMarks = await Marks.findAll({
          where: {
            studentId: student.id,
            semester: parseInt(semester) - 1,
            academicYear
          }
        });
        failedInPrevious = previousMarks.some(mark => mark.marks < 40);
      }
      
      studentsWithPreviousStatus.push({ ...student.toJSON(), failedInPrevious });
    }
    
    // Process student data with marks and calculate totals
    const gradesheet = studentsWithPreviousStatus.map(student => {
      const studentMarks = {};
      let totalMarks = 0;
      let subjectCount = 0;
      let hasCurrentFailedSubjects = false;
      
      subjectList.forEach(subject => {
        const mark = student.Marks?.find(m => m.subject === subject);
        const markValue = mark ? mark.marks : 0;
        
        // Show "NOT ELIGIBLE" for marks if student failed in previous semester
        if (student.failedInPrevious) {
          studentMarks[subject] = 'NOT ELIGIBLE';
        } else {
          studentMarks[subject] = markValue;
          totalMarks += markValue;
          if (markValue < 40) {
            hasCurrentFailedSubjects = true;
          }
        }
        subjectCount++;
      });
      
      const percentage = !student.failedInPrevious && subjectCount > 0 ? (totalMarks / (subjectCount * 100)) * 100 : 0;
      
      return {
        id: student.id,
        studentName: student.studentName, // Always show student name
        rollNo: student.rollNo,
        enrollmentNo: student.enrollmentNo,
        dateOfJoining: student.dateOfJoining,
        status: student.failedInPrevious ? 'not_eligible' : (hasCurrentFailedSubjects ? 'failed' : 'active'),
        marks: studentMarks,
        totalMarks: student.failedInPrevious ? 'NOT ELIGIBLE' : Math.round(totalMarks * 100) / 100,
        percentage: student.failedInPrevious ? 'NOT ELIGIBLE' : Math.round(percentage * 100) / 100,
        maxMarks: subjectCount * 100,
        hasFailedSubjects: student.failedInPrevious || hasCurrentFailedSubjects,
        failedInPrevious: student.failedInPrevious
      };
    });
    
    // Separate eligible and not eligible students
    const eligibleStudents = gradesheet.filter(s => !s.failedInPrevious && !s.hasFailedSubjects);
    const notEligibleStudents = gradesheet.filter(s => s.failedInPrevious || s.hasFailedSubjects);
    
    // Sort eligible students by percentage (descending) to get ranks
    eligibleStudents.sort((a, b) => {
      if (b.percentage === a.percentage) {
        return b.totalMarks - a.totalMarks;
      }
      return b.percentage - a.percentage;
    });
    
    // Add ranks to eligible students only
    let currentRank = 1;
    eligibleStudents.forEach((student, index) => {
      if (index > 0 && 
          eligibleStudents[index - 1].percentage === student.percentage && 
          eligibleStudents[index - 1].totalMarks === student.totalMarks) {
        student.rank = eligibleStudents[index - 1].rank;
      } else {
        student.rank = currentRank;
      }
      currentRank++;
    });
    
    // Not eligible students don't get ranks
    notEligibleStudents.forEach(student => {
      student.rank = '-';
    });
    
    // Combine eligible and not eligible students (eligible first, then not eligible)
    const finalGradesheet = [...eligibleStudents, ...notEligibleStudents];
    
    res.json({
      courseId,
      courseName,
      division,
      semester: parseInt(semester),
      academicYear,
      subjects: subjectList,
      students: finalGradesheet,
      totalStudents: finalGradesheet.length
    });
  } catch (error) {
    console.error('Error generating gradesheet:', error);
    res.status(500).json({ message: error.message });
  }
};