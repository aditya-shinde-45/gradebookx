import { CourseAssignment, Teacher, Student, Marks } from '../models/Course.js';
import { sequelize } from '../config/database.js';
import { Op } from 'sequelize';

export const getAdminStats = async (req, res) => {
  try {
    const { courseId, semester } = req.query;
    
    let whereClause = {};
    if (courseId) whereClause.courseId = courseId;
    if (semester) whereClause.semester = parseInt(semester);
    
    // Get total courses count (filtered or all)
    const totalCourses = courseId ? 1 : await CourseAssignment.count({
      distinct: true,
      col: 'courseId'
    });

    // Get total students count (filtered)
    const totalStudents = await Student.count({ where: whereClause });

    // Get total teachers count (filtered by course assignments)
    let totalTeachers;
    if (courseId || semester) {
      const assignmentWhere = {};
      if (courseId) assignmentWhere.courseId = courseId;
      if (semester) assignmentWhere.semester = parseInt(semester);
      
      const teacherEmails = await CourseAssignment.findAll({
        where: assignmentWhere,
        attributes: [[sequelize.fn('DISTINCT', sequelize.col('teacherEmail')), 'teacherEmail']]
      });
      totalTeachers = teacherEmails.length;
    } else {
      totalTeachers = await Teacher.count();
    }

    // Get pending results (classes without students for the filter)
    let pendingResults = 0;
    if (courseId || semester) {
      const assignmentWhere = {};
      if (courseId) assignmentWhere.courseId = courseId;
      if (semester) assignmentWhere.semester = parseInt(semester);
      
      const allAssignments = await CourseAssignment.findAll({
        where: assignmentWhere,
        attributes: ['courseId', 'semester', 'division'],
        group: ['courseId', 'semester', 'division']
      });
      
      for (const assignment of allAssignments) {
        const studentCount = await Student.count({
          where: {
            courseId: assignment.courseId,
            semester: assignment.semester,
            division: assignment.division
          }
        });
        if (studentCount === 0) pendingResults++;
      }
    } else {
      const coursesWithStudents = await Student.findAll({
        attributes: [[sequelize.fn('DISTINCT', sequelize.col('courseId')), 'courseId']]
      });
      
      const allCourses = await CourseAssignment.findAll({
        attributes: [[sequelize.fn('DISTINCT', sequelize.col('courseId')), 'courseId']]
      });
      
      pendingResults = allCourses.length - coursesWithStudents.length;
    }

    // Get courses for filter dropdown
    const courses = await CourseAssignment.findAll({
      attributes: ['courseId', 'courseName'],
      group: ['courseId', 'courseName']
    });

    res.json({
      totalCourses,
      totalStudents,
      totalTeachers,
      pendingResults: Math.max(0, pendingResults),
      courses
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getTeacherDetails = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause for search
    const whereClause = search ? {
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ]
    } : {};

    // Get teachers with their assignments
    const teachers = await Teacher.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    // Get assignments for each teacher
    const teachersWithDetails = await Promise.all(
      teachers.rows.map(async (teacher) => {
        const assignments = await CourseAssignment.findAll({
          where: { teacherEmail: teacher.email },
          attributes: ['courseId', 'courseName', 'division', 'subject', 'semester']
        });

        // Get student upload status for teacher's courses
        const studentCounts = await Promise.all(
          assignments.map(async (assignment) => {
            const count = await Student.count({
              where: {
                courseId: assignment.courseId,
                division: assignment.division,
                semester: assignment.semester
              }
            });
            return {
              courseId: assignment.courseId,
              division: assignment.division,
              semester: assignment.semester,
              studentCount: count,
              hasStudents: count > 0
            };
          })
        );

        const assignedClasses = assignments.map(a => `${a.subject} (${a.courseName}-Sem${a.semester}-${a.division})`).join(', ');
        const uploadedClasses = studentCounts.filter(s => s.hasStudents).map(s => `${s.courseId}-Sem${s.semester}-${s.division}`).join(', ');
        
        let status = 'Pending';
        if (studentCounts.length === 0) {
          status = 'No Classes';
        } else if (studentCounts.every(s => s.hasStudents)) {
          status = 'Completed';
        } else if (studentCounts.some(s => s.hasStudents)) {
          status = 'Incomplete';
        }

        // Get last upload date
        const lastUpload = await Student.findOne({
          where: {
            courseId: { [Op.in]: assignments.map(a => a.courseId) }
          },
          order: [['createdAt', 'DESC']],
          attributes: ['createdAt']
        });

        return {
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          assignedClasses: assignedClasses || 'No assignments',
          status,
          uploadedClasses: uploadedClasses || '-',
          lastUpload: lastUpload ? lastUpload.createdAt.toISOString().split('T')[0] : '-'
        };
      })
    );

    res.json({
      teachers: teachersWithDetails,
      total: teachers.count,
      page: parseInt(page),
      totalPages: Math.ceil(teachers.count / limit)
    });
  } catch (error) {
    console.error('Error fetching teacher details:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getManageTeachers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = search ? {
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ]
    } : {};

    const teachers = await Teacher.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    const teachersWithAssignments = await Promise.all(
      teachers.rows.map(async (teacher) => {
        const assignments = await CourseAssignment.findAll({
          where: { teacherEmail: teacher.email },
          attributes: ['subject', 'courseName', 'division']
        });

        const subjects = [...new Set(assignments.map(a => a.subject))].join(', ');
        const classes = assignments.map(a => `${a.courseName}-Sem${a.semester || 'N/A'}-${a.division}`).join(', ');

        return {
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          password: teacher.password,
          subjects: subjects || 'No subjects assigned',
          classes: classes || 'No classes assigned'
        };
      })
    );

    res.json({
      teachers: teachersWithAssignments,
      total: teachers.count,
      page: parseInt(page),
      totalPages: Math.ceil(teachers.count / limit)
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ message: error.message });
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const teacherId = req.params.id;
    const { name, email } = req.body;
    
    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const oldEmail = teacher.email;
    
    // Update teacher
    await teacher.update({ name, email });
    
    // Update assignments if email changed
    if (oldEmail !== email) {
      await CourseAssignment.update(
        { teacherEmail: email, teacherName: name },
        { where: { teacherEmail: oldEmail } }
      );
    }
    
    res.json({ message: 'Teacher updated successfully', teacher });
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const teacherId = req.params.id;
    
    const teacher = await Teacher.findByPk(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Delete related assignments
    await CourseAssignment.destroy({ where: { teacherEmail: teacher.email } });
    
    // Delete teacher
    await teacher.destroy();
    
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getPassFailStats = async (req, res) => {
  try {
    const { courseId, semester } = req.query;
    console.log('Pass/Fail Stats Request:', { courseId, semester });
    
    let studentWhereClause = {};
    let marksWhereClause = {};
    
    if (courseId) {
      studentWhereClause.courseId = courseId;
      marksWhereClause.courseId = courseId;
    }
    if (semester) {
      studentWhereClause.semester = parseInt(semester);
      marksWhereClause.semester = parseInt(semester);
    }
    
    // Get all students for the filter criteria
    const students = await Student.findAll({
      where: studentWhereClause,
      include: [{
        model: Marks,
        required: false,
        where: Object.keys(marksWhereClause).length > 0 ? marksWhereClause : undefined
      }]
    });
    
    console.log(`Found ${students.length} students`);
    
    let passedStudents = 0;
    let failedStudents = 0;
    
    // Calculate pass/fail for each student
    students.forEach(student => {
      const studentMarks = student.Marks || [];
      console.log(`Student ${student.studentName}: ${studentMarks.length} marks`);
      
      if (studentMarks.length === 0) {
        // No marks recorded - consider as failed
        failedStudents++;
      } else {
        // Check if student has any subject with marks < 40
        const hasFailed = studentMarks.some(mark => {
          console.log(`Mark: ${mark.marks} for subject ${mark.subject}`);
          return mark.marks < 40;
        });
        if (hasFailed) {
          failedStudents++;
        } else {
          passedStudents++;
        }
      }
    });
    
    const result = {
      totalStudents: students.length,
      passedStudents,
      failedStudents,
      courseId: courseId || 'All Courses',
      semester: semester || 'All Semesters'
    };
    
    console.log('Pass/Fail Stats Result:', result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching pass/fail stats:', error);
    res.status(500).json({ message: error.message });
  }
};