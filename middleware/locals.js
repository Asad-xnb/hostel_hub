const Message = require('../models/Message');

// Middleware to set locals for all views
exports.setLocals = async (req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.query = req.query || {};

    // Get unread message count for logged-in users
    if (req.session.user) {
        try {
            const count = await Message.countDocuments({
                receiver: req.session.user.id,
                is_read: false
            });
            res.locals.unreadCount = count;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            res.locals.unreadCount = 0;
        }
    } else {
        res.locals.unreadCount = 0;
    }

    next();
};
