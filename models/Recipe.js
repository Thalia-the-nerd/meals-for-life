const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['produce', 'meat', 'dairy', 'pantry', 'spices', 'other'],
        required: true
    },
    estimatedPrice: {
        type: Number,
        required: true
    },
    substitutions: [{
        name: String,
        amount: Number,
        unit: String
    }]
});

const recipeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'],
        required: true
    },
    cuisine: {
        type: String,
        required: true
    },
    ingredients: [ingredientSchema],
    instructions: {
        prepTime: {
            type: Number,
            required: true
        },
        cookTime: {
            type: Number,
            required: true
        },
        totalTime: {
            type: Number,
            required: true
        },
        difficulty: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard'],
            required: true
        },
        steps: [{
            order: Number,
            description: String,
            tips: [String],
            visualCues: [String]
        }],
        equipment: [{
            name: String,
            required: Boolean
        }]
    },
    nutritionalInfo: {
        servingSize: {
            amount: Number,
            unit: String
        },
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number,
        fiber: Number,
        sugar: Number,
        sodium: Number,
        vitamins: [{
            name: String,
            amount: Number,
            unit: String
        }],
        minerals: [{
            name: String,
            amount: Number,
            unit: String
        }]
    },
    storage: {
        canBePrepped: Boolean,
        storageTime: Number,
        storageInstructions: String,
        reheatingInstructions: String,
        freezingInstructions: String
    },
    media: {
        images: [{
            url: String,
            caption: String
        }],
        video: {
            url: String,
            thumbnail: String
        }
    },
    metadata: {
        tags: [String],
        season: [String],
        dietary: {
            vegetarian: Boolean,
            vegan: Boolean,
            glutenFree: Boolean,
            dairyFree: Boolean,
            keto: Boolean,
            paleo: Boolean
        },
        allergens: [String]
    },
    analytics: {
        views: Number,
        saves: Number,
        ratings: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            rating: Number,
            review: String,
            date: Date
        }],
        averageRating: Number
    },
    version: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    }
}, {
    timestamps: true
});

// Method to calculate total recipe cost
recipeSchema.methods.calculateTotalCost = function() {
    return this.ingredients.reduce((total, ingredient) => {
        return total + (ingredient.estimatedPrice * ingredient.amount);
    }, 0);
};

// Method to scale recipe
recipeSchema.methods.scaleRecipe = function(factor) {
    const scaledRecipe = this.toObject();
    scaledRecipe.ingredients = scaledRecipe.ingredients.map(ingredient => ({
        ...ingredient,
        amount: ingredient.amount * factor
    }));
    return scaledRecipe;
};

// Method to get nutritional info per serving
recipeSchema.methods.getNutritionPerServing = function() {
    const servingSize = this.nutritionalInfo.servingSize.amount;
    const nutrition = { ...this.nutritionalInfo };
    delete nutrition.servingSize;
    
    Object.keys(nutrition).forEach(key => {
        if (typeof nutrition[key] === 'number') {
            nutrition[key] = nutrition[key] / servingSize;
        }
    });
    
    return nutrition;
};

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe; 