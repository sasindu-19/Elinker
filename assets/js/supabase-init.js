// Supabase Init - Shared across all pages
const SUPABASE_URL = 'https://ijmbjtypajvecijbwvfx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbWJqdHlwYWp2ZWNpamJ3dmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NDIwNjEsImV4cCI6MjA5MTExODA2MX0.1H2BtyB0RFcqzcUdXDMhqThO2WiyIO18kAuk6OQqBY4';
// Custom Storage using Session Cookies (persists across tabs, clears on browser close)
const sessionCookieStorage = {
    getItem: (key) => {
        const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
        return match ? decodeURIComponent(match[2]) : null;
    },
    setItem: (key, value) => {
        // No expires/max-age means it's a Session Cookie
        document.cookie = `${key}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
    },
    removeItem: (key) => {
        document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
};

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        storage: sessionCookieStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Get current user session (uses getUser() to verify token with server,
// preventing false-null on page reload / token refresh race conditions)
async function getCurrentUser() {
    try {
        // Supabase needs a fraction of a second to parse #access_token from email links
        if (window.location.hash.includes('access_token') || window.location.hash.includes('type=recovery')) {
            await new Promise(resolve => setTimeout(resolve, 800)); // Give it 800ms to settle session
        }

        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error || !user) {
            // Fallback: try refreshing
            const { data: refreshData } = await supabaseClient.auth.refreshSession();
            return refreshData?.session?.user || null;
        }
        return user;
    } catch (err) {
        console.warn('getCurrentUser error:', err);
        return null;
    }
}

// Get user profile from profiles table
async function getUserProfile(userId) {
    const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error) return null;
    return data;
}

// Logout
async function logoutUser() {
    try {
        await supabaseClient.auth.signOut();
    } catch (error) {
        console.error("Error signing out of Supabase:", error);
        // Force clear local storage if Supabase fails
        localStorage.clear();
        sessionStorage.clear();
    }
    window.location.href = 'login.html';
}

// Global Access Denied Modal
function showAccessDenied(title, message, icon, buttons) {
    const overlay = document.createElement('div');
    overlay.className = 'access-denied-overlay';

    const btnsHtml = buttons.map(b =>
        `<a href="${b.href}" class="ad-btn ${b.cls}">${b.text}</a>`
    ).join('');

    overlay.innerHTML = `
        <div class="access-denied-card">
            <div class="ad-icon"><i class='bx ${icon}'></i></div>
            <h2>${title}</h2>
            <p>${message}</p>
            <div>${btnsHtml}</div>
        </div>
    `;
    document.body.appendChild(overlay);
}

// Global utility for input sanitization to prevent XSS
function sanitizeInput(str) {
    if (typeof str !== 'string') return str;
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
