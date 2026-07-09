// backend/controllers/chatSessionController.js
import ChatSession from '../models/ChatSession.js';
import AutoReply from '../models/AutoReply.js';

// @desc    Create a new chat session
// @route   POST /api/chat-sessions
export const createChatSession = async (req, res) => {
  try {
    console.log('📝 [ChatSession] Creating session with data:', req.body);
    
    const { name, email, phone, initialMessage } = req.body;
    
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    // Check for existing active session
    const existingSession = await ChatSession.findOne({
      userEmail: email,
      status: 'active'
    });

    if (existingSession) {
      console.log('🔄 [ChatSession] Found existing active session:', existingSession._id);
      
      // Add new message to existing session
      existingSession.messages.push({
        sender: 'user',
        text: initialMessage || 'Chat started',
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
    const session = new ChatSession({
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

    // ============================================
    // AUTO-REPLY: Check for matching rules
    // ============================================
    const userMessage = initialMessage || 'Chat started';
    let autoReplyMessage = null;
    let matchedRule = null;

    try {
      // Find matching auto-reply rule
      const rules = await AutoReply.find({ isActive: true });
      
      for (const rule of rules) {
        const trigger = rule.trigger.toLowerCase();
        const messageLower = userMessage.toLowerCase();
        
        if (messageLower.includes(trigger)) {
          matchedRule = rule;
          autoReplyMessage = rule.reply;
          break;
        }
      }

      // If no specific match, use default welcome
      if (!autoReplyMessage) {
        autoReplyMessage = '👋 Thank you for reaching out! Our team will be with you shortly. How can we help you today?';
      }

    } catch (autoReplyError) {
      console.warn('⚠️ Auto-reply lookup failed:', autoReplyError.message);
      autoReplyMessage = '👋 Thank you for reaching out! Our team will be with you shortly. How can we help you today?';
    }

    // Add auto-reply message
    session.messages.push({
      sender: 'bot',
      text: autoReplyMessage,
      timestamp: new Date(),
      isAutoReply: true,
      matchedRule: matchedRule?._id || null
    });

    await session.save();

    console.log('✅ [ChatSession] Created new session:', session._id);
    if (matchedRule) {
      console.log(`✅ [ChatSession] Auto-reply matched rule: "${matchedRule.trigger}"`);
    }

    // Emit socket event (non-blocking)
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('new-chat-session', {
          sessionId: session._id,
          user: name,
          email: email,
          timestamp: new Date()
        });
        
        // Emit the auto-reply message
        io.to(`chat-${session._id}`).emit('new-message', {
          sessionId: session._id,
          sender: 'bot',
          text: autoReplyMessage,
          timestamp: new Date(),
          isAutoReply: true
        });
      }
    } catch (socketError) {
      console.warn('⚠️ Socket emit failed:', socketError.message);
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

    // Add user message
    const message = {
      sender: sender || 'user',
      text,
      timestamp: new Date(),
      isAutoReply: isAutoReply || false,
      matchedRule: matchedRuleId || null
    };

    session.messages.push(message);
    session.lastMessageAt = new Date();
    
    // Store unanswered questions from users
    if (sender === 'user' && !isAutoReply) {
      session.unresolvedQuestions.push({
        question: text,
        askedAt: new Date(),
        resolved: false
      });
    }

    await session.save();

    // ============================================
    // AUTO-REPLY: Check for matching rules on user messages
    // ============================================
    let autoReplySent = false;
    
    if (sender === 'user' && !isAutoReply) {
      try {
        const rules = await AutoReply.find({ isActive: true });
        let matchedRule = null;
        let autoReplyText = null;

        for (const rule of rules) {
          const trigger = rule.trigger.toLowerCase();
          const messageLower = text.toLowerCase();
          
          if (messageLower.includes(trigger)) {
            matchedRule = rule;
            autoReplyText = rule.reply;
            break;
          }
        }

        if (autoReplyText) {
          // Add auto-reply message
          const autoReply = {
            sender: 'bot',
            text: autoReplyText,
            timestamp: new Date(),
            isAutoReply: true,
            matchedRule: matchedRule._id
          };

          session.messages.push(autoReply);
          session.lastMessageAt = new Date();
          await session.save();

          autoReplySent = true;

          // Emit auto-reply via socket
          try {
            const io = req.app.get('io');
            if (io) {
              io.to(`chat-${session._id}`).emit('new-message', {
                sessionId: session._id,
                sender: 'bot',
                text: autoReplyText,
                timestamp: autoReply.timestamp,
                isAutoReply: true
              });
            }
          } catch (socketError) {
            console.warn('⚠️ Socket emit failed:', socketError.message);
          }

          console.log(`✅ [ChatSession] Auto-reply sent for: "${text}" -> "${autoReplyText}"`);
        }
      } catch (autoReplyError) {
        console.warn('⚠️ Auto-reply lookup failed:', autoReplyError.message);
      }
    }

    // Emit socket event for the original message
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(`chat-${session._id}`).emit('new-message', {
          sessionId: session._id,
          sender: message.sender,
          text: message.text,
          timestamp: message.timestamp,
          isAutoReply: message.isAutoReply
        });
      }
    } catch (socketError) {
      console.warn('⚠️ Socket emit failed:', socketError.message);
    }

    res.json({
      success: true,
      message: message,
      autoReplySent: autoReplySent,
      session
    });
  } catch (error) {
    console.error('❌ Add message error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add message'
    });
  }
};

// @desc    Get all chat sessions (Admin only)
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
      .populate('messages.matchedRule', 'name trigger reply')
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
    console.error('❌ Get chat sessions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get chat sessions'
    });
  }
};

