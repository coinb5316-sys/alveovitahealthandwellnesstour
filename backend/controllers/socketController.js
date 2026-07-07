// backend/controllers/socketController.js
import ChatSession from '../models/ChatSession.js';
import AutoReply from '../models/AutoReply.js';

export const handleSocketConnection = (io, socket) => {
  console.log(`🟢 Socket connected: ${socket.id}`);

  // Join a chat room
  socket.on('join-chat', async (data) => {
    const { sessionId, userId, userName, userEmail } = data;
    
    try {
      // Find or create chat session
      let session;
      if (sessionId) {
        session = await ChatSession.findById(sessionId);
        if (!session) {
          // Create new session if not found
          session = await ChatSession.create({
            user: userId || null,
            userName: userName || 'Guest',
            userEmail: userEmail || 'guest@example.com',
            messages: [],
            status: 'active',
            openedAt: new Date(),
            lastMessageAt: new Date()
          });
        }
      } else {
        // Create new session
        session = await ChatSession.create({
          user: userId || null,
          userName: userName || 'Guest',
          userEmail: userEmail || 'guest@example.com',
          messages: [],
          status: 'active',
          openedAt: new Date(),
          lastMessageAt: new Date()
        });
      }

      // Join the room
      socket.join(`chat-${session._id}`);
      socket.sessionId = session._id;
      
      // Send session info to client
      socket.emit('chat-joined', {
        success: true,
        sessionId: session._id,
        session: session
      });

      // Notify admin about new session
      io.emit('new-chat-session', {
        sessionId: session._id,
        userName: session.userName,
        userEmail: session.userEmail,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Join chat error:', error);
      socket.emit('chat-error', {
        success: false,
        message: 'Failed to join chat'
      });
    }
  });

  // Handle user messages
  socket.on('send-message', async (data) => {
    const { sessionId, text, sender = 'user' } = data;
    
    try {
      const session = await ChatSession.findById(sessionId);
      if (!session) {
        socket.emit('chat-error', { 
          success: false, 
          message: 'Session not found' 
        });
        return;
      }

      // Check for auto-reply
      let autoReply = null;
      let matchedRule = null;
      
      if (sender === 'user') {
        const rules = await AutoReply.find({ enabled: true }).sort({ priority: 1 });
        const lowerText = text.toLowerCase();
        
        for (const rule of rules) {
          const triggers = rule.trigger.split('|').map(t => t.trim().toLowerCase());
          for (const trigger of triggers) {
            if (lowerText.includes(trigger)) {
              matchedRule = rule;
              autoReply = rule.reply;
              break;
            }
          }
          if (matchedRule) break;
        }
      }

      // Save user message
      const userMessage = {
        sender: sender,
        text: text,
        timestamp: new Date(),
        isAutoReply: false
      };
      
      session.messages.push(userMessage);
      
      // Store unresolved question if no auto-reply matched
      if (sender === 'user' && !autoReply) {
        session.unresolvedQuestions.push({
          question: text,
          askedAt: new Date(),
          resolved: false
        });
      }
      
      session.lastMessageAt = new Date();
      await session.save();

      // Emit user message to all in room
      io.to(`chat-${sessionId}`).emit('new-message', {
        ...userMessage,
        sessionId: session._id
      });

      // If auto-reply exists, send bot response
      if (autoReply && matchedRule) {
        const botMessage = {
          sender: 'bot',
          text: autoReply,
          timestamp: new Date(),
          isAutoReply: true,
          matchedRule: matchedRule._id
        };
        
        session.messages.push(botMessage);
        session.lastMessageAt = new Date();
        await session.save();

        // Send bot message after a delay
        setTimeout(() => {
          io.to(`chat-${sessionId}`).emit('new-message', {
            ...botMessage,
            sessionId: session._id
          });
        }, 1000);
      } else if (sender === 'user') {
        // No auto-reply - notify admin and show typing indicator
        io.emit('admin-notification', {
          type: 'unanswered-question',
          sessionId: session._id,
          userName: session.userName,
          question: text,
          timestamp: new Date()
        });

        // Send admin typing indicator to user
        io.to(`chat-${sessionId}`).emit('admin-typing', {
          sessionId: session._id,
          isTyping: true,
          message: 'Admin is typing...'
        });

        // REMOVED: The long "I'm not sure about that..." message
        // Instead, just show a brief status message
        const statusMessage = {
          sender: 'bot',
          text: "⏳ Connecting you to a team member...",
          timestamp: new Date(),
          isAutoReply: false,
          isStatusMessage: true
        };
        
        session.messages.push(statusMessage);
        await session.save();

        setTimeout(() => {
          io.to(`chat-${sessionId}`).emit('new-message', {
            ...statusMessage,
            sessionId: session._id
          });
        }, 500);
      }

    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('chat-error', {
        success: false,
        message: 'Failed to send message'
      });
    }
  });

  // Handle admin messages
  socket.on('admin-message', async (data) => {
    const { sessionId, text, adminName = 'Admin' } = data;
    
    try {
      const session = await ChatSession.findById(sessionId);
      if (!session) {
        socket.emit('chat-error', { 
          success: false, 
          message: 'Session not found' 
        });
        return;
      }

      const adminMessage = {
        sender: 'admin',
        text: text,
        timestamp: new Date(),
        isAutoReply: false,
        adminName: adminName
      };
      
      session.messages.push(adminMessage);
      session.lastMessageAt = new Date();
      
      // Check if any unresolved questions match this answer
      const unresolved = session.unresolvedQuestions.filter(q => !q.resolved);
      if (unresolved.length > 0) {
        // Mark the first unresolved question as resolved
        unresolved[0].resolved = true;
        unresolved[0].answeredAt = new Date();
        unresolved[0].answer = text;
      }
      
      await session.save();

      // Stop admin typing indicator
      io.to(`chat-${sessionId}`).emit('admin-typing', {
        sessionId: session._id,
        isTyping: false
      });

      // Emit admin message to all in room
      io.to(`chat-${sessionId}`).emit('new-message', {
        ...adminMessage,
        sessionId: session._id
      });

    } catch (error) {
      console.error('Admin message error:', error);
      socket.emit('chat-error', {
        success: false,
        message: 'Failed to send admin message'
      });
    }
  });

  // Handle typing indicator
  socket.on('typing', async (data) => {
    const { sessionId, isTyping, sender = 'user' } = data;
    
    io.to(`chat-${sessionId}`).emit('user-typing', {
      sessionId,
      isTyping,
      sender,
      timestamp: new Date()
    });
  });

  // Handle resolve session
  socket.on('resolve-session', async (data) => {
    const { sessionId } = data;
    
    try {
      const session = await ChatSession.findById(sessionId);
      if (session) {
        session.status = 'resolved';
        session.closedAt = new Date();
        await session.save();
        
        // Stop admin typing indicator
        io.to(`chat-${sessionId}`).emit('admin-typing', {
          sessionId,
          isTyping: false
        });
        
        io.to(`chat-${sessionId}`).emit('session-resolved', {
          sessionId,
          status: 'resolved',
          timestamp: new Date()
        });
        
        io.emit('session-updated', {
          sessionId,
          status: 'resolved'
        });
      }
    } catch (error) {
      console.error('Resolve session error:', error);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`🔴 Socket disconnected: ${socket.id}`);
    if (socket.sessionId) {
      io.emit('user-disconnected', {
        sessionId: socket.sessionId,
        socketId: socket.id
      });
    }
  });
};