function showToast(message, type = 'info', duration = 4500) {
  const icons = {
    success: 'bx bx-check-circle',
    error: 'bx bx-error-circle',
    warning: 'bx bx-error',
    info: 'bx bx-info-circle',
  };

  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.innerHTML = `
    <i class="${icons[type] || icons.info}"></i>
    <span>${message}</span>
    <i class="bx bx-x toast-close"></i>
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('toast-show'));
  });

  const dismiss = () => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 500);
  };
  toast.querySelector('.toast-close').addEventListener('click', dismiss);
  if (duration > 0) setTimeout(dismiss, duration);
}


// ============================================================
// FIELD VALIDATION HELPERS
// ============================================================

function setValid(fieldId) {
  const el = document.getElementById(fieldId);
  if (!el) return;
  el.style.borderColor = '';
  el.style.boxShadow = '';
  const msg = el.parentElement.querySelector('.field-error');
  if (msg) msg.remove();
}

function setError(fieldId, message) {
  const el = document.getElementById(fieldId);
  if (!el) return;
  el.style.borderColor = 'rgba(239,68,68,.6)';
  el.style.boxShadow = '0 0 0 3px rgba(239,68,68,.12)';

  const existing = el.parentElement.querySelector('.field-error');
  if (existing) existing.remove();

  const msg = document.createElement('p');
  msg.className = 'field-error';
  msg.textContent = message;
  msg.style.cssText = 'color:#ef4444;font-size:.72rem;margin-top:5px;line-height:1.4;';
  el.parentElement.appendChild(msg);
}

function validateField(fieldId, rules) {
  const el = document.getElementById(fieldId);
  if (!el) return true;
  const val = el.value.trim();
  for (const rule of rules) {
    if (!rule.test(val)) {
      setError(fieldId, rule.message);
      return false;
    }
  }
  setValid(fieldId);
  return true;
}

const RULES = {
  jobTitle: [
    { test: v => v.length > 0, message: 'Job title is required.' },
    { test: v => v.length >= 5, message: 'Title must be at least 5 characters.' },
    { test: v => v.length <= 80, message: 'Title must be 80 characters or less.' },
  ],
  description: [
    { test: v => v.length > 0, message: 'Description is required.' },
    { test: v => v.length >= 20, message: 'Please describe the job in at least 20 characters.' },
    { test: v => v.length <= 1000, message: 'Description must be 1000 characters or less.' },
  ],
  payRate: [
    { test: v => v.length > 0, message: 'Pay rate is required.' },
    { test: v => /^\d+(\.\d{1,2})?$/.test(v), message: 'Enter a valid number (e.g. 1500).' },
    { test: v => +v >= 100, message: 'Minimum pay rate is Rs. 100.' },
    { test: v => +v <= 500000, message: 'Pay rate seems too high. Max Rs. 500,000.' },
  ],
  bizReg: [
    { test: v => v.length > 0, message: 'Business registration number is required.' },
    { test: v => v.length >= 4, message: 'Please enter a valid registration number.' },
  ],
};

function attachRealtimeValidation(fieldId, rules) {
  const el = document.getElementById(fieldId);
  if (!el) return;
  el.addEventListener('blur', () => validateField(fieldId, rules));
  el.addEventListener('input', () => {
    if (el.style.borderColor) validateField(fieldId, rules);
  });
}


// ============================================================
// UI INTERACTIONS — runs after DOM is ready
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

  // ── Preview refs ──────────────────────────────────────────
  const prevTitle = document.getElementById('prevTitle');
  const prevLocation = document.getElementById('prevLocation');
  const prevPay = document.getElementById('prevPay');
  const prevDiff = document.getElementById('prevDiff');
  const prevGender = document.getElementById('prevGender');
  const prevAge = document.getElementById('prevAge');
  const prevBiz = document.getElementById('prevBiz');

  // Reset defaults
  prevTitle.textContent = 'Job Title';
  prevPay.textContent = 'Rs. —';

  // ── Cascading location dropdowns ──────────────────────────
  initLocationDropdowns('province', 'district', 'city', (_province, district, city) => {
    const parts = [city, district].filter(Boolean);
    prevLocation.textContent = parts.length ? parts.join(', ') : '—';
  });

  // ── Job Title ─────────────────────────────────────────────
  const jobTitleEl = document.getElementById('jobTitle');
  jobTitleEl.value = '';
  jobTitleEl.addEventListener('input', () => {
    prevTitle.textContent = jobTitleEl.value.trim() || 'Job Title';
    if (jobTitleEl.style.borderColor) validateField('jobTitle', RULES.jobTitle);
  });
  jobTitleEl.addEventListener('blur', () => validateField('jobTitle', RULES.jobTitle));

  // ── Description ───────────────────────────────────────────
  attachRealtimeValidation('description', RULES.description);

  // ── Pay Rate ──────────────────────────────────────────────
  const payRateEl = document.getElementById('payRate');
  payRateEl.value = '';
  payRateEl.addEventListener('input', () => {
    const val = parseInt(payRateEl.value, 10);
    prevPay.textContent = val > 0 ? 'Rs. ' + val.toLocaleString() : 'Rs. —';
    if (payRateEl.style.borderColor) validateField('payRate', RULES.payRate);
  });
  payRateEl.addEventListener('blur', () => validateField('payRate', RULES.payRate));

  // ── Min Age sync ──────────────────────────────────────────
  const minAgeEl = document.getElementById('minAge');
  minAgeEl.addEventListener('change', () => {
    prevAge.textContent = minAgeEl.value;
  });

  // ── Difficulty Cards ──────────────────────────────────────
  document.querySelectorAll('.diff-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.diff-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const val = card.dataset.value.toLowerCase(); // 'easy' | 'medium' | 'hard'

      prevDiff.className = '';
      prevDiff.style.cssText = '';

      if (val === 'easy') {
        prevDiff.textContent = 'Easy';
        prevDiff.className = 'tag-easy';
      } else if (val === 'medium') {
        prevDiff.textContent = 'Medium';
        prevDiff.className = 'tag-medium';
      } else {
        prevDiff.textContent = 'Hard';
        prevDiff.className = 'tag-hard';
      }
    });
  });

  // ── Generic Button Group helper ───────────────────────────
  function setupGroup(id, cb) {
    const group = document.getElementById(id);
    if (!group) return;
    group.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (cb) cb(btn.dataset.value);
      });
    });
  }

  // ── Gender selection ──────────────────────────────────────
  setupGroup('genderGroup', val => {
    prevGender.textContent = val;
  });

  // ── Posting As (Individual / Business) ───────────────────
  const bizRegBox = document.getElementById('bizRegBox');
  setupGroup('postingGroup', val => {
    const isBiz = val === 'Business';
    bizRegBox.style.display = isBiz ? 'block' : 'none';
    prevBiz.style.display = isBiz ? 'inline-block' : 'none';
    if (isBiz) {
      attachRealtimeValidation('bizReg', RULES.bizReg);
    } else {
      setValid('bizReg');
    }
  });

  // Default: Individual selected — hide biz box
  bizRegBox.style.display = 'none';
  prevBiz.style.display = 'none';
  // Make "Individual" active by default
  const postingGroup = document.getElementById('postingGroup');
  if (postingGroup) {
    postingGroup.querySelectorAll('button').forEach(b => b.classList.remove('active'));
    const indBtn = postingGroup.querySelector('[data-value="Individual"]');
    if (indBtn) indBtn.classList.add('active');
  }

  // ── Workers Counter ───────────────────────────────────────
  let workerCount = 1;
  const cVal = document.getElementById('c-val');
  const cMinus = document.getElementById('c-minus');
  const cPlus = document.getElementById('c-plus');
  cMinus?.addEventListener('click', () => {
    if (workerCount > 1) { workerCount--; cVal.textContent = workerCount; }
  });
  cPlus?.addEventListener('click', () => {
    if (workerCount < 50) { workerCount++; cVal.textContent = workerCount; }
  });
});


// ============================================================
// ACCESS CONTROL — Only logged-in clients can post
// ============================================================
(async () => {
  const user = await getCurrentUser();

  if (!user) {
    showAccessDenied(
      'Login Required',
      'You need to login first to post a job.',
      'bxs-lock-alt',
      [
        { text: 'Login Now', href: 'login.html', cls: 'primary' },
        { text: 'Go Home', href: 'index.html', cls: 'secondary' }
      ]
    );
    return;
  }

  const profile = await getUserProfile(user.id);

  if (profile && (!profile.gender || !profile.dob)) {
    window.location.href = 'signup.html';
    return;
  }

  if (profile?.user_type !== 'client') {
    showAccessDenied(
      'Workers Can\'t Post Jobs',
      'Only clients can post jobs. As a worker, you can browse and apply for available jobs.',
      'bxs-shield-x',
      [
        { text: 'Find Work', href: 'jobs.html', cls: 'primary' },
        { text: 'Go Home', href: 'index.html', cls: 'secondary' }
      ]
    );
    return;
  }

  document.getElementById('page-content').style.display = '';
})();


// ============================================================
// FORM SUBMISSION  →  Supabase insert into `jobs`
// ============================================================
document.getElementById('jobForm')?.addEventListener('submit', async function (e) {
  e.preventDefault();

  // ── Collect values ────────────────────────────────────────
  const title = sanitizeInput(document.getElementById('jobTitle').value.trim());
  const description = sanitizeInput(document.getElementById('description').value.trim());
  const category = sanitizeInput(document.getElementById('category').value);
  const payRateRaw = document.getElementById('payRate').value.trim();
  const province = sanitizeInput(document.getElementById('province').value);
  const district = sanitizeInput(document.getElementById('district').value);
  const city = sanitizeInput(document.getElementById('city').value);

  // difficulty: stored lowercase ('easy' | 'medium' | 'hard')
  const diffValue = document.querySelector('.diff-card.active')?.dataset.value || 'Easy';
  const difficulty = diffValue.toLowerCase();

  // gender: stored as 'any' | 'male' | 'female'
  const genderLabel = document.querySelector('#genderGroup .active')?.dataset.value || 'Any Gender';
  const genderMap = { 'Any Gender': 'any', 'Male Only': 'male', 'Female Only': 'female' };
  const targetGender = genderMap[genderLabel] || 'any';

  // posting type
  const postingLabel = document.querySelector('#postingGroup .active')?.dataset.value || 'Individual';
  const isBusiness = postingLabel === 'Business';
  const bizReg = isBusiness ? sanitizeInput(document.getElementById('bizReg')?.value.trim() || '') : '';
  const businessName = isBusiness ? bizReg : null;

  // min age: stored as integer
  const minAgeRaw = document.getElementById('minAge').value;
  const minAge = minAgeRaw === '18+' ? 18 : (minAgeRaw === 'Under 18' ? 16 : 18);

  // workers needed: stored as integer
  const workersNeeded = parseInt(document.getElementById('c-val').textContent, 10) || 1;

  // daily pay: stored as numeric
  const dailyPay = parseFloat(payRateRaw);

  // ── Run validations ───────────────────────────────────────
  const checks = [
    validateField('jobTitle', RULES.jobTitle),
    validateField('description', RULES.description),
    validateField('payRate', RULES.payRate),
    ...(isBusiness ? [validateField('bizReg', RULES.bizReg)] : []),
  ];

  // Location check
  const missingLocations = [];
  if (!province) missingLocations.push('Province');
  if (!district) missingLocations.push('District');
  if (!city) missingLocations.push('City / Area');

  if (missingLocations.length) {
    showToast(`Please select: ${missingLocations.join(', ')}.`, 'warning');
    checks.push(false);
  }

  if (checks.includes(false)) {
    showToast('Please fix the highlighted fields before posting.', 'error');
    return;
  }

  // ── Re-verify user (fresh check before write) ─────────────
  const user = await getCurrentUser();
  if (!user) {
    showToast('Session expired. Please log in again.', 'error');
    return;
  }

  const profile = await getUserProfile(user.id);
  if (profile?.user_type !== 'client') {
    showToast('Only clients can post jobs.', 'error');
    return;
  }

  // ── Supabase INSERT ───────────────────────────────────────
  const submitBtn = document.getElementById('postJobBtn');
  const originalHtml = submitBtn?.innerHTML;
  if (submitBtn) {
    submitBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Posting…';
    submitBtn.disabled = true;
  }

  try {
    const jobPayload = {
      user_id: user.id,
      title: title,
      description: description,
      category: category,
      daily_pay: dailyPay,
      budget: String(dailyPay),   // keep old column in sync
      province: province,
      district: district,
      city: city,
      difficulty: difficulty,
      target_gender: targetGender,
      posting_type: postingLabel,
      biz_reg: bizReg || null,
      business_name: businessName,
      min_age: String(minAge),
      min_age_int: minAge,
      workers_needed: String(workersNeeded),
      workers_needed_int: workersNeeded,
      status: 'open',
    };

    const { data, error } = await supabaseClient
      .from('jobs')
      .insert([jobPayload])
      .select('id')
      .single();

    if (error) throw error;

    showToast('Job posted successfully! Redirecting…', 'success', 3000);
    setTimeout(() => { window.location.href = 'jobs.html'; }, 1600);

  } catch (err) {
    console.error('Post job error:', err);

    // Friendly error messages
    let friendly = 'Failed to post job. Please try again.';
    if (err.code === '23514') {
      friendly = 'Invalid value submitted. Please check your selections.';
    } else if (err.code === '23502') {
      friendly = 'A required field is missing. Please fill in all fields.';
    } else if (err.message?.includes('JWT')) {
      friendly = 'Session expired. Please log in again.';
    } else if (err.message) {
      friendly = err.message;
    }

    showToast(friendly, 'error', 0);
  } finally {
    if (submitBtn) {
      submitBtn.innerHTML = originalHtml;
      submitBtn.disabled = false;
    }
  }
});
