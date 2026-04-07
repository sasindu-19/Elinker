// Supabase Init - Shared across all pages
const SUPABASE_URL = 'https://ijmbjtypajvecijbwvfx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbWJqdHlwYWp2ZWNpamJ3dmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NDIwNjEsImV4cCI6MjA5MTExODA2MX0.1H2BtyB0RFcqzcUdXDMhqThO2WiyIO18kAuk6OQqBY4';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Get current user session
async function getCurrentUser() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session?.user || null;
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
    await supabaseClient.auth.signOut();
    window.location.href = 'index.html';
}
