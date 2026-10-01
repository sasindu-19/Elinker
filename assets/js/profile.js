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

    // Hero section avatar & edit modal avatar preview
    const bigAvatar = document.getElementById('big-avatar');
    const editModalAvatar = document.getElementById('edit-modal-avatar-preview');
    const avatarUrl = profile?.avatar_url;

    if (avatarUrl) {
        const imgHtml = `<img src="${avatarUrl}" alt="${sanitizeHtml(name)}" onerror="this.onerror=null; this.parentElement.textContent='${initials}';">`;
        if (bigAvatar) bigAvatar.innerHTML = imgHtml;
        if (editModalAvatar) editModalAvatar.innerHTML = imgHtml;
    } else {
        if (bigAvatar) bigAvatar.textContent = initials;
        if (editModalAvatar) editModalAvatar.textContent = initials;
    }

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
document.addEventListener('keydown', e => { 
    if (e.key === 'Escape') {
        cancelEdit();
        closeAvatarModal();
    } 
});

// ─── PROFILE PICTURE (DP) FUNCTIONS ───
let pendingAvatarData = null;

function openAvatarModal() {
    pendingAvatarData = null;
    const modal = document.getElementById('dp-modal');
    if (!modal) return;
    
    const previewCircle = document.getElementById('dp-preview-circle');
    const removeBtn = document.getElementById('remove-dp-btn');
    const fileInput = document.getElementById('dp-file-input');

    if (fileInput) fileInput.value = '';

    const name = currentProfile?.full_name || currentUser?.email?.split('@')[0] || 'U';
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const currentAvatar = currentProfile?.avatar_url;

    if (currentAvatar) {
        if (previewCircle) previewCircle.innerHTML = `<img src="${currentAvatar}" alt="Avatar">`;
        if (removeBtn) removeBtn.style.display = 'inline-flex';
    } else {
        if (previewCircle) previewCircle.innerHTML = `<span id="dp-preview-initials">${initials}</span>`;
        if (removeBtn) removeBtn.style.display = 'none';
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAvatarModal() {
    pendingAvatarData = null;
    const modal = document.getElementById('dp-modal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
}

function handleDpModalOverlayClick(e) {
    if (e.target === document.getElementById('dp-modal')) closeAvatarModal();
}

async function handleDpFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file (PNG, JPG, WEBP).', 'error');
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        showToast('Image file size should be less than 10MB.', 'error');
        return;
    }

    try {
        const compressedDataUrl = await compressAndResizeImage(file, 400, 400, 0.85);
        pendingAvatarData = compressedDataUrl;

        const previewCircle = document.getElementById('dp-preview-circle');
        if (previewCircle) previewCircle.innerHTML = `<img src="${compressedDataUrl}" alt="Preview">`;
        const removeBtn = document.getElementById('remove-dp-btn');
        if (removeBtn) removeBtn.style.display = 'inline-flex';
    } catch (err) {
        console.error('Image processing error:', err);
        showToast('Failed to process image file.', 'error');
    }
}

function compressAndResizeImage(file, maxWidth = 400, maxHeight = 400, quality = 0.85) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

async function uploadAvatarToSupabaseOrFallback(dataUrl, userId) {
    if (!dataUrl) return null;
    if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
        return dataUrl;
    }

    try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        // Fixed path per user so space is never wasted with duplicate files
        const filePath = `${userId}/avatar.jpg`;

        const { data, error } = await supabaseClient
            .storage
            .from('avatars')
            .upload(filePath, blob, { contentType: 'image/jpeg', upsert: true });

        if (!error && data) {
            const { data: publicUrlData } = supabaseClient
                .storage
                .from('avatars')
                .getPublicUrl(filePath);

            if (publicUrlData?.publicUrl) {
                // Add timestamp parameter to ensure browser reloads fresh image
                return `${publicUrlData.publicUrl}?t=${Date.now()}`;
            }
        }
    } catch (e) {
        console.warn('Supabase storage fallback to data URL:', e);
    }

    return dataUrl;
}

async function saveProfilePicture() {
    if (!currentUser) return;
    const saveBtn = document.getElementById('save-dp-btn');
    const originalContent = saveBtn.innerHTML;
    saveBtn.innerHTML = `<span class="spinner"></span> Saving...`;
    saveBtn.disabled = true;

    try {
        let finalAvatarUrl = currentProfile?.avatar_url || null;
        if (pendingAvatarData) {
            finalAvatarUrl = await uploadAvatarToSupabaseOrFallback(pendingAvatarData, currentUser.id);
        }

        const { error } = await supabaseClient
            .from('profiles')
            .update({ avatar_url: finalAvatarUrl })
            .eq('id', currentUser.id);

        if (error) throw error;

        currentProfile.avatar_url = finalAvatarUrl;
        populateUI(currentUser, currentProfile);
        closeAvatarModal();
        showToast('Profile picture updated successfully!', 'success');
    } catch (err) {
        console.error('Error saving profile picture:', err);
        showToast('Failed to update profile picture. Try again.', 'error');
    } finally {
        saveBtn.innerHTML = originalContent;
        saveBtn.disabled = false;
    }
}

