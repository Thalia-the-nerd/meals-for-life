// Load environment variables
require('dotenv').config();

class GeminiAPI {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    }

    async generateMealPlan(userData) {
        try {
            const prompt = this.createPrompt(userData);
            
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate meal plan');
            }

            const data = await response.json();
            return this.formatMealPlan(data);
        } catch (error) {
            console.error('Error generating meal plan:', error);
            throw error;
        }
    }

    createPrompt(userData) {
        return `Create a personalized meal plan for the following user:
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
    }

    formatMealPlan(data) {
        // Format the response from Gemini API into a structured meal plan
        // This will need to be adjusted based on the actual API response format
        return {
            days: data.candidates[0].content.parts[0].text,
            // Add more structured data as needed
        };
    }
}

// Export the class
export default GeminiAPI; 