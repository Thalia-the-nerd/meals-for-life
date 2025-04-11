class CookieManager {
    static setCookie(name, value, days = 30) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${JSON.stringify(value)};${expires};path=/`;
    }

    static getCookie(name) {
        const cookieName = `${name}=`;
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.indexOf(cookieName) === 0) {
                try {
                    return JSON.parse(cookie.substring(cookieName.length));
                } catch (e) {
                    return cookie.substring(cookieName.length);
                }
            }
        }
        return null;
    }

    static deleteCookie(name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }

    static saveUserData(userData) {
        this.setCookie('userData', userData);
    }

    static getUserData() {
        return this.getCookie('userData');
    }

    static saveMealPlan(mealPlan) {
        this.setCookie('mealPlan', mealPlan);
    }

    static getMealPlan() {
        return this.getCookie('mealPlan');
    }
}

export default CookieManager; 