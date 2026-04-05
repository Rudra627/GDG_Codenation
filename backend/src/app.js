const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();

// Trust proxy if running behind a reverse proxy (e.g., Nginx, Heroku)
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Logging
morgan.token('body', (req) => {
    let body = { ...req.body };
    if (body.password) body.password = '***';
    return JSON.stringify(body);
});
app.use(morgan(':method :url :status :res[content-length] - :response-time ms - body: :body'));

// CORS Policy
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

const { csrfProtection } = require('./middleware/csrfMiddleware');
app.use(csrfProtection);

// Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs for dev
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Serve static files from 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic Route
app.get('/', (req, res) => {
    res.send('Backend started...');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const problemRoutes = require('./routes/problemRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const noteRoutes = require('./routes/noteRoutes');
const contestRoutes = require('./routes/contestRoutes');
const userRoutes = require('./routes/userRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/users', userRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(500).json({ 
        message: 'Something went wrong on the server', 
        error: isProduction ? null : err.message 
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});