const User = require('../models/User');

// @desc    Register new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password, confirm_password, role } = req.body;

        // Validate passwords match
        if (password !== confirm_password) {
            return res.render('register', { error: 'Passwords do not match' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('register', { error: 'Email already exists' });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'student'
        });

        res.redirect('/login');
    } catch (error) {
        console.error('Register Error:', error);
        res.render('register', { error: 'Registration failed. Please try again.' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('login', { error: 'Email not found' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.render('login', { error: 'Incorrect password' });
        }

        // Set session
        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profile_pic: user.profile_pic
        };

        // Redirect based on role
        if (user.role === 'owner') {
            return res.redirect('/owner_dashboard');
        } else if (user.role === 'student') {
            return res.redirect('/student_dashboard');
        }
        res.redirect('/');
    } catch (error) {
        console.error('Login Error:', error);
        res.render('login', { error: 'Login failed. Please try again.' });
    }
};

// @desc    Logout user
// @route   GET /logout
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error('Logout Error:', err);
        res.redirect('/login');
    });
};

// @desc    Show login page
// @route   GET /login
exports.showLogin = (req, res) => {
    res.render('login', { error: null });
};

// @desc    Show register page
// @route   GET /register
exports.showRegister = (req, res) => {
    res.render('register', { error: null });
};
