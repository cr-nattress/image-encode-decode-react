# Web UI Security Best Practices (For AI Agents)

This README provides a structured overview of web UI security practices tailored for AI agents analyzing, generating, or securing frontend applications. Use this as a checklist, reference guide, or static knowledge base.

## Table of Contents
- [1. Cross-Site Scripting (XSS)](#1-cross-site-scripting-xss)
- [2. Cross-Site Request Forgery (CSRF)](#2-cross-site-request-forgery-csrf)
- [3. Content Security Policy (CSP)](#3-content-security-policy-csp)
- [4. Forms & Authentication](#4-forms--authentication)
- [5. Data Privacy](#5-data-privacy)
- [6. Clickjacking Protection](#6-clickjacking-protection)
- [7. Third-Party Libraries](#7-third-party-libraries)
- [8. Secure Cookies](#8-secure-cookies)
- [9. Session Management](#9-session-management)
- [10. Security Headers](#10-security-headers)
- [11. Subresource Integrity (SRI)](#11-subresource-integrity-sri)
- [12. API Security](#12-api-security)
- [13. WebSocket Security](#13-websocket-security)
- [14. Security Testing](#14-security-testing)
- [15. CI/CD Security Integration](#15-cicd-security-integration)
- [Implementation Checklist](#implementation-checklist)

## 1. Cross-Site Scripting (XSS)

### Critical Measures
- Sanitize all user input using libraries like DOMPurify
- Escape output before rendering into the DOM
- Avoid `innerHTML`, `eval`, `document.write`, and other dangerous methods

### Implementation Examples

```javascript
// BAD - vulnerable to XSS
document.getElementById('userContent').innerHTML = userProvidedData;

// GOOD - Using textContent (safe)
document.getElementById('userContent').textContent = userProvidedData;

// GOOD - Using DOMPurify for HTML content
import DOMPurify from 'dompurify';
document.getElementById('userContent').innerHTML = DOMPurify.sanitize(userProvidedData);
```

### Framework-Specific Protections
- **React**: Use JSX to automatically escape values
- **Angular**: Uses context-aware escaping by default
- **Vue**: Automatically escapes content in templates

### DOM-Based XSS Prevention
- Avoid using `location.href`, `document.referrer`, or `document.URL` directly in DOM
- Validate URL parameters before use
- Use safe DOM APIs like `createElement` and `setAttribute` instead of string concatenation

## 2. Cross-Site Request Forgery (CSRF)

### Critical Measures
- Use anti-CSRF tokens in state-changing requests
- Set cookies with `SameSite=Lax` or `Strict`
- Verify origin and referrer headers

### Implementation Examples

```javascript
// Server-side token generation (Node.js/Express example)
app.use(csrf());
app.get('/form', (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});

// Client-side token usage
const form = document.querySelector('form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  fetch('/api/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
    },
    body: JSON.stringify(formData)
  });
});
```

### SPA-Specific Protection
- Use custom headers (e.g., `X-Requested-With: XMLHttpRequest`)
- Implement double-submit cookie pattern
- For token-based auth (JWT), store tokens in memory, not localStorage

## 3. Content Security Policy (CSP)

### Critical Measures
- Disallow inline scripts/styles
- Restrict asset sources
- Use nonce-based script execution

### Implementation Examples

```html
<!-- Meta tag implementation -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://trusted-cdn.com; style-src 'self' https://trusted-cdn.com; img-src 'self' data: https://trusted-cdn.com; connect-src 'self' https://api.example.com;">
```

```javascript
// Server-side implementation (Node.js/Express)
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'nonce-{RANDOM_NONCE}'", 'https://trusted-cdn.com'],
    styleSrc: ["'self'", 'https://trusted-cdn.com'],
    imgSrc: ["'self'", 'data:', 'https://trusted-cdn.com'],
    connectSrc: ["'self'", 'https://api.example.com']
  }
}));
```

### Nonce-Based Script Execution
```html
<!-- Server generates a unique nonce for each request -->
<script nonce="{RANDOM_NONCE}">/* Safe inline script */</script>
```

### Report-Only Mode
Use during development to monitor violations without breaking functionality:
```
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-violation-report
```

## 4. Forms & Authentication

### Critical Measures
- Use HTTPS with HSTS
- Validate inputs on both client and server
- Rate-limit login attempts, use CAPTCHA
- Never store sensitive data in localStorage/sessionStorage
- Implement Multi-Factor Authentication (MFA)

### Password Policy Best Practices
- Minimum length of 12 characters
- Encourage passphrases over complex passwords
- Check against common password lists
- Use adaptive hashing algorithms (bcrypt, Argon2) on server

### Implementation Examples

```javascript
// Client-side password validation
function validatePassword(password) {
  const minLength = 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return (
    password.length >= minLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumbers &&
    hasSpecialChars
  );
}
```

### Secure Password Reset Flow
- Use time-limited, single-use tokens
- Send reset links to verified email addresses
- Verify current password before allowing changes
- Notify users of password changes

### OAuth/OIDC Best Practices
- Validate state parameter to prevent CSRF
- Use PKCE (Proof Key for Code Exchange) for mobile/SPA apps
- Validate token signature and expiration
- Use secure redirect URIs

## 5. Data Privacy

### Critical Measures
- Prefer HttpOnly cookies over localStorage
- Encrypt data stored on the client
- Clear sensitive data on logout
- Implement proper GDPR/CCPA compliance measures

### Implementation Examples

```javascript
// Client-side encryption example (CryptoJS)
import CryptoJS from 'crypto-js';

// Encrypt
function encryptData(data, secretKey) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
}

// Decrypt
function decryptData(encryptedData, secretKey) {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

// Usage
const sensitiveData = { userId: 123, preferences: { theme: 'dark' } };
const encrypted = encryptData(sensitiveData, 'user-specific-key');
localStorage.setItem('encryptedData', encrypted);
```

### Data Minimization
- Only collect necessary data
- Implement proper data retention policies
- Provide clear privacy policies and consent mechanisms

## 6. Clickjacking Protection

### Critical Measures
- Use `X-Frame-Options: DENY` or CSP `frame-ancestors 'none'`
- Implement frame-busting JavaScript as a fallback

### Implementation Examples

```html
<!-- Meta tag implementation -->
<meta http-equiv="X-Frame-Options" content="DENY">
```

```javascript
// Server-side implementation (Node.js/Express)
app.use(helmet.frameguard({ action: 'deny' }));
```

```javascript
// Frame-busting JavaScript (fallback)
if (window !== window.top) {
  window.top.location = window.location;
}
```

## 7. Third-Party Libraries

### Critical Measures
- Run `npm audit`, `snyk`, or `OWASP` scanners
- Lock dependency versions
- Use trusted and actively maintained libraries
- Implement a vulnerability management process

### Implementation Examples

```json
// package.json with locked versions
{
  "dependencies": {
    "react": "17.0.2",
    "lodash": "4.17.21"
  },
  "scripts": {
    "audit": "npm audit --production",
    "security-scan": "snyk test"
  }
}
```

```javascript
// Using import maps for browser-based dependency pinning
<script type="importmap">
{
  "imports": {
    "lodash": "https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"
  }
}
</script>
```

## 8. Secure Cookies

### Critical Measures
- Set `Secure` and `HttpOnly` flags
- Use specific `Path` and `Domain` attributes
- Implement `SameSite=Strict` as default (fallback to Lax)
- Use cookie prefixing (`__Host-` or `__Secure-`)

### Implementation Examples

```javascript
// Server-side cookie setting (Node.js/Express)
res.cookie('__Host-sessionId', sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/',
  // No domain attribute for __Host- prefix
  maxAge: 3600000 // 1 hour
});
```

```javascript
// Cookie with SameSite=Lax as fallback for compatibility
res.cookie('__Secure-sessionId', sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
  domain: 'example.com',
  maxAge: 3600000 // 1 hour
});
```

### Browser Compatibility
- For older browsers without SameSite support, implement additional CSRF protections
- Test cookie behavior across different browsers
- Consider cookie partitioning impacts in newer browsers

## 9. Session Management

### Critical Measures
- Auto-expire inactive sessions
- Invalidate tokens and clear storage on logout
- Implement secure session rotation after authentication
- Use secure session IDs (high entropy)

### Implementation Examples

```javascript
// Client-side session timeout handling
let sessionTimeout;

function resetSessionTimeout() {
  clearTimeout(sessionTimeout);
  sessionTimeout = setTimeout(() => {
    // Session expired
    logout();
    showMessage('Your session has expired due to inactivity');
  }, 30 * 60 * 1000); // 30 minutes
}

// Reset timeout on user activity
['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
  document.addEventListener(event, resetSessionTimeout);
});

// Initialize timeout
resetSessionTimeout();
```

```javascript
// Secure logout function
function logout() {
  // Clear session cookies
  document.cookie = '__Host-sessionId=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; secure; httponly; samesite=strict';
  
  // Clear any localStorage/sessionStorage
  localStorage.clear();
  sessionStorage.clear();
  
  // Redirect to login page
  window.location.href = '/login';
}
```

## 10. Security Headers

### Critical Measures
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security`
- `Referrer-Policy`
- `Permissions-Policy`
- `X-XSS-Protection` (for older browsers)
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Embedder-Policy`

### Implementation Examples

```javascript
// Server-side implementation (Node.js/Express with Helmet)
const helmet = require('helmet');
app.use(helmet());

// Or configure headers individually
app.use(helmet.contentTypeOptions());
app.use(helmet.hsts({ maxAge: 15552000, includeSubDomains: true }));
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.xssFilter());
```

```html
<!-- Meta tag implementation -->
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains">
<meta http-equiv="Referrer-Policy" content="same-origin">
<meta http-equiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=()">
```

### Complete Security Headers Example
```
Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted-cdn.com; style-src 'self' https://trusted-cdn.com; img-src 'self' data: https://trusted-cdn.com; connect-src 'self' https://api.example.com
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Referrer-Policy: same-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
X-Frame-Options: DENY
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

## 11. Subresource Integrity (SRI)

### Critical Measures
- Add integrity hashes to external scripts and stylesheets
- Generate hashes for all third-party resources
- Update hashes when resources change

### Implementation Examples

```html
<!-- Script with SRI hash -->
<script src="https://cdn.example.com/library.js" 
        integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC" 
        crossorigin="anonymous"></script>

<!-- Stylesheet with SRI hash -->
<link rel="stylesheet" href="https://cdn.example.com/styles.css" 
      integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC" 
      crossorigin="anonymous">
```

### Generating SRI Hashes
```bash
shasum -b -a 384 library.js | awk '{ print $1 }' | xxd -r -p | base64
```

Or use online tools like [SRI Hash Generator](https://www.srihash.org/)

## 12. API Security

### Critical Measures
- Use proper authentication for all API requests
- Implement rate limiting and throttling
- Validate and sanitize all API inputs
- Use HTTPS for all API communications

### Implementation Examples

```javascript
// Secure fetch with credentials and CSRF token
async function secureApiCall(url, method, data) {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  
  const response = await fetch(url, {
    method: method,
    credentials: 'include', // Send cookies
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    },
    body: data ? JSON.stringify(data) : undefined
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}
```

### JWT Security Best Practices
- Use short expiration times
- Implement token refresh mechanisms
- Store tokens securely (HttpOnly cookies)
- Validate token signature and claims

## 13. WebSocket Security

### Critical Measures
- Use secure WebSocket connections (wss://)
- Implement proper authentication
- Validate and sanitize all messages
- Protect against CSRF attacks

### Implementation Examples

```javascript
// Secure WebSocket connection with authentication token
function connectWebSocket(authToken) {
  const socket = new WebSocket(`wss://api.example.com/ws?token=${authToken}`);
  
  socket.addEventListener('message', (event) => {
    // Sanitize received data before processing
    const sanitizedData = sanitizeWebSocketData(JSON.parse(event.data));
    processWebSocketMessage(sanitizedData);
  });
  
  socket.addEventListener('open', () => {
    console.log('WebSocket connection established');
  });
  
  socket.addEventListener('error', (error) => {
    console.error('WebSocket error:', error);
  });
  
  return socket;
}

function sanitizeWebSocketData(data) {
  // Implement appropriate sanitization based on expected data structure
  // This is a simplified example
  if (typeof data !== 'object' || data === null) {
    return {};
  }
  
  // Whitelist approach - only allow known properties
  const sanitized = {};
  const allowedProps = ['id', 'type', 'content', 'timestamp'];
  
  for (const prop of allowedProps) {
    if (data[prop] !== undefined) {
      sanitized[prop] = data[prop];
    }
  }
  
  return sanitized;
}
```

## 14. Security Testing

### Critical Measures
- Implement automated security testing
- Perform regular penetration testing
- Use security linters and scanners
- Conduct code reviews with security focus

### Implementation Examples

```javascript
// package.json security testing scripts
{
  "scripts": {
    "test:security": "npm run test:xss && npm run test:csrf && npm run audit",
    "test:xss": "jest --testPathPattern=xss",
    "test:csrf": "jest --testPathPattern=csrf",
    "audit": "npm audit --production",
    "lint:security": "eslint --plugin security --ext .js src/"
  },
  "devDependencies": {
    "eslint-plugin-security": "^1.4.0",
    "jest": "^27.0.0"
  }
}
```

### Security Testing Tools
- OWASP ZAP for automated scanning
- Burp Suite for penetration testing
- ESLint with security plugins
- Lighthouse for security audits

## 15. CI/CD Security Integration

### Critical Measures
- Integrate security testing into CI/CD pipelines
- Block deployments on security issues
- Scan dependencies for vulnerabilities
- Implement security gates

### Implementation Examples

```yaml
# GitHub Actions workflow with security checks
name: Security Checks

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci
      - name: Run security audit
        run: npm audit --audit-level=high
      - name: Run security linting
        run: npm run lint:security
      - name: Run OWASP ZAP scan
        uses: zaproxy/action-baseline@v0.6.1
        with:
          target: 'https://staging.example.com'
```

## Implementation Checklist

### Priority 1 (Critical)
- [ ] Enable HTTPS with HSTS
- [ ] Implement Content Security Policy
- [ ] Set secure cookie attributes
- [ ] Sanitize all user input
- [ ] Implement proper authentication with MFA
- [ ] Use security headers

### Priority 2 (High)
- [ ] Implement CSRF protection
- [ ] Use Subresource Integrity for external resources
- [ ] Secure API communications
- [ ] Implement proper session management
- [ ] Scan dependencies for vulnerabilities

### Priority 3 (Medium)
- [ ] Implement clickjacking protection
- [ ] Secure WebSocket connections
- [ ] Implement proper error handling
- [ ] Add security testing to CI/CD
- [ ] Use secure iframe configurations

---

## Purpose
This file is optimized for automated tools and AI models that:
- Review frontend codebases
- Recommend security enhancements
- Generate compliant UI templates

Security is a moving target. Review often, automate what you can, and stay one step ahead.

## Last Updated
2025-04-05
