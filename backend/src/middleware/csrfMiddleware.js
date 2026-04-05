const crypto = require('crypto');

const csrfProtection = (req, res, next) => {
    let token = req.cookies['XSRF-TOKEN'];

    // Generate a token if not present
    if (!token) {
        token = crypto.randomBytes(32).toString('hex');
        res.cookie('XSRF-TOKEN', token, {
            httpOnly: false, // Axios needs to read this to send it in the header
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        });
    }
    
    req.csrfToken = token;

    // Ignore safe methods and authentication entry points
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }
    
    // Exempt unauthenticated routes
    const path = req.originalUrl || req.path;
    if (path.match(/\/api\/auth\/(login|register|google)/i)) {
        return next();
    }

    const headerToken = req.headers['x-xsrf-token'] || req.headers['x-csrf-token'];
    
    if (!headerToken || headerToken !== token) {
        return res.status(403).json({ message: 'CSRF token validation failed' });
    }

    next();
};

module.exports = { csrfProtection };
