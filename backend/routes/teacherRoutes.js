import express from 'express';
import { teacherLogin, getTeacherAssignments, getAllSubjectAssignments, getTeacherStudents, getTeacherClassStats } from '../controllers/teacherController.js';

const router = express.Router();

router.post('/login', teacherLogin);
router.get('/assignments', getTeacherAssignments);
router.get('/assignments/all', getAllSubjectAssignments);
router.get('/students', getTeacherStudents);
router.get('/class-stats', getTeacherClassStats);

export default router;