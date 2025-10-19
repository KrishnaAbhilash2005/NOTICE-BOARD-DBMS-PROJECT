const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const { JWT_SECRET } = require('../middleware/auth');

/**
 * Create a new user
 */
const createUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log('📝 Creating new user:', username);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      const message = existingUser.email === email 
        ? 'Email already registered' 
        : 'Username already taken';
      
      console.log('❌ User creation failed - duplicate:', message);
      return res.status(409).json({
        error: 'User already exists',
        message: message
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    });

    console.log('✅ User created successfully:', user.username);
    res.status(201).json({
      message: 'User created successfully',
      user
    });

  } catch (error) {
    console.error('❌ Error creating user:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to create user'
    });
  }
};

/**
 * Get all users (admin only)
 */
const getAllUsers = async (req, res) => {
  try {
    console.log('📋 Fetching all users');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ Retrieved ${users.length} users`);
    res.json({
      message: 'Users retrieved successfully',
      count: users.length,
      users
    });

  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch users'
    });
  }
};

/**
 * User login
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 User login attempt:', email);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('❌ Login failed - user not found:', email);
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('❌ Login failed - invalid password:', email);
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        username: user.username
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ User logged in successfully:', user.username);
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ Error during login:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Login failed'
    });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  loginUser
};