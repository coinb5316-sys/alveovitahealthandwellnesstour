// controllers/autoReplyController.js - COMPLETE
import AutoReply from '../models/AutoReply.js';

// @desc    Get all auto-reply rules
// @route   GET /api/auto-reply
export const getAutoReplies = async (req, res) => {
  try {
    const { enabled } = req.query;
    const query = {};
    if (enabled === 'true') query.enabled = true;
    
    const rules = await AutoReply.find(query).sort({ priority: 1 });
    res.json({
      success: true,
      rules
    });
  } catch (error) {
    console.error('Get auto-replies error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single auto-reply rule
// @route   GET /api/auto-reply/:id
export const getAutoReplyById = async (req, res) => {
  try {
    const rule = await AutoReply.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }
    res.json({ success: true, rule });
  } catch (error) {
    console.error('Get auto-reply error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create auto-reply rule
// @route   POST /api/auto-reply
export const createAutoReply = async (req, res) => {
  try {
    const { name, trigger, reply, category, enabled, priority } = req.body;
    
    if (!name || !trigger || !reply) {
      return res.status(400).json({
        success: false,
        message: 'Name, trigger and reply are required'
      });
    }

    const rule = await AutoReply.create({
      name,
      trigger,
      reply,
      category: category || 'general',
      enabled: enabled !== undefined ? enabled : true,
      priority: priority || 1,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      rule,
      message: 'Auto-reply rule created successfully'
    });
  } catch (error) {
    console.error('Create auto-reply error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update auto-reply rule
// @route   PUT /api/auto-reply/:id
export const updateAutoReply = async (req, res) => {
  try {
    const rule = await AutoReply.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }
    res.json({
      success: true,
      rule,
      message: 'Auto-reply rule updated successfully'
    });
  } catch (error) {
    console.error('Update auto-reply error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete auto-reply rule
// @route   DELETE /api/auto-reply/:id
export const deleteAutoReply = async (req, res) => {
  try {
    const rule = await AutoReply.findByIdAndDelete(req.params.id);
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }
    res.json({
      success: true,
      message: 'Auto-reply rule deleted successfully'
    });
  } catch (error) {
    console.error('Delete auto-reply error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle auto-reply rule
// @route   POST /api/auto-reply/:id/toggle
export const toggleAutoReply = async (req, res) => {
  try {
    const rule = await AutoReply.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found'
      });
    }
    rule.enabled = !rule.enabled;
    await rule.save();
    res.json({
      success: true,
      rule,
      message: `Rule ${rule.enabled ? 'enabled' : 'disabled'}`
    });
  } catch (error) {
    console.error('Toggle auto-reply error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get bot response (used by Live Chat)
// @route   POST /api/auto-reply/respond
export const getBotResponse = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const lowerMessage = message.toLowerCase();
    
    // Get all enabled rules sorted by priority
    const rules = await AutoReply.find({ enabled: true }).sort({ priority: 1 });
    
    // Find matching rule
    let matchedRule = null;
    for (const rule of rules) {
      const triggers = rule.trigger.split('|').map(t => t.trim().toLowerCase());
      for (const trigger of triggers) {
        if (lowerMessage.includes(trigger)) {
          matchedRule = rule;
          break;
        }
      }
      if (matchedRule) break;
    }

    // Return response - NO FALLBACK, just null if no match
    res.json({
      success: true,
      response: matchedRule ? matchedRule.reply : null,
      matchedRule: matchedRule ? {
        id: matchedRule._id,
        name: matchedRule.name,
        category: matchedRule.category
      } : null,
      hasMatch: !!matchedRule
    });
  } catch (error) {
    console.error('Get bot response error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};