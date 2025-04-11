const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
        required: true
    },
    recipe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
        required: true
    },
    portions: {
        type: Number,
        required: true,
        default: 1
    },
    nutritionalInfo: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number,
        fiber: Number,
        sugar: Number,
        sodium: Number
    },
    prepInstructions: {
        prepTime: Number,
        cookTime: Number,
        totalTime: Number,
        difficulty: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard']
        },
        steps: [String],
        tips: [String],
        equipment: [String]
    },
    storage: {
        canBePrepped: Boolean,
        storageTime: Number,
        storageInstructions: String,
        reheatingInstructions: String
    }
});

const daySchema = new mongoose.Schema({
    date: Date,
    meals: [mealSchema],
    totalNutrition: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number,
        fiber: Number,
        sugar: Number,
        sodium: Number
    }
});

const mealPlanSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    days: [daySchema],
    preferences: {
        dietType: String,
        allergies: [String],
        cookingSkillLevel: String,
        mealPrepPreference: String
    },
    shoppingList: {
        items: [{
            name: String,
            quantity: Number,
            unit: String,
            estimatedPrice: Number,
            category: String,
            store: String
        }],
        totalEstimatedCost: Number,
        stores: [String]
    },
    analytics: {
        totalCalories: Number,
        averageCaloriesPerDay: Number,
        costPerMeal: Number,
        costPerDay: Number,
        nutritionalBalance: {
            proteinPercentage: Number,
            carbPercentage: Number,
            fatPercentage: Number
        }
    },
    sharing: {
        isShared: Boolean,
        shareLink: String,
        sharedWith: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        privacySettings: {
            allowViewing: Boolean,
            allowDownloading: Boolean,
            allowSharing: Boolean
        }
    },
    version: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'completed', 'archived'],
        default: 'draft'
    }
}, {
    timestamps: true
});

// Method to calculate total nutrition for a day
mealPlanSchema.methods.calculateDayNutrition = function(dayIndex) {
    const day = this.days[dayIndex];
    const totalNutrition = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0
    };

    day.meals.forEach(meal => {
        Object.keys(totalNutrition).forEach(nutrient => {
            totalNutrition[nutrient] += meal.nutritionalInfo[nutrient] * meal.portions;
        });
    });

    day.totalNutrition = totalNutrition;
    return totalNutrition;
};

// Method to calculate total shopping list cost
mealPlanSchema.methods.calculateShoppingListCost = function() {
    let totalCost = 0;
    this.shoppingList.items.forEach(item => {
        totalCost += item.estimatedPrice * item.quantity;
    });
    this.shoppingList.totalEstimatedCost = totalCost;
    return totalCost;
};

// Method to generate shopping list
mealPlanSchema.methods.generateShoppingList = async function() {
    // Implementation for generating shopping list from meals
    // This would aggregate ingredients from all recipes
    // and combine similar items
};

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);

module.exports = MealPlan; 