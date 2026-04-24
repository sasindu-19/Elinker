// ============================================================
// jobs.js  –  Find Work page logic
// Loads jobs from Supabase, filters by user profile & UI filters
// Realtime: new/updated/deleted jobs auto-refresh the grid
// ============================================================

// ── Module-level state ───────────────────────────────────────
let allJobs     = [];
let currentProfile = null;
let realtimeChannel = null;

// ============================================================
// MAIN INIT  (auth → profile → load → realtime)
// ============================================================
(async () => {
  // ── 1. Auth check ────────────────────────────────────────
  const user = await getCurrentUser();

  if (!user) {
    showAccessDenied(
      'Login Required',
      'You need to login first to find work. Create an account or login to continue.',
      'bxs-lock-alt',
      [
        { text: 'Login Now', href: 'login.html', cls: 'primary' },
        { text: 'Go Home',   href: 'index.html', cls: 'secondary' }
      ]
    );
    return;
  }

  // ── 2. Profile completeness check ────────────────────────
  const profile = await getUserProfile(user.id);
  if (profile && (!profile.gender || !profile.dob)) {
    window.location.href = 'signup.html';
    return;
  }

  currentProfile = profile;
  document.getElementById('page-content').style.display = '';

  // Hide Post a Job for workers
  if (profile && profile.user_type && profile.user_type.toLowerCase() === 'worker') {
    const postFooter = document.getElementById('post-job-link-footer');
    if (postFooter) postFooter.style.display = 'none';
  }

  // ── 3. Populate profile card ─────────────────────────────
  if (profile) {
    const nameParts = (profile.full_name || '').trim().split(/\s+/);
    const initials  = nameParts.map(w => w[0] || '').join('').toUpperCase().slice(0, 2) || 'U';

    const dob = profile.dob ? new Date(profile.dob) : null;
    const age = dob
      ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : null;

    const location    = [profile.city, profile.district].filter(Boolean).join(', ');
    const genderLabel = profile.gender
      ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1).toLowerCase()
      : '';

    document.getElementById('profile-initials').textContent = initials;
    document.getElementById('profile-name').textContent     = profile.full_name || 'Worker';
    document.getElementById('profile-meta').textContent     =
      [location, age !== null ? `Age ${age}` : '', genderLabel].filter(Boolean).join(' · ');

    document.getElementById('badge-gender').textContent = genderLabel || '—';
    document.getElementById('badge-age').textContent    = age !== null ? `${age} yrs` : '—';
  }

  // ── 4. Initial fetch ─────────────────────────────────────
  await fetchAndRender();

  // ── 5. Filter listeners ───────────────────────────────────
  ['filter-district', 'filter-difficulty', 'filter-gender'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', applyFilters);
  });
  document.getElementById('filter-search')?.addEventListener('input', applyFilters);

  // ── 6. Subscribe to Realtime ──────────────────────────────
  subscribeRealtime();

})();


// ============================================================
// FETCH  all open jobs from Supabase
// ============================================================
async function fetchAndRender() {
  const { data: jobs, error } = await supabaseClient
    .from('jobs')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to load jobs:', error);
    renderEmpty('Failed to load jobs. Please refresh the page.');
    return;
  }

  allJobs = jobs || [];
  populateDistrictFilter(allJobs);
  applyFilters();  // render with current filter state
}


// ============================================================
// SUPABASE REALTIME SUBSCRIPTION
// ============================================================
function subscribeRealtime() {
  // Remove any previous subscription to avoid duplicates
  if (realtimeChannel) {
    supabaseClient.removeChannel(realtimeChannel);
  }

  realtimeChannel = supabaseClient
    .channel('jobs-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'jobs' },
      handleRealtimeEvent
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('[Realtime] Connected to jobs channel ✓');
      }
      if (status === 'CHANNEL_ERROR') {
        console.warn('[Realtime] Channel error — will retry');
      }
    });
}

// ── Handle incoming realtime event ────────────────────────────
async function handleRealtimeEvent(payload) {
  const { eventType, new: newRow, old: oldRow } = payload;

  if (eventType === 'INSERT') {
    // Only add if status is open
    if (newRow.status === 'open') {
      allJobs.unshift(newRow);          // newest first
      populateDistrictFilter(allJobs);
      applyFilters();
      showRealtimeToast('New job posted!', 'bx-bell');
    }

  } else if (eventType === 'UPDATE') {
    const idx = allJobs.findIndex(j => j.id === newRow.id);

    if (newRow.status !== 'open') {
      // Job closed/filled → remove from list
      if (idx !== -1) {
        allJobs.splice(idx, 1);
        applyFilters();
        showRealtimeToast('A job listing was updated.', 'bx-refresh');
      }
    } else {
      // Update existing entry
      if (idx !== -1) {
        allJobs[idx] = newRow;
      } else {
        allJobs.unshift(newRow);
      }
      populateDistrictFilter(allJobs);
      applyFilters();
      showRealtimeToast('A job listing was updated.', 'bx-refresh');
    }

  } else if (eventType === 'DELETE') {
    const idx = allJobs.findIndex(j => j.id === oldRow.id);
    if (idx !== -1) {
      allJobs.splice(idx, 1);
      populateDistrictFilter(allJobs);
      applyFilters();
    }
  }
}

