/**
 * Public Notice Board JavaScript
 * Handles the display of notices on the public page
 */
class NoticeBoard {
    constructor() {
        this.apiBase = '/api';
        this.init();
    }

    /**
     * Initialize the notice board
     */
    init() {
        console.log('📢 Initializing Notice Board...');
        this.loadNotices();
    }

    /**
     * Load all notices from the API
     */
    async loadNotices() {
        const loadingEl = document.getElementById('loading');
        const containerEl = document.getElementById('notices-container');
        const errorEl = document.getElementById('error-message');
        const errorTextEl = document.getElementById('error-text');

        try {
            // Show loading state
            loadingEl.style.display = 'block';
            errorEl.style.display = 'none';
            containerEl.innerHTML = '';

            console.log('📡 Fetching notices from API...');

            const response = await fetch(`${this.apiBase}/notices`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const notices = data.notices || [];
            
            console.log(`✅ Loaded ${notices.length} notices`);

            if (notices.length === 0) {
                containerEl.innerHTML = `
                    <div class="text-center">
                        <h3>📭 No Notices Available</h3>
                        <p>There are no notices to display at the moment.</p>
                        <p>Check back later for updates!</p>
                    </div>
                `;
            } else {
                containerEl.innerHTML = notices.map(notice => this.createNoticeCard(notice)).join('');
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
     * Create HTML for a notice card
     */
    createNoticeCard(notice) {
        const date = new Date(notice.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="notice-card">
                <div class="notice-title">${this.escapeHtml(notice.title)}</div>
                <div class="notice-content">${this.escapeHtml(notice.content)}</div>
                <div class="notice-meta">
                    <span class="notice-date">Posted on ${date}</span>
                </div>
            </div>
        `;
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

// Initialize the notice board when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NoticeBoard();
});