async function removeProfilePicture() {
    if (!currentUser) return;
    const removeBtn = document.getElementById('remove-dp-btn');
    const originalContent = removeBtn.innerHTML;
    removeBtn.innerHTML = `<span class="spinner"></span> Removing...`;
    removeBtn.disabled = true;

    try {
        // Delete avatar image file from Supabase Storage so space is freed up
        try {
            const filePath = `${currentUser.id}/avatar.jpg`;
            await supabaseClient.storage.from('avatars').remove([filePath]);

            // If profile avatar_url contains an older timestamped file path, delete that too
            if (currentProfile?.avatar_url && currentProfile.avatar_url.includes('/avatars/')) {
                const parts = currentProfile.avatar_url.split('/avatars/');
                if (parts[1]) {
                    const cleanPath = parts[1].split('?')[0];
                    await supabaseClient.storage.from('avatars').remove([cleanPath]);
                }
            }
        } catch (storageErr) {
            console.warn('Storage file deletion warning:', storageErr);
        }

        const { error } = await supabaseClient
            .from('profiles')
            .update({ avatar_url: null })
            .eq('id', currentUser.id);

        if (error) throw error;

        currentProfile.avatar_url = null;
        pendingAvatarData = null;
        populateUI(currentUser, currentProfile);
        closeAvatarModal();
        showToast('Profile picture removed.', 'success');
    } catch (err) {
        console.error('Error removing profile picture:', err);
        showToast('Failed to remove profile picture.', 'error');
    } finally {
        removeBtn.innerHTML = originalContent;
        removeBtn.disabled = false;
    }
}

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

function parseJobDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) return null;
    let normalizedTime = timeStr.trim();
    const match12 = normalizedTime.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i);
    if (match12) {
        let hrs = parseInt(match12[1], 10);
        const mins = match12[2];
        const secs = match12[3] || '00';
        const ampm = match12[4].toUpperCase();
        if (ampm === 'PM' && hrs < 12) hrs += 12;
        if (ampm === 'AM' && hrs === 12) hrs = 0;
        normalizedTime = `${String(hrs).padStart(2, '0')}:${mins}:${secs}`;
    } else if (normalizedTime.length === 5) {
        normalizedTime += ':00';
    }
    const d = new Date(`${dateStr}T${normalizedTime}`);
    return isNaN(d.getTime()) ? null : d;
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
        
        container.innerHTML = jobs.map(job => {
            const endObj = parseJobDateTime(job.end_date, job.end_time);
            const startObj = parseJobDateTime(job.start_date, job.start_time);
            const now = new Date();
            const isExpired = (endObj && now >= endObj) || (startObj && now >= startObj);
            const statusLabel = isExpired ? 'Expired' : (job.status === 'open' ? 'Open' : 'Closed');
            const statusClass = isExpired ? 'expired' : job.status;
            const canToggle = !isExpired;

            return `
            <div class="my-job-card ${isExpired ? 'expired' : ''}" id="mj-${job.id}">
                <div class="mj-header">
                    <div class="mj-title">${sanitizeHtml(job.title)}</div>
                    <div class="mj-status ${statusClass}">${statusLabel}</div>
                </div>
                <div class="mj-info"><i class='bx bx-map'></i> ${job.work_mode === 'online' ? 'Online / Remote' : `${sanitizeHtml(job.city || '')}, ${sanitizeHtml(job.district || '')}`}</div>
                <div class="mj-info"><i class='bx bx-money'></i> Rs. ${job.daily_pay || job.budget || 0} / day</div>
                <div class="mj-info"><i class='bx bx-time'></i> ${new Date(job.created_at).toLocaleDateString()}</div>
                <div class="mj-footer" style="flex-wrap:wrap;">
                    ${canToggle ? `
                    <button class="mj-btn mj-btn-toggle" onclick="toggleJobStatus('${job.id}', '${job.status}')">
                        <i class='bx ${job.status === 'open' ? 'bx-lock-alt' : 'bx-lock-open-alt'}'></i> ${job.status === 'open' ? 'Close' : 'Open'}
                    </button>
                    <button class="mj-btn" style="background:rgba(0, 209, 209, 0.1); color:#0ef; border:1px solid rgba(0, 209, 209, 0.2);" 
                            onclick="showSuggestionsForJob('${job.id}', '${sanitizeHtml(job.title)}', '${job.province}', '${job.district}', '${job.category}', '${job.work_mode}', '${job.target_gender}')">
                        <i class='bx bxs-zap'></i> Invite Workers
                    </button>
                    ` : `
                    <button class="mj-btn mj-btn-toggle" disabled style="opacity: 0.5; cursor: not-allowed; flex:1;">
                        <i class='bx bx-time-five'></i> Expired
                    </button>
                    `}
                    <button class="mj-btn mj-btn-delete" style="flex:none; width:45px;" onclick="confirmDeleteJob('${job.id}')" title="Delete Job">
                        <i class='bx bx-trash'></i>
                    </button>
                </div>
            </div>
            `;
        }).join('');
        
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

