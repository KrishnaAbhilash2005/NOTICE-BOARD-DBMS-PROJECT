/**
 * Admin Panel JavaScript
 * Handles authentication and notice management for admin users
 */
class AdminPanel {
    constructor() {
        this.apiBase = '/api';
        this.token = localStorage.getItem('adminToken');
        this.currentUser = null;
        this.init();
    }

    /**
     * Initialize the admin panel
     */
    init() {
        console.log('🔧 Initializing Admin Panel...');
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Signup form
        document.getElementById('signup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        // Create notice form
        document.getElementById('create-notice-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreateNotice();
        });

        // Toggle between login and signup
        document.getElementById('show-signup').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSignup();
        });

        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLogin();
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });
    }

    /**
     * Check if user is already authenticated
     */
    checkAuthStatus() {
        if (this.token) {
            // Try to validate token by making a request
            this.validateToken();
        } else {
            this.showLogin();
        }
    }

    /**
     * Validate existing token
     */
    async validateToken() {
        try {
            const response = await fetch(`${this.apiBase}/users`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                this.showDashboard();
                this.loadNotices();
            } else {
                this.clearAuth();
                this.showLogin();
            }
        } catch (error) {
            console.error('❌ Token validation failed:', error);
            this.clearAuth();
            this.showLogin();
        }
    }

    /**
     * Show login section
     */
    showLogin() {
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('signup-section').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'none';
    }

    /**
     * Show signup section
     */
    showSignup() {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('signup-section').style.display = 'block';
        document.getElementById('admin-dashboard').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'none';
    }

    /**
     * Show admin dashboard
     */
    showDashboard() {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('signup-section').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        document.getElementById('logout-btn').style.display = 'block';
        
        // Update welcome message
        const welcomeUser = document.getElementById('welcome-user');
        if (this.currentUser) {
            welcomeUser.textContent = this.currentUser.username;
        }
    }

    /**
     * Handle user login
     */
    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            console.log('🔐 Attempting login for:', email);

            const response = await fetch(`${this.apiBase}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Login failed');
            }

            this.token = data.token;
            this.currentUser = data.user;
            
            // Store in localStorage
            localStorage.setItem('adminToken', this.token);
            localStorage.setItem('adminUser', JSON.stringify(this.currentUser));

            this.showSuccessMessage('Login successful!');
            this.showDashboard();
            this.loadNotices();

            console.log('✅ User logged in:', this.currentUser.username);

        } catch (error) {
            console.error('❌ Login error:', error);
            this.showErrorMessage(`Login failed: ${error.message}`);
        }
    }

    /**
     * Handle user signup
     */
    async handleSignup() {
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;

        try {
            console.log('📝 Attempting signup for:', email);

            const response = await fetch(`${this.apiBase}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Signup failed');
            }

            this.showSuccessMessage('Account created successfully! Please login.');
            this.showLogin();
            
            // Pre-fill email in login form
            document.getElementById('email').value = email;

            console.log('✅ User created:', data.user.username);

        } catch (error) {
            console.error('❌ Signup error:', error);
            this.showErrorMessage(`Signup failed: ${error.message}`);
        }
    }

    /**
     * Handle notice creation
     */
    async handleCreateNotice() {
        const title = document.getElementById('notice-title').value;
        const content = document.getElementById('notice-content').value;

        try {
            console.log('📝 Creating notice:', title);

            const response = await fetch(`${this.apiBase}/notices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
                },
                body: JSON.stringify({ title, content }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Failed to create notice');
            }

            this.showSuccessMessage('Notice created successfully!');
            document.getElementById('create-notice-form').reset();
            this.loadNotices();

            console.log('✅ Notice created:', data.notice.title);

        } catch (error) {
            console.error('❌ Create notice error:', error);
            this.showErrorMessage(`Failed to create notice: ${error.message}`);
        }
    }

    /**
     * Load all notices for admin management
     */
    async loadNotices() {
        const loadingEl = document.getElementById('admin-loading');
        const containerEl = document.getElementById('admin-notices-container');
        const errorEl = document.getElementById('admin-error-message');
        const errorTextEl = document.getElementById('admin-error-text');

        try {
            loadingEl.style.display = 'block';
            errorEl.style.display = 'none';
            containerEl.innerHTML = '';

            console.log('📡 Fetching notices for admin...');

            const response = await fetch(`${this.apiBase}/notices`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const notices = data.notices || [];
            
            console.log(`✅ Loaded ${notices.length} notices for admin`);

            if (notices.length === 0) {
                containerEl.innerHTML = `
                    <div class="text-center">
                        <h3>📭 No Notices</h3>
                        <p>No notices have been created yet.</p>
                        <p>Create your first notice using the form above!</p>
                    </div>
                `;
            } else {
                containerEl.innerHTML = notices.map(notice => this.createAdminNoticeItem(notice)).join('');
            }

        } catch (error) {
            console.error('❌ Error loading notices:', error);
            errorTextEl.textContent = `Failed to load notices: ${error.message}`;
            errorEl.style.display = 'block';
            containerEl.innerHTML = '';
        } finally {
            loadingEl.style.display = 'none';
        }
    }

    /**
     * Create HTML for admin notice item
     */
    createAdminNoticeItem(notice) {
        const date = new Date(notice.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="admin-notice-item">
                <div class="notice-info">
                    <div class="notice-title">${this.escapeHtml(notice.title)}</div>
                    <div class="notice-content">${this.escapeHtml(notice.content)}</div>
                    <div class="notice-meta">
                        <span class="notice-date">Created: ${date}</span>
                    </div>
                </div>
                <div class="notice-actions">
                    <button class="btn btn-danger" onclick="adminPanel.deleteNotice('${notice.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Delete a notice
     */
    async deleteNotice(noticeId) {
        if (!confirm('Are you sure you want to delete this notice? This action cannot be undone.')) {
            return;
        }

        try {
            console.log('🗑️ Deleting notice:', noticeId);

            const response = await fetch(`${this.apiBase}/notices/${noticeId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Failed to delete notice');
            }

            this.showSuccessMessage('Notice deleted successfully!');
            this.loadNotices();

            console.log('✅ Notice deleted:', noticeId);

        } catch (error) {
            console.error('❌ Delete notice error:', error);
            this.showErrorMessage(`Failed to delete notice: ${error.message}`);
        }
    }

    /**
     * Handle user logout
     */
    handleLogout() {
        this.clearAuth();
        this.showLogin();
        this.showSuccessMessage('Logged out successfully!');
        console.log('✅ User logged out');
    }

    /**
     * Clear authentication data
     */
    clearAuth() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
    }

    /**
     * Show success message
     */
    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    /**
     * Show error message
     */
    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    /**
     * Show message to user
     */
    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.success-message, .error-message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageEl = document.createElement('div');
        messageEl.className = type === 'success' ? 'success-message' : 'error-message';
        messageEl.innerHTML = `
            <h3>${type === 'success' ? '✅ Success' : '⚠️ Error'}</h3>
            <p>${message}</p>
        `;

        // Insert at the top of the main content
        const main = document.querySelector('main');
        main.insertBefore(messageEl, main.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 5000);
    }

    /**
     * Escape HTML to prevent XSS attacks
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the admin panel when the page loads
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});