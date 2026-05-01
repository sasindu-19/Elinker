// Supabase Init - Shared across all pages

// Ensure session ends when browser closes, but persists across tabs
if (!document.cookie.split('; ').find(row => row.startsWith('browser_session_active='))) {
    // Browser was restarted (session cookie is gone), clear Supabase auth tokens
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
            localStorage.removeItem(key);
        }
    });
    // Set the session cookie for the current browser session
    document.cookie = 'browser_session_active=true; path=/; SameSite=Lax';
}

const SUPABASE_URL = 'https://ijmbjtypajvecijbwvfx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbWJqdHlwYWp2ZWNpamJ3dmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NDIwNjEsImV4cCI6MjA5MTExODA2MX0.1H2BtyB0RFcqzcUdXDMhqThO2WiyIO18kAuk6OQqBY4';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});

// Get current user session securely, handling OAuth redirects and initial loads
async function getCurrentUser() {
    return new Promise(async (resolve) => {
        // Safest approach for OAuth: wait for the INITIAL_SESSION or SIGNED_IN event
        let resolved = false;

        const { data: sub } = supabaseClient.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
                if (!resolved) {
                    resolved = true;
                    if (sub) sub.subscription.unsubscribe();
                    resolve(session?.user || null);
                }
            } else if (event === 'SIGNED_OUT') {
                if (!resolved) {
                    resolved = true;
                    if (sub) sub.subscription.unsubscribe();
                    resolve(null);
                }
            }
        });

        // Trigger the detection
        try {
            const { data } = await supabaseClient.auth.getSession();
            if (data?.session && !resolved) {
                resolved = true;
                if (sub) sub.subscription.unsubscribe();
                resolve(data.session.user);
            }
        } catch (e) {
            console.error('Session check error', e);
        }

        // Fallback in case events don't fire quickly
        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                if (sub) sub.subscription.unsubscribe();
                resolve(null);
            }
        }, 2500); // Max wait time for token exchange network request
    });
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
    // Decode first to prevent double-encoding
    const txt = document.createElement('textarea');
    txt.innerHTML = str;
    const decoded = txt.value;
    // Encode to ensure safety
    const div = document.createElement('div');
    div.textContent = decoded;
    return div.innerHTML;
}

// Global utility to decode HTML entities
function decodeHtml(html) {
    if (typeof html !== 'string') return html;
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}
