require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const socketio = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth');
const mealPlanRoutes = require('./routes/mealPlans');
const recipeRoutes = require('./routes/recipes');
const shoppingRoutes = require('./routes/shopping');
const nutritionRoutes = require('./routes/nutrition');
const sharingRoutes = require('./routes/sharing');
const analyticsRoutes = require('./routes/analytics');
const integrationRoutes = require('./routes/integrations');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Serve static files
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'views')));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meals-for-life', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/shopping', shoppingRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/share', sharingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/integrations', integrationRoutes);

// Serve HTML files
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/meal-plans', (req, res) => res.sendFile(path.join(__dirname, 'public', 'meal-plans.html')));
app.get('/recipes', (req, res) => res.sendFile(path.join(__dirname, 'public', 'recipes.html')));
app.get('/nutrition', (req, res) => res.sendFile(path.join(__dirname, 'public', 'nutrition.html')));
app.get('/checkout', (req, res) => res.sendFile(path.join(__dirname, 'public', 'checkout.html')));
app.get('/thank-you', (req, res) => res.sendFile(path.join(__dirname, 'public', 'thank-you.html')));

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Socket.io setup
const io = socketio(server);
io.on('connection', (socket) => {
    co