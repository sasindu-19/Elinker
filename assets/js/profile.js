let currentUser = null;
let currentProfile = null;

// ─── TOAST ───
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'bx-check-circle' : 'bx-error-circle';
    const color = type === 'success' ? '#22c55e' : '#ff4d6d';
    toast.innerHTML = `<i class='bx ${icon}' style="font-size:20px; color:${color};"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ─── POPULATE UI ───
function populateUI(user, profile) {
    const name = profile?.full_name || user.email.split('@')[0];
    const email = user.email;
    const phone = profile?.phone_number || '';
    const type = profile?.user_type || 'user';
    const gender = profile?.gender || '';
    const nic = profile?.nic || '';
    const dob = profile?.dob || '';
    const province = profile?.province || '';
    const district = profile?.district || '';
    const city = profile?.city || '';
    const skills = profile?.skills || [];
    const bizName = profile?.business_name || '';
    const agreed = profile?.agreed_terms;

    const displayType = type.charAt(0).toUpperCase() + type.slice(1);
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    // Hero section
    document.getElementById('big-avatar').textContent = initials;
    document.getElementById('hero-name').textContent = name;
    document.getElementById('hero-email').textContent = email;

    const badge = document.getElementById('hero-badge');
    badge.innerHTML = `<span class="user-type-badge ${type}"><i class='bx bxs-circle' style="font-size:8px;"></i> ${displayType}</span>`;

    // Personal Info
    document.getElementById('view-name').textContent = name;
    document.getElementById('view-email').textContent = email;
    setField('view-phone', phone, 'Not provided');
    setField('view-gender', gender, '—');
    setField('view-dob', dob ? formatDate(dob) : '', '—');
    setField('view-nic', nic, '—');

    // Location
    setField('view-province', province, '—');
    setField('view-district', district, '—');
    setField('view-city', city, '—');

    // Type & Terms
    document.getElementById('view-type').textContent = displayType;
    document.getElementById('view-terms').textContent = agreed ? '✅ Agreed' : '❌ Not agreed';

    // Skills (worker) or Business (client)
    const skillsContainer = document.getElementById('view-skills-container');
    const bizContainer = document.getElementById('view-business-container');

    if (type === 'worker') {
        document.getElementById('skills-card-title').textContent = 'Skills & Categories';
        if (skills.length > 0) {
            skillsContainer.innerHTML = `<div class="skills-display">${skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div>`;
        } else {
            skillsContainer.innerHTML = `<div class="field-value muted" style="margin-top:8px;">No skills added yet.</div>`;
        }
        bizContainer.style.display = 'none';
    } else {
        document.getElementById('skills-card-title').textContent = 'Business Information';
        skillsContainer.innerHTML = '';
        if (bizName) {
            bizContainer.style.display = 'block';
            setField('view-business', bizName, '—');
        } else {
            skillsContainer.innerHTML = `<div class="field-value muted" style="margin-top:8px;">No business name added.</div>`;
        }
    }

    // Stats
    const joined = new Date(profile?.created_at || user.created_at);
    const daysActive = Math.floor((Date.now() - joined.getTime()) / (1000 * 60 * 60 * 24));
    const monthStr = joined.toLocaleString('default', { month: 'short', year: 'numeric' });

    document.getElementById('stat-days').textContent = daysActive;
    document.getElementById('stat-joined').textContent = monthStr;

    const typeEmoji = { client: '💼', worker: '🔧' };
    document.getElementById('stat-type-icon').textContent = typeEmoji[type] || '👤';
    document.getElementById('stat-type-label').textContent = displayType;

    // Navigation bar restriction for worker
    if (type.toLowerCase() === 'worker') {
        const postLink = document.getElementById('post-job-link');
        if (postLink) postLink.style.display = 'none';
    } else {
        const myJobsSec = document.getElementById('my-jobs-section');
        if (myJobsSec) {
            myJobsSec.style.display = 'block';
            console.log("Client detected, fetching jobs...");
            fetchMyJobs();
        }
    }
}

// Format date nicely
function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

// Helper: set text or show muted fallback
function setField(id, value, fallback) {
    const el = document.getElementById(id);
    if (!el) return;
    if (value) {
        el.textContent = value;
        el.classList.remove('muted');
    } else {
        el.textContent = fallback;
        el.classList.add('muted');
    }
}

// ─── EDIT MODAL TOGGLE ───
function toggleEdit() {
    // Populate fields with current data
    document.getElementById('edit-name').value = currentProfile?.full_name || '';
    document.getElementById('edit-email').value = currentUser?.email || '';
    document.getElementById('edit-phone').value = currentProfile?.phone_number || '';

    // Show/hide business field
    const bizContainer = document.getElementById('edit-business-container');
    if (currentProfile?.user_type === 'client') {
        bizContainer.style.display = 'block';
        document.getElementById('edit-business').value = currentProfile?.business_name || '';
    } else {
        bizContainer.style.display = 'none';
    }

    // Populate location dropdowns
    const p = currentProfile?.province;
    const d = currentProfile?.district;
    const c = currentProfile?.city;
    if (p) {
        setTimeout(() => {
            const provEl = document.getElementById('edit-province');
            const distEl = document.getElementById('edit-district');
            const cityEl = document.getElementById('edit-city');
            provEl.value = p;
            provEl.dispatchEvent(new Event('change'));
            if (d) {
                setTimeout(() => {
                    distEl.value = d;
                    distEl.dispatchEvent(new Event('change'));
                    if (c) setTimeout(() => { cityEl.value = c; }, 50);
                }, 50);
            }
        }, 50);
    }

    // Open modal
    document.getElementById('edit-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function cancelEdit() {
    document.getElementById('edit-modal').classList.remove('active');
    document.body.style.overflow = '';
}

function handleModalOverlayClick(e) {
    if (e.target === document.getElementById('edit-modal')) cancelEdit();
}

// Close on Escape key
document.addEventListener('keydown', e => { if (e.key === 'Escape') cancelEdit(); });

// ─── SAVE PROFILE ───
async function saveProfile() {
    const btn = document.getElementById('save-btn');
    const name = document.getElementById('edit-name').value.trim();
    const phone = document.getElementById('edit-phone').value.trim();
    const province = document.getElementById('edit-province').value;
    const district = document.getElementById('edit-district').value;
    const city = document.getElementById('edit-city').value;
    const isClient = currentProfile?.user_type === 'client';
    const bizName = isClient ? document.getElementById('edit-business').value.trim() : null;

    if (!name) {
        showToast('Full name cannot be empty!', 'error');
        return;
    }
    if (phone && !/^[0-9]{10}$/.test(phone.replace(/[^0-9]/g, ''))) {
        showToast('Please enter a valid 10-digit phone number.', 'error');
        return;
    }
    if (!province || !district || !city) {
        showToast('Please complete your location details.', 'error');
        return;
    }

    btn.innerHTML = `<span class="spinner"></span> Saving...`;
    btn.disabled = true;

    try {
        let updates = { full_name: name, phone_number: phone, province, district, city };
        if (isClient) updates.business_name = bizName;

        const { error } = await supabaseClient
            .from('profiles')
            .update(updates)
            .eq('id', currentUser.id);

        if (error) throw error;

        currentProfile = { ...currentProfile, ...updates };
        populateUI(currentUser, currentProfile);
        cancelEdit();
        showToast('Profile updated successfully!', 'success');
    } catch (err) {
        console.error('Save error:', err);
        showToast('Failed to save. Try again.', 'error');
    } finally {
        btn.innerHTML = "<i class='bx bx-save'></i> Save Changes";
        btn.disabled = false;
    }
}

// ─── LOGOUT ───
async function handleLogout(btn) {
    const original = btn.innerHTML;
    btn.innerHTML = `<span class="spinner"></span> Logging out...`;
    btn.disabled = true;
    try {
        await logoutUser();
    } catch {
        btn.innerHTML = original;
        btn.disabled = false;
    }
}

// ─── FETCH USER JOBS ───
async function fetchMyJobs() {
    if (!currentUser) return;
    const container = document.getElementById('my-jobs-container');
    container.innerHTML = `<div style="text-align:center; padding: 20px;"><span class="spinner"></span> Loading jobs...</div>`;
    
    try {
        const { data: jobs, error } = await supabaseClient
            .from('jobs')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (!jobs || jobs.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding: 30px; background: var(--surface2); border-radius: 12px; color: var(--muted); border: 1px solid var(--glass-border);">You haven't posted any jobs yet.</div>`;
            return;
        }
        
        container.innerHTML = jobs.map(job => `
            <div class="my-job-card" id="mj-${job.id}">
                <div class="mj-header">
                    <div class="mj-title">${sanitizeHtml(job.title)}</div>
                    <div class="mj-status ${job.status}">${job.status === 'open' ? 'Open' : 'Closed'}</div>
                </div>
                <div class="mj-info"><i class='bx bx-map'></i> ${job.work_mode === 'online' ? 'Online / Remote' : `${sanitizeHtml(job.city || '')}, ${sanitizeHtml(job.district || '')}`}</div>
                <div class="mj-info"><i class='bx bx-money'></i> Rs. ${job.daily_pay || job.budget || 0} / day</div>
                <div class="mj-info"><i class='bx bx-time'></i> ${new Date(job.created_at).toLocaleDateString()}</div>
                <div class="mj-footer">
                    <button class="mj-btn mj-btn-toggle" onclick="toggleJobStatus('${job.id}', '${job.status}')">
                        <i class='bx ${job.status === 'open' ? 'bx-lock-alt' : 'bx-lock-open-alt'}'></i> ${job.status === 'open' ? 'Close Job' : 'Open Job'}
                    </button>
                    <button class="mj-btn mj-btn-delete" onclick="confirmDeleteJob('${job.id}')">
                        <i class='bx bx-trash'></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
        
    } catch (err) {
        console.error('Fetch jobs error:', err);
        container.innerHTML = `<div style="color:var(--danger); padding: 20px;">Error loading jobs. Please try again.</div>`;
    }
}

async function toggleJobStatus(jobId, currentStatus) {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    try {
        const { error } = await supabaseClient
            .from('jobs')
            .update({ status: newStatus })
            .eq('id', jobId);
        
        if (error) throw error;
        showToast(`Job ${newStatus === 'open' ? 'opened' : 'closed'} successfully`, 'success');
        fetchMyJobs(); // Refresh the list
    } catch (err) {
        console.error('Toggle status error:', err);
        showToast('Failed to change status', 'error');
    }
}

let jobToDelete = null;

function confirmDeleteJob(jobId) {
    jobToDelete = jobId;
    document.getElementById('delete-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
    jobToDelete = null;
    document.getElementById('delete-modal').classList.remove('active');
    document.body.style.overflow = '';
}

function handleDeleteModalOverlayClick(e) {
    if (e.target === document.getElementById('delete-modal')) closeDeleteModal();
}

document.getElementById('confirm-delete-btn')?.addEventListener('click', async function() {
    if (!jobToDelete) return;
    const btn = this;
    const originalHtml = btn.innerHTML;
    btn.innerHTML = `<span class="spinner"></span> Deleting...`;
    btn.disabled = true;

    try {
        const { error } = await supabaseClient
            .from('jobs')
            .delete()
            .eq('id', jobToDelete);
        
        if (error) throw error;
        showToast('Job deleted successfully', 'success');
        closeDeleteModal();
        fetchMyJobs(); // Refresh the list
    } catch (err) {
        console.error('Delete job error:', err);
        showToast('Failed to delete job', 'error');
    } finally {
        btn.innerHTML = originalHtml;
        btn.disabled = false;
    }
});

function sanitizeHtml(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// ─── INIT ───
(async () => {
    if (typeof initLocationDropdowns === 'function') {
        initLocationDropdowns('edit-province', 'edit-district', 'edit-city');
    }

    currentUser = await getCurrentUser();

    if (!currentUser) {
        document.getElementById('not-logged-in-state').style.display = 'flex';
        return;
    }

    currentProfile = await getUserProfile(currentUser.id);
    populateUI(currentUser, currentProfile);
    document.getElementById('profile-content').style.display = 'block';

    document.getElementById('logout-btn-danger').addEventListener('click', function () {
        handleLogout(this);
    });
    document.getElementById('logout-btn-profile').addEventListener('click', function () {
        handleLogout(this);
    });
})();
