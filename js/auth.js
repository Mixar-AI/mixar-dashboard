// Mixar Dashboard - Authentication Module

class AuthService {
    constructor() {
        this.accessToken = localStorage.getItem(CONFIG.ACCESS_TOKEN_KEY);
        this.refreshToken = localStorage.getItem(CONFIG.REFRESH_TOKEN_KEY);
        this.user = JSON.parse(localStorage.getItem(CONFIG.USER_KEY) || 'null');
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.accessToken;
    }

    // Get access token
    getAccessToken() {
        return this.accessToken;
    }

    // Store tokens after login
    setTokens(accessToken, refreshToken = null) {
        this.accessToken = accessToken;
        localStorage.setItem(CONFIG.ACCESS_TOKEN_KEY, accessToken);

        if (refreshToken) {
            this.refreshToken = refreshToken;
            localStorage.setItem(CONFIG.REFRESH_TOKEN_KEY, refreshToken);
        }
    }

    // Store user data
    setUser(user) {
        this.user = user;
        localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
    }

    // Get current user
    getUser() {
        return this.user;
    }

    // Clear all auth data
    clearAuth() {
        this.accessToken = null;
        this.refreshToken = null;
        this.user = null;
        localStorage.removeItem(CONFIG.ACCESS_TOKEN_KEY);
        localStorage.removeItem(CONFIG.REFRESH_TOKEN_KEY);
        localStorage.removeItem(CONFIG.USER_KEY);
    }

    // API request with auth header
    async apiRequest(endpoint, options = {}) {
        const url = `${CONFIG.API_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            // Handle 401 - try to refresh token
            if (response.status === 401 && this.refreshToken) {
                const refreshed = await this.refreshAccessToken();
                if (refreshed) {
                    headers['Authorization'] = `Bearer ${this.accessToken}`;
                    return fetch(url, { ...options, headers });
                } else {
                    this.clearAuth();
                    window.location.href = CONFIG.ROUTES.LOGIN;
                    return response;
                }
            }

            return response;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Refresh access token
    async refreshAccessToken() {
        try {
            const response = await fetch(`${CONFIG.API_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: this.refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                this.setTokens(data.access_token, data.refresh_token);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    }

    // Login with email and password
    async login(email, password) {
        const response = await fetch(`${CONFIG.API_URL}/auth/login/json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail?.message || data.detail || 'Login failed');
        }

        this.setTokens(data.access_token, data.refresh_token);
        await this.fetchUser();
        return data;
    }

    // Send OTP for signup - requires email, password, and name
    async sendSignupOTP(email, password, name) {
        const response = await fetch(`${CONFIG.API_URL}/auth/signup/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail?.message || data.detail || data.message || 'Failed to send OTP');
        }

        return data;
    }

    // Verify OTP and complete signup
    async verifySignupOTP(email, otpCode, password, name) {
        const response = await fetch(`${CONFIG.API_URL}/auth/signup/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email,
                otp_code: otpCode,
                password,
                name
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail?.message || data.detail || 'OTP verification failed');
        }

        this.setTokens(data.access_token, data.refresh_token);
        await this.fetchUser();
        return data;
    }

    // Fetch current user info
    async fetchUser() {
        const response = await this.apiRequest('/auth/me');

        if (response.ok) {
            const user = await response.json();
            this.setUser(user);
            return user;
        }

        return null;
    }

    // Logout
    async logout() {
        try {
            await this.apiRequest('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            this.clearAuth();
            window.location.href = CONFIG.ROUTES.LOGIN;
        }
    }

    // Require authentication - redirect if not logged in
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = CONFIG.ROUTES.LOGIN;
            return false;
        }
        return true;
    }

    // Check if current user is a superuser
    isSuperuser() {
        return this.user?.is_superuser === true;
    }

    // Require superuser - redirect if not superuser
    requireSuperuser() {
        if (!this.requireAuth()) {
            return false;
        }
        if (!this.isSuperuser()) {
            window.location.href = CONFIG.ROUTES.DASHBOARD;
            return false;
        }
        return true;
    }

    // Redirect if already authenticated
    redirectIfAuthenticated() {
        if (this.isAuthenticated()) {
            window.location.href = CONFIG.ROUTES.DASHBOARD;
            return true;
        }
        return false;
    }

    // Initiate Google OAuth login
    async loginWithGoogle() {
        try {
            const response = await fetch(`${CONFIG.API_URL}/auth/login/google`);
            const data = await response.json();

            if (data.url) {
                // Redirect to Google OAuth
                window.location.href = data.url;
            } else {
                throw new Error('Failed to get Google login URL');
            }
        } catch (error) {
            console.error('Google login initiation failed:', error);
            throw error;
        }
    }

    // Handle Google OAuth callback
    async handleGoogleCallback(code) {
        const response = await fetch(`${CONFIG.API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail?.message || data.detail || 'Google authentication failed');
        }

        this.setTokens(data.access_token, data.refresh_token);
        await this.fetchUser();
        return data;
    }
}

// Create global auth instance
const auth = new AuthService();
