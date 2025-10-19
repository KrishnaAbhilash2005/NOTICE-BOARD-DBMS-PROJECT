const express = require('express');
const router = express.Router();
const { createUser, getAllUsers, loginUser } = require('../controllers/userController');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

/**
 * POST /users - Create a new user
 * Body: { username, email, password }
 */
router.post('/', validateUserRegistration, createUser);

/**
 * POST /users/login - Login user
 * Body: { email, password }
 */
router.post('/login', validateUserLogin, loginUser);

/**
 * GET /users - Get all users (protected route)
 * Headers: Authorization: Bearer <token>
 */
router.get('/', authenticateToken, getAllUsers);

module.exports = router;