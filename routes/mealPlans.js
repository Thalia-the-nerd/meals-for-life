const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const MealPlan = require('../models/MealPlan');
const User = require('../models/User');
const { generateMealPlan } = require('../services/geminiService');

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Generate new meal plan
router.post('/generate', verifyToken, async (req, res) => {
    try {
        const userData = {
            ...req.user.profile,
            preferences: req.user.preferences
        };
        
        // Generate meal plan using Gemini
        const mealPlanData = await generateMealPlan(userData);
        
        // Create new meal plan
        const mealPlan = new MealPlan({
            user: req.user._id,
            ...mealPlanData
        });
        
        await mealPlan.save();
        
        // Update user's meal plan history
        req.user.preferences.mealPlanHistory.push(mealPlan._id);
        req.user.analytics.mealPlansGenerated += 1;
        await req.user.save();
        
        res.status(201).json(mealPlan);
    } catch (error) {
        res.status(500).json({ error: 'Error generating meal plan' });
    }
});

// Get user's meal plans
router.get('/', verifyToken, async (req, res) => {
    try {
        const mealPlans = await MealPlan.find({ user: req.user._id })
            .sort({ createdAt: -1 });
        
        res.json(mealPlans);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching meal plans' });
    }
});

// Get specific meal plan
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const mealPlan = await MealPlan.findOne({
            _id: req.params.id,
            user: req.user._id
        });
        
        if (!mealPlan) {
            return res.status(404).json({ error: 'Meal plan not found' });
        }
        
        res.json(mealPlan);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching meal plan' });
    }
});

// Update meal plan
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const mealPlan = await MealPlan.findOne({
            _id: req.params.id,
            user: req.user._id
        });
        
        if (!mealPlan) {
            return res.status(404).json({ error: 'Meal plan not found' });
        }
        
        // Update meal plan fields
        Object.keys(req.body).forEach(key => {
            mealPlan[key] = req.body[key];
        });
        
        // Increment version
        mealPlan.version += 1;
        
        await mealPlan.save();
        
        res.json(mealPlan);
    } catch (error) {
        res.status(500).json({ error: 'Error updating meal plan' });
    }
});

// Delete meal plan
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const mealPlan = await MealPlan.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });
        
        if (!mealPlan) {
            return res.status(404).json({ error: 'Meal plan not found' });
        }
        
        // Remove from user's meal plan history
        req.user.preferences.mealPlanHistory = req.user.preferences.mealPlanHistory.filter(
            id => id.toString() !== mealPlan._id.toString()
        );
        await req.user.save();
        
        res.json({ message: 'Meal plan deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting meal plan' });
    }
});

// Share meal plan
router.post('/:id/share', verifyToken, async (req, res) => {
    try {
        const mealPlan = await MealPlan.findOne({
            _id: req.params.id,
            user: req.user._id
        });
        
        if (!mealPlan) {
            return res.status(404).json({ error: 'Meal plan not found' });
        }
        
        // Generate share link
        const shareToken = jwt.sign(
            { mealPlanId: mealPlan._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );
        
        mealPlan.sharing.isShared = true;
        mealPlan.sharing.shareLink = `${process.env.BASE_URL}/shared-meal-plan/${shareToken}`;
        mealPlan.sharing.privacySettings = req.body.privacySettings || mealPlan.sharing.privacySettings;
        
        await mealPlan.save();
        
        res.json({
            shareLink: mealPlan.sharing.shareLink,
            privacySettings: mealPlan.sharing.privacySettings
        });
    } catch (error) {
        res.status(500).json({ error: 'Error sharing meal plan' });
    }
});

// Get shared meal plan
router.get('/shared/:token', async (req, res) => {
    try {
        const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET || 'your-secret-key');
        const mealPlan = await MealPlan.findById(decoded.mealPlanId);
        
        if (!mealPlan || !mealPlan.sharing.isShared) {
            return res.status(404).json({ error: 'Shared meal plan not found' });
        }
        
        // Return only necessary data based on privacy settings
        const sharedData = {
            name: mealPlan.name,
            days: mealPlan.days,
            preferences: mealPlan.preferences,
            analytics: {
                totalCalories: mealPlan.analytics.totalCalories,
                nutritionalBalance: mealPlan.analytics.nutritionalBalance
            }
        };
        
        res.json(sharedData);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching shared meal plan' });
    }
});

module.exports = router; 