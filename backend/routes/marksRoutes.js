import express from 'express';
import { 
  getStudentsForMarks, 
  submitMarks, 
  getTeacherSubjects,
  getAdminCourses,
  getAdminDivisions,
  getAdminSubjects,
  getAdminMarks,
  updateAdminMark,
  deleteAdminMark,
  getGradesheet,
  checkStudentEligibilityEndpoint
} from '../controllers/marksController.js';

const router = express.Router();

// Teacher routes
router.get('/students', getStudentsForMarks);
router.post('/submit', submitMarks);
router.get('/teacher-subjects', getTeacherSubjects);

// Admin routes
router.get('/admin/courses', getAdminCourses);
router.get('/admin/divisions', getAdminDivisions);
router.get('/admin/subjects', getAdminSubjects);
router.get('/admin/marks', getAdminMarks);
router.put('/admin/update/:id', updateAdminMark);
router.delete('/admin/delete/:id', deleteAdminMark);

// Gradesheet routes
router.get('/gradesheet', getGradesheet);

// Student eligibility check
router.get('/check-eligibility', checkStudentEligibilityEndpoint);

export default router;