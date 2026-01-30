# Mixar Dashboard

A modern, responsive dashboard for Mixar users to sign up, login, and manage their credits and usage.

## Features

- **User Authentication**
  - Email/password login with JWT tokens
  - OTP-based signup with email verification
  - Automatic token refresh
  - Secure logout with token blacklisting

- **Dashboard**
  - View available credits
  - Usage history and statistics
  - Account management

## Tech Stack

- Pure HTML5, CSS3, and JavaScript (no frameworks)
- Matches Mixar brand design system
- Responsive design for all devices
- Integration with Mixar Backend API

## Project Structure

```
mixar-dashboard/
├── index.html          # Landing page
├── assets/             # Images and static assets
│   ├── Logo-Primary_light.png
│   └── MainBG2.png
├── css/
│   ├── styles.css      # Base styles
│   └── dashboard.css   # Dashboard-specific styles
├── js/
│   ├── config.js       # Configuration (API URL, etc.)
│   └── auth.js         # Authentication service
└── pages/
    ├── login.html      # Login page
    ├── signup.html     # Signup with OTP verification
    └── dashboard.html  # User dashboard
```

## Configuration

Edit `js/config.js` to set your API URL:

```javascript
const CONFIG = {
    API_URL: 'http://localhost:8000/api/v1',
    // ... other settings
};
```

## API Endpoints Used

- `POST /auth/login/json` - Login with email/password
- `POST /auth/signup/send-otp` - Send OTP for signup
- `POST /auth/signup/verify-otp` - Verify OTP and create account
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout (blacklist token)
- `GET /auth/me` - Get current user info

## Development

Simply open `index.html` in a browser or serve with any static file server:

```bash
# Using Python
python -m http.server 3000

# Using Node.js
npx serve
```

## Deployment

This is a static site that can be deployed to any hosting service:

- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any static file server

## License

Copyright (c) 2024 Mixar AI. All rights reserved.
