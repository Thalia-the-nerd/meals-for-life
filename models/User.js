const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    profile: {
        age: Number,
        gender: String,
        currentWeight: Number,
        goalWeight: Number,
        height: Number,
        activityLevel: String,
        dietType: String,
        allergies: [String],
        weeklyBudget: Number
    },
    preferences: {
        favoriteRecipes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Recipe'
        }],
        mealPlanHistory: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MealPlan'
        }],
        dietaryRestrictions: [String],
        cookingSkillLevel: String,
        preferredCookingTime: String,
        kitchenEquipment: [String]
    },
    integrations: {
        googleCalendar: {
            enabled: Boolean,
            accessToken: String,
            refreshToken: String
        },
        fitnessApps: [{
            name: String,
            enabled: Boolean,
            accessToken: String
        }],
        shoppingApps: [{
            name: String,
            enabled: Boolean,
            accessToken: String
        }]
    },
    analytics: {
        lastLogin: Date,
        mealPlansGenerated: Number,
        recipesViewed: Number,
        shoppingListsCreated: Number,
        weightProgress: [{
            date: Date,
            weight: Number
        }]
    },
    sharing: {
        sharedMealPlans: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SharedMealPlan'
        }],
        privacySettings: {
            shareProfile: Boolean,
            shareProgress: Boolean,
            shareMealPlans: Boolean
        }
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to get user's progress
userSchema.methods.getProgress = function() {
    return {
        weightProgress: this.analytics.weightProgress,
        mealPlansGenerated: this.analytics.mealPlansGenerated,
        recipesViewed: this.analytics.recipesViewed
    };
};

// Method to update weight progress
userSchema.methods.updateWeight = async function(weight) {
    this.analytics.weightProgress.push({
        date: new Date(),
        weight
    });
    return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User; 