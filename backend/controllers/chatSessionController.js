// controllers/chatSessionController.js - COMPLETE with Alveoly Notification Pattern
import ChatSession from '../models/ChatSession.js';
import AutoReply from '../models/AutoReply.js';
import { createNotification } from './notificationController.js';

// @desc    Create a new chat session
// @route   POST /api/chat-sessions
export const createChatSession = async (req, res) => {
  try {
    const { name, email, phone, initialMessage } = req.body;
    
    const session = await ChatSession.create({
      user: req.user?.id || null,
      userName: name,
      userEmail: email,
      userPhone: phone || '',
      messages: [{
        sender: 'user',
        text: initialMessage || 'Chat started',
        timestamp: new Date()
      }],
      status: 'active',
      openedAt: new Date(),
      lastMessageAt: new Date()
    });

    // Create notification for admins about new chat session
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'admin',
        'info',
        `💬 New Chat Session from ${name}`,
        `${name} (${email}) started a new chat session.`,
        `/admin/chat/${session._id}`,
        { sessionId: session._id, action: 'new_chat_session' }
      );
    }

    res.status(201).json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Create chat session error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add message to chat session
// @route   POST /api/chat-sessions/:id/messages
export const addMessage = async (req, res) => {
  try {
    const { text, sender, isAutoReply, matchedRuleId } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required'
      });
    }

    const session = await ChatSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    const message = {
      sender: sender || 'user',
      text,
      timestamp: new Date(),
      isAutoReply: isAutoReply || false,
      matchedRule: matchedRuleId || null
    };

    session.messages.push(message);
    session.lastMessageAt = new Date();
    
    // Check if this was an unanswered question (from user)
    if (sender === 'user' && !isAutoReply) {
      // Store as unresolved question
      session.unresolvedQuestions.push({
        question: text,
        askedAt: new Date(),
        resolved: false
      });

      // Notify admins about unresolved question
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await createNotification(
          admin._id,
          'admin',
          'warning',
          `❓ Unresolved Question from ${session.userName}`,
          `"${text}" - ${session.userName} (${session.userEmail}) needs assistance.`,
          `/admin/chat/${session._id}`,
          { sessionId: session._id, action: 'unresolved_question' }
        );
      }
    }

    await session.save();

    res.json({
      success: true,
      message: message,
      session
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all chat sessions
// @route   GET /api/chat-sessions
export const getChatSessions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } }
      ];
    }

    const sessions = await ChatSession.find(query)
      .populate('user', 'name email avatar')
      .sort({ lastMessageAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await ChatSession.countDocuments(query);

    res.json({
      success: true,
      sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single chat session
// @route   GET /api/chat-sessions/:id
export const getChatSessionById = async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.id)
      .populate('user', 'name email avatar')
      .populate('messages.matchedRule', 'name trigger reply');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.json({ success: true, session });
  } catch (error) {
    console.error('Get chat session error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update chat session status
// @route   PUT /api/chat-sessions/:id/status
export const updateChatSessionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const session = await ChatSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    session.status = status;
    if (status === 'closed' || status === 'resolved') {
      session.closedAt = new Date();

      // Notify user that their chat was resolved
      if (session.user) {
        await createNotification(
          session.user,
          'user',
          'success',
          `✅ Chat Session Resolved`,
          `Your chat session has been resolved. Thank you for reaching out!`,
          `/chat/${session._id}`,
          { sessionId: session._id, action: 'chat_resolved' }
        );
      }
    }
    await session.save();

    res.json({
      success: true,
      session,
      message: `Session ${status}`
    });
  } catch (error) {
    console.error('Update chat session status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Resolve an unresolved question
// @route   POST /api/chat-sessions/:id/resolve-question
export const resolveQuestion = async (req, res) => {
  try {
    const { questionIndex } = req.body;
    const session = await ChatSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    if (questionIndex >= 0 && questionIndex < session.unresolvedQuestions.length) {
      session.unresolvedQuestions[questionIndex].resolved = true;
      await session.save();
    }

    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Resolve question error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete chat session
// @route   DELETE /api/chat-sessions/:id
export const deleteChatSession = async (req, res) => {
  try {
    const session = await ChatSession.findByIdAndDelete(req.params.id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }
    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });
  } catch (error) {
    console.error('Delete chat session error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};