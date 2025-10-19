const express = require('express');
const router = express.Router();
const { createNotice, getAllNotices, getNoticeById, deleteNotice } = require('../controllers/noticeController');
const { validateNoticeCreation } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /notices - Get all notices (public)
 */
router.get('/', getAllNotices);

/**
 * GET /notices/:id - Get notice by ID (public)
 */
router.get('/:id', getNoticeById);

/**
 * POST /notices - Create a new notice (protected)
 * Headers: Authorization: Bearer <token>
 * Body: { title, content }
 */
router.post('/', authenticateToken, validateNoticeCreation, createNotice);

/**
 * DELETE /notices/:id - Delete notice by ID (protected)
 * Headers: Authorization: Bearer <token>
 */
router.delete('/:id', authenticateToken, deleteNotice);

module.exports = router;