/**
 * Configuration for Meals for Life
 * Environment-specific settings
 */

// API URL - will be overridden by Cloudflare Pages environment variables
window.API_URL = 'https://meals-for-life-api.yourusername.workers.dev';

// Feature flags
window.FEATURES = {
  enableSharing: true,
  enableNutritionTracking: true,
  enableMealPlanGeneration: true,
};

// App settings
window.APP_SETTINGS = {
  defaultMealPlanDuration: 7, // days
  maxMealPlanDuration: 30, // days
  defaultPortions: 2,
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
};

// Initialize configuration
function initConfig() {
  // Override with environment variables if available
  if (window.ENV && window.ENV.API_URL) {
    window.API_URL = window.ENV.API_URL;
  }
  
  console.log('Configuration initialized with API URL:', window.API_URL);
}

// Call initialization when the script loads
initConfig(); 