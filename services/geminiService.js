const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateMealPlan(userData) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `Create a personalized meal plan for the following user:
        - Name: ${userData.name}
        - Age: ${userData.age}
        - Gender: ${userData.gender}
        - Current Weight: ${userData.currentWeight} kg
        - Goal Weight: ${userData.goalWeight} kg
        - Weight Goal: ${userData.weightGoal}
        - Activity Level: ${userData.activityLevel}
        - Diet Type: ${userData.dietType}
        - Allergies: ${userData.allergies}
        - Weekly Budget: $${userData.weeklyBudget}

        Please provide a detailed meal plan with the following information:

        1. A 7-day meal plan with breakfast, lunch, and dinner:
           - Each meal should include:
             * Complete list of ingredients with exact measurements
             * Step-by-step cooking instructions (numbered steps)
             * Required kitchen equipment and tools
             * Preparation time and cooking time separately
             * Difficulty level (Easy/Medium/Hard)
             * Tips for success and common mistakes to avoid
             * Suggested substitutions for ingredients if needed
             * Visual cues for doneness (e.g., "until golden brown")

        2. Comprehensive nutritional information for each meal:
           - Calories per serving
           - Macronutrients (protein, carbs, fat)
           - Micronutrients (vitamins, minerals)
           - Fiber content
           - Sugar content
           - Sodium content

        3. Detailed shopping list:
           - Itemized list of all ingredients
           - Estimated price per item
           - Total cost breakdown by category (produce, proteins, grains, etc.)
           - Cost-saving alternatives where available
           - Must ensure total cost stays within the weekly budget of $${userData.weeklyBudget}

        4. Daily nutritional summary:
           - Total daily calories
           - Macro distribution
           - How the plan aligns with the user's weight goal (${userData.weightGoal})
           - Caloric deficit/surplus explanation

        5. Meal prep and storage instructions:
           - Which meals can be prepared in advance
           - Storage containers needed
           - Refrigeration/freezing guidelines
           - Reheating instructions
           - Food safety tips

        Please format the response in a clear, easy-to-read structure with sections and bullet points where appropriate. Each recipe should be self-contained with all necessary information for a beginner cook to follow successfully.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Parse the response into structured data
        const mealPlanData = parseGeminiResponse(text);
        
        return mealPlanData;
    } catch (error) {
        console.error('Error generating meal plan:', error);
        throw error;
    }
}

function parseGeminiResponse(text) {
    // This is a simplified parser - you'll need to enhance this based on the actual response format
    const sections = text.split('\n\n');
    
    const mealPlan = {
        name: 'Personalized Meal Plan',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        days: [],
        shoppingList: {
            items: [],
            totalEstimatedCost: 0
        },
        analytics: {
            totalCalories: 0,
            averageCaloriesPerDay: 0,
            costPerMeal: 0,
            costPerDay: 0,
            nutritionalBalance: {
                proteinPercentage: 0,
                carbPercentage: 0,
                fatPercentage: 0
            }
        }
    };
    
    // Parse each section and populate the meal plan object
    // This is where you'll need to implement the actual parsing logic
    // based on the structure of the Gemini response
    
    return mealPlan;
}

module.exports = {
    generateMealPlan
}; 