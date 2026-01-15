const User = require('../models/User');

// @desc    Get user profile
// @route   GET /profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id).lean();
        res.render('profile', { user });
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).send('Error loading profile');
    }
};

// @desc    Update user profile
// @route   POST /update_profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, city, about } = req.body;

        const updateData = { name, phone, city, about };

        // Handle profile picture
        if (req.files && req.files.profile_pic) {
            updateData.profile_pic = req.files.profile_pic[0].filename;
        }

        // Handle CNIC verification
        if (req.files && req.files.cnic_front) {
            updateData.cnic_front = req.files.cnic_front[0].filename;
            updateData.is_id_verified = true;
        }

        await User.findByIdAndUpdate(req.session.user.id, updateData);

        // Update session
        if (updateData.profile_pic) {
            req.session.user.profile_pic = updateData.profile_pic;
        }
        req.session.user.name = name;

        res.redirect('/profile');
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).send('Error updating profile');
    }
};
