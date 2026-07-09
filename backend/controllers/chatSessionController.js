// backend/controllers/chatSessionController.js
import ChatSession from '../models/ChatSession.js';
import AutoReply from '../models/AutoReply.js';

// @desc    Create a new chat session
// @route   POST /api/chat-sessions
export const createChatSession = async (req, res) => {
  try {
    console.log('📝 [ChatSession] Creating session with data:', req.body);
    
    const { name, email, phone, initialMessage, userName, userEmail, userPhone } = req.body;
    
    // Handle both field name formats
    const finalName = name || userName || 'Guest';
    const finalEmail = email || userEmail || 'guest@example.com';
    const finalPhone = phone || userPhone || '';
    const finalMessage = initialMessage || 'Chat started';

    // Check if there's an existing active session for this email
    const existingSession = await ChatSession.findOne({
      userEmail: finalEmail,
      status: 'active'
    });

    if (existingSession) {
      console.log('🔄 [ChatSession] Found existing active session:', existingSession._id);
      
      // Add a new message to existing session
      existingSession.messages.push({
        sender: 'user',
        text: finalMessage,
        timestamp: new Date()
      });
      existingSession.lastMessageAt = new Date();
      await existingSession.save();

      return res.status(200).json({
        success: true,
        session: existingSession,
        existing: true
      });
    }

    // Create new session
    const session = await ChatSession.create({
      user: req.user?.id || null,
      userName: finalName,
      userEmail: finalEmail,
      userPhone: finalPhone,
      messages: [{
        sender: 'user',
        text: finalMessage,
        timestamp: new Date()
      }],
      status: 'active',
      openedAt: new Date(),
      lastMessageAt: new Date()
    });

    console.log('✅ [ChatSession] Created new session:', session._id);

    // Send welcome auto-reply
    const welcomeMessage = {
      sender: 'bot',
      text: '👋 Thank you for reaching out! Our team will be with you shortly. How can we help you today?',
      timestamp: new Date(),
      isAutoReply: true
    };

    session.messages.push(welcomeMessage);
    await session.save();

    // Emit socket event if available
    const io = req.app.get('io');
    if (io) {
      io.emit('new-chat-session', {
        sessionId: session._id,
        user: finalName,
        email: finalEmail,
        timestamp: new Date()
      });
    }

    res.status(201).json({
      success: true,
      session
    });
  } catch (error) {
    console.error('❌ [ChatSession] Create error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create chat session'
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