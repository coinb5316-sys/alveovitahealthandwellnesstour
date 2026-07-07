// backend/controllers/contactController.js
import Contact from '../models/Contact.js';
import nodemailer from 'nodemailer';

// @desc    Submit contact form
// @route   POST /api/contact
export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, subject and message'
      });
    }

    const contact = await Contact.create({
      name,
      email,
      phone,
      subject,
      message,
      status: 'unread',
      user: req.user?.id || null
    });

    // Send email notification
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: `New Contact Message: ${subject}`,
        html: `
          <h2>New Contact Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
          <hr>
          <p>Sent from Alveovita Contact Form</p>
        `
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Don't fail the request if email fails
    }

    // Auto-reply to user
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Thank you for contacting Alveovita Wellness',
        html: `
          <h2>Thank You for Reaching Out!</h2>
          <p>Dear ${name},</p>
          <p>Thank you for contacting Alveovita Health and Wellness Tourism. We have received your message and our team will get back to you within 24 hours.</p>
          <p>In the meantime, feel free to explore our website to learn more about our wellness programs and packages.</p>
          <br>
          <p>Warm regards,</p>
          <p><strong>The Alveovita Team</strong></p>
          <p>🌿 Your Wellness Journey Starts Here</p>
        `
      });
    } catch (autoReplyError) {
      console.error('Auto-reply error:', autoReplyError);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
      contact
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send message'
    });
  }
};

// @desc    Get all contact messages
// @route   GET /api/contact
export const getContacts = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category, search } = req.query;
    
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      contacts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single contact message
// @route   GET /api/contact/:id
export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    res.json({ success: true, contact });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update contact status
// @route   PUT /api/contact/:id/status
export const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status, readAt: status === 'read' ? new Date() : null },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    res.json({ success: true, contact });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add reply to contact
// @route   POST /api/contact/:id/reply
export const addContactReply = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required'
      });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const reply = {
      content,
      sentAt: new Date(),
      sentBy: req.user?.name || 'Admin'
    };

    contact.replies.push(reply);
    contact.status = 'replied';
    contact.repliedAt = new Date();
    await contact.save();

    // Send email reply
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: contact.email,
        subject: `Re: ${contact.subject}`,
        html: `
          <h2>Reply to your message</h2>
          <p>Dear ${contact.name},</p>
          <p>${content}</p>
          <br>
          <p>Your original message:</p>
          <hr>
          <p><strong>Subject:</strong> ${contact.subject}</p>
          <p><strong>Message:</strong> ${contact.message}</p>
          <br>
          <p>Best regards,</p>
          <p><strong>The Alveovita Team</strong></p>
        `
      });
    } catch (emailError) {
      console.error('Reply email error:', emailError);
    }

    res.json({ success: true, contact });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle spam status
// @route   POST /api/contact/:id/spam
export const toggleSpam = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    contact.isSpam = !contact.isSpam;
    contact.status = contact.isSpam ? 'spam' : 'unread';
    await contact.save();
    res.json({
      success: true,
      contact
    });
  } catch (error) {
    console.error('Toggle spam error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Toggle archive status
// @route   POST /api/contact/:id/archive
export const toggleArchive = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    contact.isArchived = !contact.isArchived;
    await contact.save();
    res.json({
      success: true,
      contact
    });
  } catch (error) {
    console.error('Toggle archive error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};