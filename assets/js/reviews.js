// Toast Functionality
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;

    let icon = 'bx-info-circle';
    if (type === 'success') icon = 'bx-check-circle';
    if (type === 'error') icon = 'bx-x-circle';
    if (type === 'warning') icon = 'bx-error';

    toast.innerHTML = `
    <i class='bx ${icon}'></i>
    <span>${message}</span>
    <i class='bx bx-x toast-close'></i>
    `;

    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('toast-show'), 100);

    // Auto remove
    const timeout = setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 500);
    }, 4000);

    toast.querySelector('.toast-close').onclick = () => {
    clearTimeout(timeout);
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 500);
    };
}

// Review Modal Logic
const modal = document.getElementById('reviewModal');
const openBtn = document.getElementById('openPopupBtn');
const closeBtn = document.getElementById('closeModalBtn');

if (openBtn) {
    openBtn.onclick = async function () {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            showToast("Please login to leave a review.", "warning");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
            return;
        }
        modal.classList.add('show');
    }
}

if (closeBtn) {
    closeBtn.onclick = function () {
        modal.classList.remove('show');
    }
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.classList.remove('show');
    }
}

// Submit Review Logic
const reviewForm = document.getElementById('reviewForm');
if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentUser = await getCurrentUser();
        if (!currentUser) return;

        const currentUserProfile = await getUserProfile(currentUser.id);

        const rating = document.querySelector('input[name="rating"]:checked').value;
        const text = document.getElementById('reviewText').value.trim();
        const name = currentUserProfile?.full_name || currentUser.email.split('@')[0];
        const btn = e.target.querySelector('button');

        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Submitting...';
        btn.disabled = true;

        const { data, error } = await supabaseClient.from('reviews').insert([
        {
            user_id: currentUser.id,
            reviewer_name: name,
            rating: parseInt(rating),
            review_text: text
        }
        ]);

        btn.innerHTML = originalText;
        btn.disabled = false;

        if (error) {
            console.error(error);
            showToast("Failed to submit review. Please try again.", "error");
        } else {
            modal.classList.remove('show');
            document.getElementById('reviewForm').reset();
            showToast("Thank you for your review!", "success");
        }
    });
}
