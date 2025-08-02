import express from 'express';
import { getAdminStats, getTeacherDetails, getManageTeachers, updateTeacher, deleteTeacher, getPassFailStats } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/admin/stats', getAdminStats);
router.get('/admin/teachers', getTeacherDetails);
router.get('/admin/pass-fail-stats', getPassFailStats);
router.get('/manage/teachers', getManageTeachers);
router.put('/manage/teachers/:id', updateTeacher);
router.delete('/manage/teachers/:id', deleteTeacher);

export default router;