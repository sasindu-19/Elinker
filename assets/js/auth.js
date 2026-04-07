// ============================================
// Toast Notification System
// ============================================
function showToast(message, type = 'info', duration = 4000) {
    // Remove existing toasts
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;

    const icons = {
        success: 'bx bxs-check-circle',
        error: 'bx bxs-error-circle',
        info: 'bx bxs-info-circle',
        warning: 'bx bxs-error'
    };

    toast.innerHTML = `
        <i class='${icons[type] || icons.info}'></i>
        <span>${message}</span>
        <i class='bx bx-x toast-close'></i>
    `;

    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('toast-show');
    });

    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 400);
    });

    // Auto dismiss
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.remove('toast-show');
            setTimeout(() => toast.remove(), 400);
        }
    }, duration);
}

// ============================================
// Email Confirmation Modal
// ============================================
function showEmailConfirmModal(email) {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
        <div class="confirm-modal">
            <div class="confirm-icon">
                <i class='bx bxs-envelope bx-tada'></i>
            </div>
            <h2>Check Your Email!</h2>
            <p>We've sent a confirmation link to</p>
            <div class="confirm-email">${email}</div>
            <p class="confirm-sub">Please click the link in the email to verify your account, then come back and login.</p>
            <button class="confirm-btn" id="confirm-ok-btn">
                <i class='bx bxs-check-circle'></i> Got it!
            </button>
        </div>
    `;
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        overlay.classList.add('confirm-show');
    });

    document.getElementById('confirm-ok-btn').addEventListener('click', () => {
        overlay.classList.remove('confirm-show');
        setTimeout(() => {
            overlay.remove();
            // Switch back to login form
            document.querySelector('.wrapper').classList.remove('active');
        }, 400);
    });
}

// ============================================
// Login Form Handler
// ============================================
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const btn = loginForm.querySelector('.btn');

        // Show loading
        btn.disabled = true;
        btn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Logging in...';

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            btn.disabled = false;
            btn.textContent = 'Login';

            if (error.message.includes('Email not confirmed')) {
                showToast('Please confirm your email first! Check your inbox.', 'warning', 5000);
            } else if (error.message.includes('Invalid login credentials')) {
                showToast('Wrong email or password. Please try again.', 'error');
            } else {
                showToast(error.message, 'error');
            }
        } else {
            showToast('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1200);
        }
    });
}

// ============================================
// Register Form Handler & Validations
// ============================================
const registerForm = document.getElementById('register-form');
if (registerForm) {
    const regEmail = document.getElementById('reg-email');
    const emailError = document.getElementById('email-exists-error');
    const emailLoader = document.getElementById('email-check-loader');
    
    const regPassword = document.getElementById('reg-password');
    const confirmPassword = document.getElementById('reg-confirm-password');
    const matchError = document.getElementById('password-match-error');

    let emailIsValid = true;

    // Realtime Password Match Validation
    function checkPasswords() {
        if (confirmPassword.value && regPassword.value !== confirmPassword.value) {
            matchError.style.display = 'block';
            return false;
        } else {
            matchError.style.display = 'none';
            return true;
        }
    }
    regPassword.addEventListener('keyup', checkPasswords);
    confirmPassword.addEventListener('keyup', checkPasswords);

    // Realtime Email Validation (Debounced)
    let emailCheckTimeout;
    regEmail.addEventListener('keyup', () => {
        clearTimeout(emailCheckTimeout);
        emailError.style.display = 'none';
        
        const val = regEmail.value.trim();
        if (!val || !val.includes('@')) {
            emailLoader.style.display = 'none';
            emailIsValid = false;
            return;
        }
        
        emailLoader.style.display = 'block';
        emailCheckTimeout = setTimeout(async () => {
            // Call our RPC function
            const { data: exists, error } = await supabaseClient.rpc('check_email_exists', { lookup_email: val });
            emailLoader.style.display = 'none';
            
            if (!error && exists) {
                emailError.style.display = 'block';
                emailIsValid = false;
            } else {
                emailIsValid = true;
            }
        }, 600); // 600ms debounce
    });

    // Form Submit
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!checkPasswords()) {
            showToast('Passwords do not match.', 'error');
            return;
        }

        if (!emailIsValid) {
            showToast('Please fix the email issue before continuing.', 'error');
            return;
        }

        const fullName = document.getElementById('reg-name').value;
        const phone = document.getElementById('reg-phone').value;
        const type = document.getElementById('reg-type').value;
        const email = regEmail.value;
        const password = regPassword.value;

        if (!type) {
            showToast('Please select a user type (Client or Worker)', 'warning');
            return;
        }

        const btn = registerForm.querySelector('.btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Creating account...';

        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    phone_number: phone,
                    user_type: type
                }
            }
        });

        btn.disabled = false;
        btn.textContent = 'Sign Up';

        if (error) {
            if (error.message.includes('rate limit') || error.message.includes('Rate limit')) {
                showToast('Too many attempts! Please wait a few minutes and try again.', 'warning', 6000);
            } else if (error.message.includes('User already registered')) {
                emailError.style.display = 'block';
                showToast('This email is already in use.', 'error');
            } else {
                showToast(error.message, 'error');
            }
        } else if (data?.session) {
            // Email confirmation is OFF — user is auto-logged in
            showToast('Account created successfully! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1200);
        } else {
            // Email confirmation is ON — show check-email modal
            registerForm.reset();
            showEmailConfirmModal(email);
        }
    });
}

// ============================================
// Forgot Password / Reset Flow
// ============================================
const forgotLink = document.getElementById('forgot-password-link');
const forgotOverlay = document.getElementById('forgot-password-overlay');
const closeForgotBtn = document.getElementById('close-forgot-btn');
const sendResetBtn = document.getElementById('send-reset-link-btn');

if (forgotLink && forgotOverlay) {
    forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        forgotOverlay.style.display = 'flex';
        requestAnimationFrame(() => forgotOverlay.classList.add('confirm-show'));
    });

    closeForgotBtn.addEventListener('click', () => {
        forgotOverlay.classList.remove('confirm-show');
        setTimeout(() => forgotOverlay.style.display = 'none', 400);
    });

    sendResetBtn.addEventListener('click', async () => {
        const email = document.getElementById('forgot-email').value;
        if (!email) {
            showToast('Please enter your email', 'warning');
            return;
        }

        sendResetBtn.disabled = true;
        sendResetBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Sending...';

        const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + window.location.pathname,
        });

        sendResetBtn.disabled = false;
        sendResetBtn.textContent = 'Send Reset Link';

        if (error) {
            if (error.message.includes('rate limit') || error.message.includes('Rate limit')) {
                showToast('Too many requests! Supabase free limit reached. Please wait an hour or configure Custom SMTP.', 'warning', 7000);
            } else {
                showToast(error.message, 'error');
            }
        } else {
            showToast('Reset link sent to your email!', 'success');
            closeForgotBtn.click();
        }
    });
}

// Handle Password Recovery Hash on Load
window.addEventListener('DOMContentLoaded', () => {
    // Supabase appends #access_token=...&type=recovery when clicking reset link
    if (window.location.hash.includes('type=recovery')) {
        const resetModal = document.getElementById('reset-password-modal');
        if (resetModal) {
            // Switch back to login form view first
            document.querySelector('.wrapper').classList.remove('active');
            
            resetModal.style.display = 'flex';
            requestAnimationFrame(() => resetModal.classList.add('confirm-show'));

            const submitNewPasswordBtn = document.getElementById('submit-new-password-btn');
            submitNewPasswordBtn.addEventListener('click', async () => {
                const newPassword = document.getElementById('new-password').value;
                if (!newPassword || newPassword.length < 6) {
                    showToast('Password must be at least 6 characters', 'warning');
                    return;
                }

                submitNewPasswordBtn.disabled = true;
                submitNewPasswordBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Updating...';

                // We are authenticated via the hash params, we can just update the user
                const { error } = await supabaseClient.auth.updateUser({
                    password: newPassword
                });

                submitNewPasswordBtn.disabled = false;
                submitNewPasswordBtn.textContent = 'Update Password';

                if (error) {
                    showToast(error.message, 'error');
                } else {
                    showToast('Password updated successfully! You can now login.', 'success');
                    resetModal.classList.remove('confirm-show');
                    setTimeout(() => resetModal.style.display = 'none', 400);
                    // Clear the hash so it doesn't trigger again
                    window.history.replaceState(null, document.title, window.location.pathname);
                }
            });
        }
    }
});
