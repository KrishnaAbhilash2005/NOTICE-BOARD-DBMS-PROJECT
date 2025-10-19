const prisma = require('../prisma/client');

/**
 * Create a new notice
 */
const createNotice = async (req, res) => {
  try {
    const { title, content } = req.body;

    console.log('📝 Creating new notice:', title);

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
      }
    });

    console.log('✅ Notice created successfully:', notice.title);
    res.status(201).json({
      message: 'Notice created successfully',
      notice
    });

  } catch (error) {
    console.error('❌ Error creating notice:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to create notice'
    });
  }
};

/**
 * Get all notices
 */
const getAllNotices = async (req, res) => {
  try {
    console.log('📋 Fetching all notices');

    const notices = await prisma.notice.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ Retrieved ${notices.length} notices`);
    res.json({
      message: 'Notices retrieved successfully',
      count: notices.length,
      notices
    });

  } catch (error) {
    console.error('❌ Error fetching notices:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch notices'
    });
  }
};

/**
 * Get notice by ID
 */
const getNoticeById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🔍 Fetching notice by ID:', id);

    const notice = await prisma.notice.findUnique({
      where: { id }
    });

    if (!notice) {
      console.log('❌ Notice not found:', id);
      return res.status(404).json({ 
        error: 'Notice not found',
        message: 'The requested notice does not exist'
      });
    }

    console.log('✅ Notice found:', notice.title);
    res.json({
      message: 'Notice retrieved successfully',
      notice
    });

  } catch (error) {
    console.error('❌ Error fetching notice:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch notice'
    });
  }
};

/**
 * Delete notice by ID
 */
const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Deleting notice:', id);

    // Check if notice exists
    const existingNotice = await prisma.notice.findUnique({
      where: { id }
    });

    if (!existingNotice) {
      console.log('❌ Notice not found for deletion:', id);
      return res.status(404).json({ 
        error: 'Notice not found',
        message: 'The notice you are trying to delete does not exist'
      });
    }

    await prisma.notice.delete({
      where: { id }
    });

    console.log('✅ Notice deleted successfully:', existingNotice.title);
    res.json({ 
      message: 'Notice deleted successfully',
      deletedNotice: {
        id: existingNotice.id,
        title: existingNotice.title
      }
    });

  } catch (error) {
    console.error('❌ Error deleting notice:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to delete notice'
    });
  }
};

module.exports = {
  createNotice,
  getAllNotices,
  getNoticeById,
  deleteNotice
};