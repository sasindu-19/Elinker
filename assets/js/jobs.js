// ============================================================
// jobs.js  –  Find Work page logic
// Loads jobs from Supabase, filters by user profile & UI filters
// Realtime: new/updated/deleted jobs auto-refresh the grid
// ============================================================

// ── Module-level state ───────────────────────────────────────
let allJobs     = [];
let currentProfile = null;
let realtimeChannel = null;

// ── Schedule Date/Time Helpers ─────────────────────────────────
function formatTime12Hour(timeStr) {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();
  if (trimmed.toUpperCase().includes('AM') || trimmed.toUpperCase().includes('PM')) {
    return trimmed;
  }
  const parts = trimmed.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return timeStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
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
        { text: 'Login Now', href: 'login', cls: 'primary' },
        { text: 'Go Home',   href: '/', cls: 'secondary' }
      ]
    );
    return;
  }

  // ── 2. Profile completeness check ────────────────────────
  const profile = await getUserProfile(user.id);
  if (profile && (!profile.gender || !profile.dob)) {
    window.location.href = 'signup';
    return;
  }

  currentProfile = profile;
  document.getElementById('page-content').style.display = '';

  // Hide Post a Job for workers
  if (profile && profile.user_type && profile.user_type.toLowerCase() === 'worker') {
    const postFooter = document.getElementById('post-job-link-footer');
    if (postFooter) postFooter.style.display = 'none';
    const postNav = document.getElementById('post-job-link');
    if (postNav) postNav.style.display = 'none';
    const postNavMobile = document.getElementById('post-job-link-mobile');
    if (postNavMobile) postNavMobile.style.display = 'none';
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

    const profileInitialsEl = document.getElementById('profile-initials');
    if (profileInitialsEl) {
      if (profile.avatar_url) {
        profileInitialsEl.innerHTML = `<img src="${profile.avatar_url}" alt="${profile.full_name || 'Worker'}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;" onerror="this.onerror=null; this.parentElement.textContent='${initials}';">`;
      } else {
        profileInitialsEl.textContent = initials;
      }
    }
    document.getElementById('profile-name').textContent     = profile.full_name || 'Worker';
    document.getElementById('profile-meta').textContent     =
      [location, age !== null ? `Age ${age}` : '', genderLabel].filter(Boolean).join(' · ');

    document.getElementById('badge-gender').textContent = genderLabel || '—';
    document.getElementById('badge-age').textContent    = age !== null ? `${age} yrs` : '—';
  }

  // ── 4. Initial fetch ─────────────────────────────────────
  await fetchAndRender();

  // ── 5. Filter listeners ───────────────────────────────────
  ['filter-district', 'filter-difficulty', 'filter-gender', 'filter-workmode'].forEach(id => {
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

  const rawJobs = jobs || [];
  const userIds = [...new Set(rawJobs.map(j => j.user_id).filter(Boolean))];
  let profileMap = new Map();

  if (userIds.length > 0) {
    const { data: profiles } = await supabaseClient
      .from('profiles')
      .select('id, full_name, business_name, avatar_url')
      .in('id', userIds);

    if (profiles) {
      profileMap = new Map(profiles.map(p => [p.id, p]));
    }
  }

  allJobs = rawJobs.map(j => {
    const p = profileMap.get(j.user_id);
    return {
      ...j,
      poster_name: p ? (p.business_name || p.full_name || 'Individual') : (j.business_name || 'Individual'),
      poster_avatar: p?.avatar_url || null
    };
  });

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
      if (newRow.user_id) {
        const { data: p } = await supabaseClient
          .from('profiles')
          .select('full_name, business_name, avatar_url')
          .eq('id', newRow.user_id)
          .single();
        if (p) {
          newRow.poster_name = p.business_name || p.full_name || 'Individual';
          newRow.poster_avatar = p.avatar_url || null;
        }
      }
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
      if (newRow.user_id) {
        const { data: p } = await supabaseClient
          .from('profiles')
          .select('full_name, business_name, avatar_url')
          .eq('id', newRow.user_id)
          .single();
        if (p) {
          newRow.poster_name = p.business_name || p.full_name || 'Individual';
          newRow.poster_avatar = p.avatar_url || null;
        }
      }
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
  const workMode   = document.getElementById('filter-workmode')?.value   || '';
  const search     = (document.getElementById('filter-search')?.value || '').trim().toLowerCase();

  const filtered = allJobs.filter(job => {
    if (district   && job.district   !== district)   return false;
    if (difficulty && job.difficulty !== difficulty)  return false;
    if (workMode   && job.work_mode  !== workMode)    return false;
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

  // Poster badge & details
  const bizName           = job.business_name || null;
  const posterDisplayName = job.poster_name || bizName || 'Individual';
  const posterHtml        = bizName
    ? `<span class="poster-badge">✓ ${sanitizeInput(bizName)}</span>`
    : `<span class="poster-badge individual">Individual</span>`;

  // Avatar HTML
  const nameParts = posterDisplayName.trim().split(/\s+/);
  const initials  = nameParts.map(w => w[0] || '').join('').toUpperCase().slice(0, 2) || 'P';
  const posterAvatarHtml = job.poster_avatar
    ? `<div class="job-poster-avatar"><img src="${job.poster_avatar}" alt="${sanitizeInput(posterDisplayName)}" onerror="this.onerror=null; this.parentElement.textContent='${initials}';"></div>`
    : `<div class="job-poster-avatar">${initials}</div>`;

  const posterBarHtml = `
    <div class="job-poster-bar">
      ${posterAvatarHtml}
      <div class="job-poster-info">
        <span class="job-poster-name">${sanitizeInput(posterDisplayName)}</span>
      </div>
      ${posterHtml}
    </div>`;

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
  const isOnline    = (job.work_mode === 'online');
  const locationStr = isOnline ? 'Online / Remote' : [job.city, job.district].filter(Boolean).join(', ');
  const payNum      = parseFloat(job.daily_pay || job.budget || 0);
  const payStr      = payNum > 0 ? payNum.toLocaleString('si-LK', { maximumFractionDigits: 0 }) : '—';

  // Schedule
  const scheduleStr = (job.start_date && job.start_time)
    ? `${job.start_date} at ${formatTime12Hour(job.start_time)}`
    : 'Not scheduled';

  // Ineligible notices
  const noticesHtml = eligible ? '' : reasons.map(r =>
    `<div class="ineligible-notice"><i class='bx bxs-error'></i>${sanitizeInput(r)}</div>`
  ).join('');
  
  // Status badge
  const isClosed = reasons.some(r => r.includes('deadline') || r.includes('passed'));
  let statusBadgeHtml = `<span class="job-tag tag-easy">Open</span>`;
  if (isClosed) {
    statusBadgeHtml = `<span class="job-tag tag-hard">Closed</span>`;
  }

  // Action button — clicking opens the detail modal
  const actionHtml = eligible
    ? `<button class="apply-btn" onclick="event.stopPropagation(); openJobModal('${sanitizeInput(job.id)}')">Apply Now</button>`
    : `<span class="not-eligible-btn">Not Eligible</span>`;

  return `
    <div class="job-card${!eligible ? ' ineligible' : ''}" onclick="openJobModal('${sanitizeInput(job.id)}')">
      ${posterBarHtml}
      <div class="job-card-header">
        <h3>${sanitizeInput(job.title || 'Untitled Job')}</h3>
      </div>
      <div class="job-location">
        <i class='bx bxs-map-pin'></i>
        <span class="loc-text">${sanitizeInput(locationStr || 'Location not set')}</span>
        ${(!isOnline && job.lat && job.lng) ? `<a href="https://www.google.com/maps/dir/?api=1&destination=${job.lat},${job.lng}" target="_blank" onclick="event.stopPropagation()" class="map-link-btn card-map-btn"><i class='bx bx-map-alt'></i> Distance</a>` : ''}
      </div>
      <div class="job-schedule" title="Application Deadline">
        <i class='bx bx-calendar'></i>
        Deadline: ${sanitizeInput(scheduleStr)}
      </div>
      <div class="job-tags">
        ${statusBadgeHtml}
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
  
  const endObj = parseJobDateTime(job.end_date, job.end_time);
  const startObj = parseJobDateTime(job.start_date, job.start_time);
  const now = new Date();

  if (endObj && now >= endObj) {
    reasons.push('⚠ Application deadline passed (Job ended)');
  } else if (startObj && now >= startObj) {
    reasons.push('⚠ Application deadline passed (Job started)');
  }

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
  document.getElementById('jm-title').innerHTML = sanitizeInput(job.title || 'Untitled Job');

  // Poster badge
  const posterEl = document.getElementById('jm-poster-badge');
  if (job.business_name) {
    posterEl.innerHTML = `✓ ${sanitizeInput(job.business_name)}`;
    posterEl.className   = 'poster-badge';
  } else {
    posterEl.textContent = 'Individual';
    posterEl.className   = 'poster-badge individual';
  }

  // Pre-populate poster card in modal
  const initialDisplayName = job.poster_name || job.business_name || 'Individual Poster';
  const initialSub = job.business_name ? 'Company / Business' : 'Individual Poster';
  const initialParts = initialDisplayName.trim().split(/\s+/);
  const initialInitials = initialParts.map(w => w[0] || '').join('').toUpperCase().slice(0, 2) || 'P';

  const posterAvatarEl = document.getElementById('jm-poster-avatar');
  if (posterAvatarEl) {
    if (job.poster_avatar) {
      posterAvatarEl.innerHTML = `<img src="${job.poster_avatar}" alt="${sanitizeInput(initialDisplayName)}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;" onerror="this.onerror=null; this.parentElement.textContent='${initialInitials}';">`;
    } else {
      posterAvatarEl.textContent = initialInitials;
    }
  }
  const nameEl = document.getElementById('jm-poster-name');
  if (nameEl) nameEl.textContent = initialDisplayName;
  const subEl = document.getElementById('jm-poster-sub');
  if (subEl) subEl.textContent = initialSub;

  // Location
  const isOnline = (job.work_mode === 'online');
  const loc = isOnline ? 'Online / Remote' : [job.city, job.district, job.province].filter(Boolean).join(', ');
  
  let mapLinkHtml = '';
  if (!isOnline && job.lat && job.lng) {
    mapLinkHtml = `<a href="https://www.google.com/maps/dir/?api=1&destination=${job.lat},${job.lng}" target="_blank" class="map-link-btn modal-map-btn"><i class='bx bx-map-alt'></i> View on Map</a>`;
  }
  document.getElementById('jm-location-text').innerHTML = `<span class="loc-text">${loc || 'Location not set'}</span>` + mapLinkHtml;

  // ── Populate body ─────────────────────────────────────────
  // Pay
  const payNum = parseFloat(job.daily_pay || job.budget || 0);
  document.getElementById('jm-pay').textContent = payNum > 0
    ? 'Rs. ' + payNum.toLocaleString('si-LK', { maximumFractionDigits: 0 })
    : 'Rs. —';

  // Category, workers, date
  document.getElementById('jm-category').innerHTML = sanitizeInput(job.category || '—');

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

  const endObj = parseJobDateTime(job.end_date, job.end_time);
  const startObj = parseJobDateTime(job.start_date, job.start_time);
  const now = new Date();
  const isClosed = job.status !== 'open' || (endObj && now >= endObj) || (startObj && now >= startObj);
  
  let statusHtml = `<span class="job-tag tag-easy">Open</span>`;
  if (isClosed) {
    statusHtml = `<span class="job-tag tag-hard">Closed</span>`;
  }

  document.getElementById('jm-tags').innerHTML = `
    ${statusHtml}
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

  // Schedule
  const scheduleHtml = (job.start_date && job.start_time && job.end_date && job.end_time)
    ? `<div class="jm-section-label">Work Schedule</div>
       <div class="jm-description">
         <strong>Start:</strong> ${job.start_date} at ${formatTime12Hour(job.start_time)} <br>
         <strong>End:</strong> ${job.end_date} at ${formatTime12Hour(job.end_time)}
       </div>`
    : '';

  // Description
  // To preserve line breaks while rendering innerHTML
  const safeDesc = sanitizeInput(job.description || 'No description provided.');
  document.getElementById('jm-description').innerHTML = scheduleHtml + '<div class="jm-section-label">Job Description</div>' + safeDesc.replace(/\n/g, '<br>');

  // ── Reset contact area to loading state ───────────────────
  document.getElementById('jm-contact-loading').style.display = 'flex';
  document.getElementById('jm-action-btns').style.display     = 'none';
  document.getElementById('jm-no-contact').style.display      = 'none';

  // ── Show modal ────────────────────────────────────────────
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Hide scroll-to-top button
  const scrollBtn = document.querySelector('.scroll-top-btn');
  if (scrollBtn) scrollBtn.style.display = 'none';

  // ── Fetch poster phone async ──────────────────────────────
  if (reasons.length === 0) {
    fetchPosterContact(job.user_id, job);
  } else {
    document.getElementById('jm-contact-loading').style.display = 'none';
    const noContactEl = document.getElementById('jm-no-contact');
    noContactEl.style.display = 'block';
    noContactEl.innerHTML = '<i class="bx bx-lock-alt"></i> Contact info hidden (Not Eligible)';
  }
}

// ── Fetch poster profile → build contact buttons ─────────────
async function fetchPosterContact(userId, job) {
  const loadingEl   = document.getElementById('jm-contact-loading');
  const actionEl    = document.getElementById('jm-action-btns');
  const noContactEl = document.getElementById('jm-no-contact');

  try {
    const { data: poster, error } = await supabaseClient
      .from('profiles')
      .select('full_name, business_name, avatar_url, phone_number')
      .eq('id', userId)
      .single();

    if (error) throw error;

    // Update modal poster card with latest profile details
    const displayName = poster?.business_name || poster?.full_name || job.business_name || 'Individual Poster';
    const subTitle    = poster?.business_name ? 'Company / Business' : 'Individual Client';
    const nameParts   = displayName.trim().split(/\s+/);
    const initials    = nameParts.map(w => w[0] || '').join('').toUpperCase().slice(0, 2) || 'P';

    const posterAvatarEl = document.getElementById('jm-poster-avatar');
    if (posterAvatarEl) {
      if (poster?.avatar_url) {
        posterAvatarEl.innerHTML = `<img src="${poster.avatar_url}" alt="${sanitizeInput(displayName)}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;" onerror="this.onerror=null; this.parentElement.textContent='${initials}';">`;
      } else {
        posterAvatarEl.textContent = initials;
      }
    }
    const nameEl = document.getElementById('jm-poster-name');
    if (nameEl) nameEl.textContent = displayName;
    const subEl = document.getElementById('jm-poster-sub');
    if (subEl) subEl.textContent = subTitle;

    const phone = poster?.phone_number?.replace(/\s/g, '') || '';

    if (!phone) {
      loadingEl.style.display   = 'none';
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
    loadingEl.style.display   = 'none';
    noContactEl.style.display = 'block';
  }
}

// ── Close modal ───────────────────────────────────────────────
function closeJobModal() {
  const overlay = document.getElementById('job-modal-overlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';

  // Show scroll-to-top button
  const scrollBtn = document.querySelector('.scroll-top-btn');
  if (scrollBtn) scrollBtn.style.display = '';
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

const workMode = document.getElementById("filter-workmode");
const district = document.getElementById("filter-district");

workMode.addEventListener("change", function () {
    if (this.value === "online") {
        district.style.display = "none";
    } else {
        district.style.display = "inline-block"; // or "block" depending on your layout
    }
});
