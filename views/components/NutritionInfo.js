class NutritionInfo extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin: 1rem 0;
                }

                .nutrition-container {
                    background-color: white;
                    padding: 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .nutrition-title {
                    color: var(--dark-blue);
                    margin-bottom: 1rem;
                    font-size: 1.2rem;
                }

                .nutrition-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                }

                .nutrition-item {
                    padding: 1rem;
                    background-color: var(--light-blue);
                    border-radius: 4px;
                    text-align: center;
                }

                .nutrition-value {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: var(--primary-blue);
                }

                .nutrition-label {
                    color: #666;
                    margin-top: 0.5rem;
                }

                .macro-chart {
                    margin-top: 2rem;
                    height: 200px;
                    position: relative;
                }

                .macro-bars {
                    display: flex;
                    height: 100%;
                    align-items: flex-end;
                    gap: 1rem;
                }

                .macro-bar {
                    flex: 1;
                    background-color: var(--primary-blue);
                    transition: height 0.3s ease;
                }

                .macro-label {
                    text-align: center;
                    margin-top: 0.5rem;
                }

                .daily-summary {
                    margin-top: 2rem;
                    padding-top: 1rem;
                    border-top: 1px solid #ddd;
                }

                .summary-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.5rem;
                }

                .progress-bar {
                    height: 8px;
                    background-color: #eee;
                    border-radius: 4px;
                    margin-top: 0.5rem;
                }

                .progress-fill {
                    height: 100%;
                    background-color: var(--primary-blue);
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }

                .goal-indicator {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                }

                .goal-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background-color: var(--primary-blue);
                }

                .goal-text {
                    font-size: 0.9rem;
                    color: #666;
                }
            </style>

            <div class="nutrition-container">
                <h3 class="nutrition-title">Nutritional Information</h3>
                
                <div class="nutrition-grid">
                    <div class="nutrition-item">
                        <div class="nutrition-value" id="calories">0</div>
                        <div class="nutrition-label">Calories</div>
                    </div>
                    <div class="nutrition-item">
                        <div class="nutrition-value" id="protein">0g</div>
                        <div class="nutrition-label">Protein</div>
                    </div>
                    <div class="nutrition-item">
                        <div class="nutrition-value" id="carbs">0g</div>
                        <div class="nutrition-label">Carbs</div>
                    </div>
                    <div class="nutrition-item">
                        <div class="nutrition-value" id="fat">0g</div>
                        <div class="nutrition-label">Fat</div>
                    </div>
                </div>

                <div class="macro-chart">
                    <div class="macro-bars">
                        <div class="macro-bar" id="proteinBar"></div>
                        <div class="macro-bar" id="carbsBar"></div>
                        <div class="macro-bar" id="fatBar"></div>
                    </div>
                    <div class="macro-labels">
                        <div class="macro-label">Protein</div>
                        <div class="macro-label">Carbs</div>
                        <div class="macro-label">Fat</div>
                    </div>
                </div>

                <div class="daily-summary">
                    <h4>Daily Summary</h4>
                    <div class="summary-item">
                        <span>Calories</span>
                        <span id="dailyCalories">0 / 2000</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="caloriesProgress"></div>
                    </div>
                    
                    <div class="summary-item">
                        <span>Protein</span>
                        <span id="dailyProtein">0g / 150g</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="proteinProgress"></div>
                    </div>
                    
                    <div class="summary-item">
                        <span>Carbs</span>
                        <span id="dailyCarbs">0g / 250g</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="carbsProgress"></div>
                    </div>
                    
                    <div class="summary-item">
                        <span>Fat</span>
                        <span id="dailyFat">0g / 65g</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="fatProgress"></div>
                    </div>
                </div>

                <div class="goal-indicator">
                    <div class="goal-dot"></div>
                    <div class="goal-text">Daily goals based on your profile</div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Listen for nutrition data updates
        this.addEventListener('nutritionUpdate', (event) => {
            this.updateNutritionData(event.detail);
        });
    }

    updateNutritionData(data) {
        // Update basic nutrition values
        this.shadowRoot.getElementById('calories').textContent = data.calories;
        this.shadowRoot.getElementById('protein').textContent = `${data.protein}g`;
        this.shadowRoot.getElementById('carbs').textContent = `${data.carbs}g`;
        this.shadowRoot.getElementById('fat').textContent = `${data.fat}g`;

        // Update macro distribution chart
        const total = data.protein + data.carbs + data.fat;
        const proteinPercentage = (data.protein / total) * 100;
        const carbsPercentage = (data.carbs / total) * 100;
        const fatPercentage = (data.fat / total) * 100;

        this.shadowRoot.getElementById('proteinBar').style.height = `${proteinPercentage}%`;
        this.shadowRoot.getElementById('carbsBar').style.height = `${carbsPercentage}%`;
        this.shadowRoot.getElementById('fatBar').style.height = `${fatPercentage}%`;

        // Update daily progress
        this.updateProgress('calories', data.calories, 2000);
        this.updateProgress('protein', data.protein, 150);
        this.updateProgress('carbs', data.carbs, 250);
        this.updateProgress('fat', data.fat, 65);
    }

    updateProgress(type, current, goal) {
        const percentage = Math.min((current / goal) * 100, 100);
        this.shadowRoot.getElementById(`${type}Progress`).style.width = `${percentage}%`;
        this.shadowRoot.getElementById(`daily${type.charAt(0).toUpperCase() + type.slice(1)}`).textContent = 
            `${current}${type === 'calories' ? '' : 'g'} / ${goal}${type === 'calories' ? '' : 'g'}`;
    }
}

customElements.define('nutrition-info', NutritionInfo); 