// @desc    Get single chat session (Admin only)
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

    res.json({ 
      success: true, 
      session 
    });
  } catch (error) {
    console.error('❌ Get chat session error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get chat session'
    });
  }
};

// @desc    Update chat session status (Admin only)
// @route   PUT /api/chat-sessions/:id/status
export const updateChatSessionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['active', 'resolved', 'closed', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: active, resolved, closed, pending'
      });
    }

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

    // Notify via socket
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(`chat-${session._id}`).emit('session-status-updated', {
          sessionId: session._id,
          status: session.status
        });
      }
    } catch (socketError) {
      console.warn('⚠️ Socket emit failed:', socketError.message);
    }

    res.json({
      success: true,
      session,
      message: `Session ${status}`
    });
  } catch (error) {
    console.error('❌ Update chat session status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update session status'
    });
  }
};

// @desc    Resolve an unresolved question (Admin only)
// @route   POST /api/chat-sessions/:id/resolve-question
export const resolveQuestion = async (req, res) => {
  try {
    const { questionIndex } = req.body;
    
    if (questionIndex === undefined || questionIndex < 0) {
      return res.status(400).json({
        success: false,
        message: 'Question index is required and must be a positive number'
      });
    }

    const session = await ChatSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    if (questionIndex >= session.unresolvedQuestions.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question index'
      });
    }

    session.unresolvedQuestions[questionIndex].resolved = true;
    await session.save();

    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('❌ Resolve question error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to resolve question'
    });
  }
};

// @desc    Delete chat session (Admin only)
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

    // Notify via socket
    try {
      const io = req.app.get('io');
      if (io) {
        io.to(`chat-${session._id}`).emit('session-deleted', {
          sessionId: session._id
        });
      }
    } catch (socketError) {
      console.warn('⚠️ Socket emit failed:', socketError.message);
    }

    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete chat session error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete chat session'
    });
  }
};

// @desc    Get user's chat sessions
// @route   GET /api/chat-sessions/user/:email
export const getUserSessions = async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const sessions = await ChatSession.find({ userEmail: email })
      .populate('messages.matchedRule', 'name trigger reply')
      .sort({ lastMessageAt: -1 })
      .limit(10);

    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('❌ Get user sessions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user sessions'
    });
  }
};

// @desc    Get active session count
// @route   GET /api/chat-sessions/stats
export const getSessionStats = async (req, res) => {
  try {
    const active = await ChatSession.countDocuments({ status: 'active' });
    const resolved = await ChatSession.countDocuments({ status: 'resolved' });
    const closed = await ChatSession.countDocuments({ status: 'closed' });
    const pending = await ChatSession.countDocuments({ status: 'pending' });
    const total = await ChatSession.countDocuments();

    res.json({
      success: true,
      stats: {
        active,
        resolved,
        closed,
        pending,
        total
      }
    });
  } catch (error) {
    console.error('❌ Get session stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get session stats'
    });
  }
};

// @desc    Get all auto-reply rules
// @route   GET /api/chat-sessions/auto-reply-rules
export const getAutoReplyRules = async (req, res) => {
  try {
    const rules = await AutoReply.find({ isActive: true })
      .sort({ priority: -1, createdAt: -1 });

    res.json({
      success: true,
      rules
    });
  } catch (error) {
    console.error('❌ Get auto-reply rules error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get auto-reply rules'
    });
  }
};