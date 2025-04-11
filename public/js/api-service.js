/**
 * API Service for Meals for Life
 * Communicates with Cloudflare Workers API
 */

class ApiService {
  constructor() {
    // Use environment-specific API URL
    this.apiUrl = window.API_URL || 'https://meals-for-life-api.yourusername.workers.dev';
    this.token = localStorage.getItem('token');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.apiUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Authentication
  async login(email, password) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setToken(data.token);
    return data;
  }

  async register(name, email, password) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    
    this.setToken(data.token);
    return data;
  }

  async logout() {
    this.clearToken();
  }

  // Meal Plans
  async getMealPlans() {
    return this.request('/api/meal-plans');
  }

  async getMealPlan(id) {
    return this.request(`/api/meal-plans/${id}`);
  }

  async createMealPlan(mealPlanData) {
    return this.request('/api/meal-plans', {
      method: 'POST',
      body: JSON.stringify(mealPlanData),
    });
  }

  async updateMealPlan(id, mealPlanData) {
    return this.request(`/api/meal-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(mealPlanData),
    });
  }

  async deleteMealPlan(id) {
    return this.request(`/api/meal-plans/${id}`, {
      method: 'DELETE',
    });
  }

  async shareMealPlan(id, privacySettings) {
    return this.request(`/api/meal-plans/${id}/share`, {
      method: 'POST',
      body: JSON.stringify({ privacySettings }),
    });
  }

  // Recipes
  async getRecipes() {
    return this.request('/api/recipes');
  }

  async getRecipe(id) {
    return this.request(`/api/recipes/${id}`);
  }

  // Nutrition
  async getNutrition() {
    return this.request('/api/nutrition');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService; 