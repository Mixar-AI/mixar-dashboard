// Mixar Dashboard Configuration
const CONFIG = {
    // API Base URL - change this for production
    API_URL: 'http://localhost:8000/api/v1',

    // Token storage keys
    ACCESS_TOKEN_KEY: 'mixar_access_token',
    REFRESH_TOKEN_KEY: 'mixar_refresh_token',
    USER_KEY: 'mixar_user',

    // Routes
    ROUTES: {
        LOGIN: '/pages/login.html',
        SIGNUP: '/pages/signup.html',
        DASHBOARD: '/pages/dashboard.html',
        HOME: '/index.html'
    }
};

// Make config immutable
Object.freeze(CONFIG);
Object.freeze(CONFIG.ROUTES);
