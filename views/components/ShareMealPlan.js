class ShareMealPlan extends HTMLElement {
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

                .share-container {
                    background-color: var(--light-blue);
                    padding: 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .share-title {
                    color: var(--dark-blue);
                    margin-bottom: 1rem;
                    font-size: 1.2rem;
                }

                .share-options {
                    display: grid;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .share-option {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .share-link {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 1rem;
                }

                .share-link input {
                    flex: 1;
                    padding: 0.5rem;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }

                button {
                    background-color: var(--primary-blue);
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }

                button:hover {
                    background-color: var(--dark-blue);
                }

                .privacy-settings {
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid #ddd;
                }

                .privacy-option {
                    margin-bottom: 0.5rem;
                }

                .success-message {
                    color: green;
                    margin-top: 1rem;
                    display: none;
                }

                .error-message {
                    color: red;
                    margin-top: 1rem;
                    display: none;
                }
            </style>

            <div class="share-container">
                <h3 class="share-title">Share Meal Plan</h3>
                
                <div class="share-options">
                    <div class="share-option">
                        <input type="checkbox" id="allowViewing">
                        <label for="allowViewing">Allow viewing</label>
                    </div>
                    <div class="share-option">
                        <input type="checkbox" id="allowDownloading">
                        <label for="allowDownloading">Allow downloading</label>
                    </div>
                    <div class="share-option">
                        <input type="checkbox" id="allowSharing">
                        <label for="allowSharing">Allow sharing</label>
                    </div>
                </div>

                <div class="share-link">
                    <input type="text" id="shareLink" readonly>
                    <button id="copyLink">Copy</button>
                </div>

                <div class="social-share">
                    <button id="shareFacebook">Share on Facebook</button>
                    <button id="shareTwitter">Share on Twitter</button>
                    <button id="shareEmail">Share via Email</button>
                </div>

                <div class="success-message" id="successMessage">
                    Link copied to clipboard!
                </div>

                <div class="error-message" id="errorMessage">
                    Error sharing meal plan. Please try again.
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const copyButton = this.shadowRoot.getElementById('copyLink');
        const shareLink = this.shadowRoot.getElementById('shareLink');
        const successMessage = this.shadowRoot.getElementById('successMessage');
        const errorMessage = this.shadowRoot.getElementById('errorMessage');

        // Copy link button
        copyButton.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(shareLink.value);
                successMessage.style.display = 'block';
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 3000);
            } catch (error) {
                errorMessage.style.display = 'block';
                setTimeout(() => {
                    errorMessage.style.display = 'none';
                }, 3000);
            }
        });

        // Social share buttons
        this.shadowRoot.getElementById('shareFacebook').addEventListener('click', () => {
            this.shareOnFacebook();
        });

        this.shadowRoot.getElementById('shareTwitter').addEventListener('click', () => {
            this.shareOnTwitter();
        });

        this.shadowRoot.getElementById('shareEmail').addEventListener('click', () => {
            this.shareViaEmail();
        });

        // Privacy settings
        const privacyInputs = this.shadowRoot.querySelectorAll('.share-option input');
        privacyInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updatePrivacySettings();
            });
        });
    }

    async shareMealPlan(mealPlanId) {
        try {
            const response = await fetch(`/api/meal-plans/${mealPlanId}/share`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    privacySettings: {
                        allowViewing: this.shadowRoot.getElementById('allowViewing').checked,
                        allowDownloading: this.shadowRoot.getElementById('allowDownloading').checked,
                        allowSharing: this.shadowRoot.getElementById('allowSharing').checked
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Failed to share meal plan');
            }

            const data = await response.json();
            this.shadowRoot.getElementById('shareLink').value = data.shareLink;
        } catch (error) {
            console.error('Error sharing meal plan:', error);
            this.shadowRoot.getElementById('errorMessage').style.display = 'block';
        }
    }

    shareOnFacebook() {
        const shareLink = this.shadowRoot.getElementById('shareLink').value;
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`;
        window.open(url, '_blank');
    }

    shareOnTwitter() {
        const shareLink = this.shadowRoot.getElementById('shareLink').value;
        const text = 'Check out my personalized meal plan!';
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareLink)}`;
        window.open(url, '_blank');
    }

    shareViaEmail() {
        const shareLink = this.shadowRoot.getElementById('shareLink').value;
        const subject = 'My Personalized Meal Plan';
        const body = `Check out my personalized meal plan: ${shareLink}`;
        const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = url;
    }

    updatePrivacySettings() {
        const privacySettings = {
            allowViewing: this.shadowRoot.getElementById('allowViewing').checked,
            allowDownloading: this.shadowRoot.getElementById('allowDownloading').checked,
            allowSharing: this.shadowRoot.getElementById('allowSharing').checked
        };

        this.dispatchEvent(new CustomEvent('privacySettingsChanged', {
            detail: privacySettings,
            bubbles: true,
            composed: true
        }));
    }
}

customElements.define('share-meal-plan', ShareMealPlan); 