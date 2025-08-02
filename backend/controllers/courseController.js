import { CourseAssignment, Teacher } from '../models/Course.js';

export const addCourse = async (req, res) => {
  try {
    console.log('Received course data:', JSON.stringify(req.body, null, 2));
    const { courseId, courseName, academicYear, semester, subjects, divisions } = req.body;

    if (!courseId || !courseName || !academicYear || !semester) {
      return res.status(400).json({ message: 'Course ID, Course Name, Academic Year, and Semester are required' });
    }

    const assignments = [];

    if (divisions && divisions.length) {
      for (const div of divisions) {
        if (div.subjectTeachers && div.subjectTeachers.length) {
          for (const st of div.subjectTeachers) {
            // Use first subject if subjectName doesn't match
            const subjectName = subjects.includes(st.subjectName) ? st.subjectName : subjects[0];
            
            const assignment = await CourseAssignment.create({
              courseId,
              courseName,
              academicYear,
              semester: parseInt(semester),
              subject: subjectName,
              division: div.name,
              teacherName: st.name,
              teacherEmail: st.email,
              teacherPassword: st.password
            });
            
            // Create/update teacher record
            await Teacher.findOrCreate({
              where: { email: st.email },
              defaults: {
                name: st.name,
                email: st.email,
                password: st.password
              }
            });
            
            assignments.push(assignment);
            console.log('Assignment created:', assignment.toJSON());
          }
        }
      }
    }

    res.status(201).json({ message: 'Course created successfully', assignments });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const assignments = await CourseAssignment.findAll();
    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch courses', error });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const assignment = await CourseAssignment.findByPk(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    await assignment.destroy();
    res.status(200).json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting assignment', error });
  }
};