function sanitizeInput(str) {
  return sanitizeHtml(str);
}

// ─── SUGGESTED WORKERS LOGIC ───

async function showSuggestionsForJob(id, title, province, district, category, workMode, targetGender) {
    const overlay = document.getElementById('suggestionsOverlay');
    const list = document.getElementById('workerList');
    if (!overlay || !list) return;

    overlay.classList.add('active');
    list.innerHTML = `<div style="text-align:center; padding: 20px;"><i class='bx bx-loader-alt bx-spin' style="font-size: 2rem; color: var(--accent);"></i><p>Finding the best workers...</p></div>`;
    document.body.style.overflow = 'hidden';

    const workers = await fetchSuggestedWorkers(province, district, category, workMode, targetGender, id);
    showSuggestionsModal(workers, { id, title });
}

async function fetchSuggestedWorkers(province, district, category, workMode, targetGender, jobId) {
  try {
    const { data, error } = await supabaseClient.rpc('get_or_create_job_suggestions', {
      p_job_id: jobId,
      p_province: province || '',
      p_district: (district && district !== 'null' && district !== 'undefined') ? district : '',
      p_category: category,
      p_work_mode: workMode,
      p_target_gender: (targetGender && targetGender !== 'null' && targetGender !== 'undefined') ? targetGender : 'any'
    });

    if (error) throw error;
    
    return (data || []).map(w => ({
      ...w,
      alreadyInvited: w.already_invited
    }));
  } catch (err) {
    console.error('Error fetching workers via RPC:', err);
    return [];
  }
}

function showSuggestionsModal(workers, jobData) {
  const list = document.getElementById('workerList');
  if (!list) return;

  const closeBtn = document.getElementById('closeSuggestions');
  if (closeBtn) {
    closeBtn.onclick = () => {
      document.getElementById('suggestionsOverlay').classList.remove('active');
      document.body.style.overflow = '';
    };
  }

  if (workers.length === 0) {
      list.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--muted);">No matching workers found in this area.</div>`;
      return;
  }

  list.innerHTML = '';
  workers.forEach(worker => {
    const initials = (worker.full_name || 'W').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const skills = (worker.skills || []).slice(0, 2).join(', ');
    const avatarHtml = worker.avatar_url 
      ? `<img src="${worker.avatar_url}" alt="${sanitizeInput(worker.full_name)}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;" onerror="this.onerror=null; this.parentElement.textContent='${initials}';">` 
      : initials;
    
    const item = document.createElement('div');
    item.className = 'worker-item';
    item.innerHTML = `
      <div class="worker-info">
        <div class="worker-avatar" style="overflow:hidden; display:flex; align-items:center; justify-content:center;">${avatarHtml}</div>
        <div class="worker-details">
          <h4>${sanitizeInput(worker.full_name)}</h4>
          <div class="worker-meta">
            <span>📍 ${sanitizeInput(worker.district || worker.province || 'Sri Lanka')}</span>
            <span class="worker-skills">✨ ${sanitizeInput(skills)}</span>
          </div>
        </div>
      </div>
      <div class="worker-actions">
        <button class="invite-btn whatsapp primary-wa">
          <i class='bx bxl-whatsapp'></i> WhatsApp
        </button>
      </div>
    `;
    
    const waBtn = item.querySelector('.invite-btn.whatsapp');
    waBtn.addEventListener('click', () => handleWhatsApp(worker, jobData));
    list.appendChild(item);
  });

  document.getElementById('closeSuggestions').onclick = () => {
    document.getElementById('suggestionsOverlay').classList.remove('active');
    document.body.style.overflow = '';
  };
}

// handleInvite removed

function handleWhatsApp(worker, jobData) {
  if (!worker.phone_number) { showToast('No phone number.', 'warning'); return; }
  const phone = worker.phone_number.replace(/\D/g, '');
  const waNumber = phone.startsWith('0') ? '94' + phone.slice(1) : (phone.startsWith('94') ? phone : '94' + phone);
  const message = encodeURIComponent(`Hi ${worker.full_name}! I've just posted a job "${jobData.title}" on Elinker and I'd like to invite you!`);
  window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank').focus();
}

async function sendInviteEmail(workerEmail, workerName, jobTitle) {
  if (!workerEmail) return false;
  try {
    const EMAIL_SERVER_URL = 'https://api.elinker.lk/v1/send-invite'; 
    const response = await fetch(EMAIL_SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: workerEmail, subject: `Job Opportunity: ${jobTitle}`, workerName, jobTitle, inviteLink: `${window.location.origin}/jobs` })
    });
    return response.ok;
  } catch (err) { return false; }
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