// ── Live update toast (non-intrusive) ─────────────────────────
function showRealtimeToast(message, iconClass = 'bx-bell') {
  const existing = document.getElementById('rt-toast');
  if (existing) existing.remove();   // debounce — only one at a time

  const toast = document.createElement('div');
  toast.id = 'rt-toast';
  toast.className = 'toast-notification toast-info';
  toast.innerHTML = `
    <i class="bx ${iconClass}"></i>
    <span>${message}</span>
    <i class="bx bx-x toast-close"></i>
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('toast-show')));
  const dismiss = () => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 500);
  };
  toast.querySelector('.toast-close').addEventListener('click', dismiss);
  setTimeout(dismiss, 4000);
}


// ============================================================
// FILTER
// ============================================================
function applyFilters() {
  const district   = document.getElementById('filter-district')?.value  || '';
  const difficulty = document.getElementById('filter-difficulty')?.value || '';
  const gender     = document.getElementById('filter-gender')?.value     || '';
  const search     = (document.getElementById('filter-search')?.value || '').trim().toLowerCase();

  const filtered = allJobs.filter(job => {
    if (district   && job.district   !== district)   return false;
    if (difficulty && job.difficulty !== difficulty)  return false;
    if (gender) {
      const jg = (job.target_gender || '').toLowerCase();
      if (jg !== 'any' && jg !== gender)             return false;
    }
    if (search) {
      const hay = `${job.title} ${job.city} ${job.district} ${job.description || ''}`.toLowerCase();
      if (!hay.includes(search))                     return false;
    }
    return true;
  });

  renderJobs(filtered, currentProfile);
}


// ============================================================
// DISTRICT FILTER POPULATION
// ============================================================
function populateDistrictFilter(jobs) {
  const districts = [...new Set(jobs.map(j => j.district).filter(Boolean))].sort();
  const sel = document.getElementById('filter-district');
  if (!sel) return;

  const currentVal = sel.value;
  while (sel.options.length > 1) sel.remove(1);
  districts.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    sel.appendChild(opt);
  });
  // Restore previously selected value if still available
  if (currentVal && districts.includes(currentVal)) sel.value = currentVal;
}


// ============================================================
// RENDER
// ============================================================
function renderJobs(jobs, profile) {
  const grid    = document.getElementById('jobs-grid');
  const countEl = document.getElementById('jobs-count');

  if (!jobs.length) {
    renderEmpty('No jobs match your current filters. Try adjusting the filters above.');
    countEl.innerHTML = '<span>0</span> jobs found';
    return;
  }

  countEl.innerHTML = `<span>${jobs.length}</span> job${jobs.length !== 1 ? 's' : ''} found`;
  grid.innerHTML    = jobs.map(job => buildJobCard(job, profile)).join('');
}

function renderEmpty(msg) {
  document.getElementById('jobs-grid').innerHTML = `
    <div class="empty-state">
      <i class='bx bx-briefcase-alt-2'></i>
      <h3>No Jobs Found</h3>
      <p>${sanitizeInput(msg)}</p>
    </div>`;
}


// ============================================================
// JOB CARD BUILDER
// ============================================================
function buildJobCard(job, profile) {
  const reasons  = getIneligibilityReasons(job, profile);
  const eligible = reasons.length === 0;

  // Poster badge
  const bizName    = job.business_name || null;
  const posterHtml = bizName
    ? `<span class="poster-badge">✓ ${sanitizeInput(bizName)}</span>`
    : `<span class="poster-badge individual">Individual</span>`;

  // Difficulty
  const diff      = (job.difficulty || 'easy').toLowerCase();
  const diffClass = diff === 'hard' ? 'tag-hard' : diff === 'medium' ? 'tag-medium' : 'tag-easy';
  const diffLabel = diff.charAt(0).toUpperCase() + diff.slice(1);

  // Gender
  const genderRaw   = (job.target_gender || 'any').toLowerCase();
  const genderLabel = genderRaw === 'male' ? 'Male Only' : genderRaw === 'female' ? 'Female Only' : 'Any Gender';
  const genderClass = genderRaw === 'male' ? 'tag-gender-male' : genderRaw === 'female' ? 'tag-gender-female' : 'tag-gender-any';

  // Min age & workers
  const minAge = job.min_age_int ?? parseInt(job.min_age) ?? 18;
  const needed = job.workers_needed_int ?? parseInt(job.workers_needed) ?? 1;

  // Location & pay
  const locationStr = [job.city, job.district].filter(Boolean).join(', ');
  const payNum      = parseFloat(job.daily_pay || job.budget || 0);
  const payStr      = payNum > 0 ? payNum.toLocaleString('si-LK', { maximumFractionDigits: 0 }) : '—';

  // Ineligible notices
  const noticesHtml = eligible ? '' : reasons.map(r =>
    `<div class="ineligible-notice"><i class='bx bxs-error'></i>${sanitizeInput(r)}</div>`
  ).join('');

  // Action button — clicking opens the detail modal
  const actionHtml = eligible
    ? `<button class="apply-btn" onclick="event.stopPropagation(); openJobModal('${sanitizeInput(job.id)}')">Apply Now</button>`
    : `<span class="not-eligible-btn">Not Eligible</span>`;

  return `
    <div class="job-card${!eligible ? ' ineligible' : ''}" onclick="openJobModal('${sanitizeInput(job.id)}')">
      <div class="job-card-header">
        <h3>${sanitizeInput(job.title || 'Untitled Job')}</h3>
        ${posterHtml}
      </div>
      <div class="job-location">
        <i class='bx bxs-map-pin'></i>
        ${sanitizeInput(locationStr || 'Location not set')}
      </div>
      <div class="job-tags">
        <span class="job-tag ${diffClass}">${diffLabel}</span>
        <span class="job-tag ${genderClass}">${genderLabel}</span>
        <span class="job-tag tag-age">${minAge}+</span>
        <span class="job-tag tag-count">${needed} needed</span>
      </div>
      ${noticesHtml}
      <div class="job-card-footer">
        <div class="job-pay">
          <span class="amount">Rs. ${payStr}</span>
          <span class="period">per day</span>
        </div>
        ${actionHtml}
      </div>
    </div>`;
}


// ============================================================
// ELIGIBILITY CHECK
// ============================================================
function getIneligibilityReasons(job, profile) {
  const reasons = [];
  if (!profile) {
    reasons.push('Complete your profile to check eligibility');
    return reasons;
  }

  const required   = (job.target_gender || '').toLowerCase();
  const userGender = (profile.gender    || '').toLowerCase();

  if (required && required !== 'any' && userGender !== required) {
    const label = required === 'male' ? 'males' : 'females';
    reasons.push(`⚠ This job is for ${label} only`);
  }

  const minAge = job.min_age_int ?? parseInt(job.min_age) ?? 18;
  const dob    = profile.dob ? new Date(profile.dob) : null;
  const age    = dob
    ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  if (age !== null && age < minAge) {
    reasons.push(`⚠ Minimum age requirement is ${minAge}+ (you are ${age})`);
  }

  return reasons;
}


// ============================================================
// JOB DETAIL MODAL
// ============================================================

// ── Open modal when a card is clicked ────────────────────────
function openJobModal(jobId) {
  const job = allJobs.find(j => j.id === jobId);
  if (!job) return;

  const overlay = document.getElementById('job-modal-overlay');

  // ── Populate header ───────────────────────────────────────
  document.getElementById('jm-title').textContent = sanitizeInput(job.title || 'Untitled Job');

  // Poster badge
  const posterEl = document.getElementById('jm-poster-badge');
  if (job.business_name) {
    posterEl.textContent = `✓ ${sanitizeInput(job.business_name)}`;
    posterEl.className   = 'poster-badge';
  } else {
    posterEl.textContent = 'Individual';
    posterEl.className   = 'poster-badge individual';
  }

  // Location
  const loc = [job.city, job.district, job.province].filter(Boolean).join(', ');
  document.getElementById('jm-location-text').textContent = loc || 'Location not set';

  // ── Populate body ─────────────────────────────────────────
  // Pay
  const payNum = parseFloat(job.daily_pay || job.budget || 0);
  document.getElementById('jm-pay').textContent = payNum > 0
    ? 'Rs. ' + payNum.toLocaleString('si-LK', { maximumFractionDigits: 0 })
    : 'Rs. —';

  // Category, workers, date
  document.getElementById('jm-category').textContent = sanitizeInput(job.category || '—');

  const needed = job.workers_needed_int ?? parseInt(job.workers_needed) ?? 1;
  document.getElementById('jm-workers').textContent = `${needed} worker${needed !== 1 ? 's' : ''}`;

  const postedDate = job.created_at
    ? new Date(job.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
  document.getElementById('jm-date').textContent = postedDate;

  // Tags
  const diff      = (job.difficulty || 'easy').toLowerCase();
  const diffClass = diff === 'hard' ? 'tag-hard' : diff === 'medium' ? 'tag-medium' : 'tag-easy';
  const diffLabel = diff.charAt(0).toUpperCase() + diff.slice(1);

  const genderRaw   = (job.target_gender || 'any').toLowerCase();
  const genderLabel = genderRaw === 'male' ? 'Male Only' : genderRaw === 'female' ? 'Female Only' : 'Any Gender';
  const genderClass = genderRaw === 'male' ? 'tag-gender-male' : genderRaw === 'female' ? 'tag-gender-female' : 'tag-gender-any';

  const minAge = job.min_age_int ?? parseInt(job.min_age) ?? 18;

  document.getElementById('jm-tags').innerHTML = `
    <span class="job-tag ${diffClass}">${diffLabel}</span>
    <span class="job-tag ${genderClass}">${genderLabel}</span>
    <span class="job-tag tag-age">${minAge}+</span>
    <span class="job-tag tag-count">${needed} needed</span>
  `;

  // Ineligible banner
  const reasons  = getIneligibilityReasons(job, currentProfile);
  const bannerEl = document.getElementById('jm-ineligible-banner');
  if (reasons.length) {
    bannerEl.style.display = 'flex';
    bannerEl.innerHTML = reasons.map(r =>
      `<p><i class='bx bxs-error'></i>${sanitizeInput(r)}</p>`
    ).join('');
  } else {
    bannerEl.style.display = 'none';
    bannerEl.innerHTML = '';
  }

  // Description
  document.getElementById('jm-description').textContent =
    sanitizeInput(job.description || 'No description provided.');

  // ── Reset contact area to loading state ───────────────────
  document.getElementById('jm-contact-loading').style.display = 'flex';
  document.getElementById('jm-action-btns').style.display     = 'none';
  document.getElementById('jm-no-contact').style.display      = 'none';

  // ── Show modal ────────────────────────────────────────────
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // ── Fetch poster phone async ──────────────────────────────
  fetchPosterContact(job.user_id, job);
}

// ── Fetch poster profile → build contact buttons ─────────────
async function fetchPosterContact(userId, job) {
  const loadingEl  = document.getElementById('jm-contact-loading');
  const actionEl   = document.getElementById('jm-action-btns');
  const noContactEl = document.getElementById('jm-no-contact');

  try {
    const { data: poster, error } = await supabaseClient
      .from('profiles')
      .select('full_name, phone_number')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const phone = poster?.phone_number?.replace(/\s/g, '') || '';

    if (!phone) {
      loadingEl.style.display  = 'none';
      noContactEl.style.display = 'block';
      return;
    }

    // Normalize phone → Sri Lanka format for WhatsApp
    const phoneDigits = phone.replace(/\D/g, '');
    const waNumber = phoneDigits.startsWith('0')
      ? '94' + phoneDigits.slice(1)
      : phoneDigits.startsWith('94')
        ? phoneDigits
        : '94' + phoneDigits;

    const jobTitle    = sanitizeInput(job.title || 'your job posting');
    const waMessage   = encodeURIComponent(
      `Hi! I saw your job posting "${jobTitle}" on Elinker and I'm interested in applying. Could you please share more details?`
    );
    const waUrl  = `https://wa.me/${waNumber}?text=${waMessage}`;
    const telUrl = `tel:+${waNumber}`;

    actionEl.innerHTML = `
      <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp">
        <i class='bx bxl-whatsapp'></i> WhatsApp
      </a>
      <a href="${telUrl}" class="btn-call">
        <i class='bx bx-phone-call'></i> Call Now
      </a>
    `;

    loadingEl.style.display = 'none';
    actionEl.style.display  = 'flex';

  } catch (err) {
    console.warn('Could not fetch poster contact:', err);
    loadingEl.style.display  = 'none';
    noContactEl.style.display = 'block';
  }
}

// ── Close modal ───────────────────────────────────────────────
function closeJobModal() {
  const overlay = document.getElementById('job-modal-overlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Wire up close button and overlay click ────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('jm-close-btn')?.addEventListener('click', closeJobModal);

  document.getElementById('job-modal-overlay')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('job-modal-overlay')) {
      closeJobModal();
    }
  });

  // ESC key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeJobModal();
  });
});
