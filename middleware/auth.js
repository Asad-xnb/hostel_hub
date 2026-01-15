// Middleware to check if user is authenticated
exports.requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

// Middleware to check if user is a student
exports.requireStudent = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'student') {
        return res.redirect('/login');
    }
    next();
};

// Middleware to check if user is an owner
exports.requireOwner = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'owner') {
        return res.redirect('/login');
    }
    next();
};

// Middleware to check if user is an admin
exports.requireAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.redirect('/login');
    }
    next();
};
