const CommunityMessage = require('../models/CommunityMessage');
const User = require('../models/User');

// @desc    Show community page
// @route   GET /community
exports.getCommunity = (req, res) => {
    res.render('community');
};

// @desc    Show area chat
// @route   GET /area_chat
exports.getAreaChat = (req, res) => {
    const area = req.query.area || 'General';
    res.render('area_chat', { area });
};

// @desc    Community API (send/fetch messages)
// @route   POST /api_community
exports.communityAPI = async (req, res) => {
    try {
        const { action, area, message, name } = req.body || {};

        if (!action || !area) {
            return res.status(400).send('Bad Request');
        }

        if (action === 'send') {
            let senderId, fullMsg;

            if (req.session.user) {
                // Logged-in user
                senderId = req.session.user.id;
                fullMsg = message;
            } else {
                // Guest user - using sender ID 3 as placeholder for Guest
                // Note: You should create a "Guest" user in your database with _id of a known value
                // For now, we'll just use the logged message format
                const guestName = (name || 'Guest').toString().substring(0, 50);
                fullMsg = `[${guestName}] ${message}`;
                
                // Find or create a guest user
                let guestUser = await User.findOne({ email: 'guest@hostelhub.com' });
                if (!guestUser) {
                    guestUser = await User.create({
                        name: 'Guest',
                        email: 'guest@hostelhub.com',
                        password: Math.random().toString(36),
                        role: 'student'
                    });
                }
                senderId = guestUser._id;
            }

            await CommunityMessage.create({
                area_name: area,
                sender: senderId,
                message: fullMsg
            });

            return res.send('sent');
        } else if (action === 'fetch') {
            const messages = await CommunityMessage.find({ area_name: area })
                .populate('sender', 'name')
                .sort({ createdAt: 1 })
                .lean();

            // Parse guest messages
            const parsedMessages = messages.map(msg => {
                let displayName = msg.sender ? msg.sender.name : 'Guest';
                let displayMessage = msg.message;

                // Check if it's a guest message format [Name] message
                if (displayName === 'Guest' && msg.message && msg.message.startsWith('[')) {
                    const endIndex = msg.message.indexOf(']');
                    if (endIndex > 1) {
                        displayName = msg.message.substring(1, endIndex);
                        displayMessage = msg.message.substring(endIndex + 1).trim();
                    }
                }

                return {
                    name: displayName,
                    message: displayMessage,
                    sender_id: msg.sender ? msg.sender._id : null,
                    createdAt: msg.createdAt,
                    created_at: msg.createdAt // For backward compatibility
                };
            });

            return res.json(parsedMessages);
        } else {
            return res.status(400).send('Bad Request');
        }
    } catch (error) {
        console.error('Community API Error:', error);
        res.status(500).send('Error processing community message');
    }
};
