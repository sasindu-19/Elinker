// Supabase Init - Shared across all pages
const SUPABASE_URL = 'https://ijmbjtypajvecijbwvfx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbWJqdHlwYWp2ZWNpamJ3dmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NDIwNjEsImV4cCI6MjA5MTExODA2MX0.1H2BtyB0RFcqzcUdXDMhqThO2WiyIO18kAuk6OQqBY4';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Get current user session (uses getUser() to verify token with server,
// preventing false-null on page reload / token refresh race conditions)
async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error || !user) {
            // Fallback: try refreshing the session once
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
