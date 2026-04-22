// --- Toast System ---
function showToast(message, type = 'info', duration = 4000) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    const icons = { success: 'bx bxs-check-circle', error: 'bx bxs-error-circle', info: 'bx bxs-info-circle', warning: 'bx bxs-error' };
    
    toast.innerHTML = `<i class='${icons[type] || icons.info}'></i><span>${message}</span><i class='bx bx-x toast-close'></i>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('toast-show'));
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.remove('toast-show');
        setTimeout(() => toast.remove(), 400);
    });

    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.remove('toast-show');
            setTimeout(() => toast.remove(), 400);
        }
    }, duration);
}

const findWork = document.getElementById("findWork");
const postJobs = document.getElementById("postJobs");

const skillsSection = document.getElementById("skillsSection");
const businessSection = document.getElementById("businessSection");

// Default state
skillsSection.classList.remove("hidden");

findWork.addEventListener("click", () => {
  findWork.classList.add("active");
  postJobs.classList.remove("active");

  skillsSection.classList.remove("hidden");
  businessSection.classList.add("hidden");
});

postJobs.addEventListener("click", () => {
  postJobs.classList.add("active");
  findWork.classList.remove("active");

  skillsSection.classList.add("hidden");
  businessSection.classList.remove("hidden");
});

const individualBtn = document.getElementById("individualBtn");
const registeredBtn = document.getElementById("registeredBtn");
const businessName = document.getElementById("businessName");

// Default → Individual
businessName.classList.add("hidden");

individualBtn.addEventListener("click", () => {
  individualBtn.classList.add("active");
  registeredBtn.classList.remove("active");

  // Hide business field
  businessName.classList.add("hidden");
});

registeredBtn.addEventListener("click", () => {
  registeredBtn.classList.add("active");
  individualBtn.classList.remove("active");

  // Show business field
  businessName.classList.remove("hidden");
});

const checkbox = document.getElementById('agree');
const button = document.getElementById('submitBtn');
// --- Dynamic Locations (Sri Lanka) ---
initLocationDropdowns('prof-province', 'prof-district', 'prof-city');

// --- NIC parsing helper ---
function extractInfoFromNIC(nicStr) {
  let nic = nicStr.trim().toUpperCase();
  if (!nic) return null;
  
  let yearStr, dayOfYearStr;
  
  if (nic.length === 10 && /^[0-9]{9}[VX]$/.test(nic)) {
    yearStr = "19" + nic.substring(0, 2);
    dayOfYearStr = nic.substring(2, 5);
  } else if (nic.length === 12 && /^[0-9]{12}$/.test(nic)) {
    yearStr = nic.substring(0, 4);
    dayOfYearStr = nic.substring(4, 7);
  } else {
    return null; // Invalid NIC
  }
  
  let dayOfYear = parseInt(dayOfYearStr, 10);
  if (dayOfYear > 500) {
    dayOfYear -= 500;
  }
  
  const dob = new Date(parseInt(yearStr, 10), 0); 
  dob.setDate(dayOfYear);
  
  const yyyy = dob.getFullYear();
  const mm = String(dob.getMonth() + 1).padStart(2, '0');
  const dd = String(dob.getDate()).padStart(2, '0');
  
  return `${yyyy}-${mm}-${dd}`;
}

// --- Realtime Validation Logic ---
function showError(inputId, message) {
  const inputEl = document.getElementById(inputId);
  if (!inputEl) return;
  inputEl.style.borderColor = '#ff4d4d';
  // Check if error span exists, if not create one
  let errorSpan = inputEl.nextElementSibling;
  if (!errorSpan || !errorSpan.classList.contains('realtime-error')) {
    errorSpan = document.createElement('span');
    errorSpan.className = 'realtime-error';
    errorSpan.style.color = '#ff4d4d';
    errorSpan.style.fontSize = '12px';
    errorSpan.style.marginTop = '4px';
    errorSpan.style.display = 'block';
    inputEl.parentNode.insertBefore(errorSpan, inputEl.nextSibling);
  }
  errorSpan.textContent = message;
}

function clearError(inputId) {
  const inputEl = document.getElementById(inputId);
  if (!inputEl) return;
  inputEl.style.borderColor = ''; // reset
  const errorSpan = inputEl.nextElementSibling;
  if (errorSpan && errorSpan.classList.contains('realtime-error')) {
    errorSpan.remove();
  }
}

// Bind live events
['prof-fullname', 'prof-phone', 'prof-nic'].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener('input', () => {
      clearError(id);
      if (id === 'prof-fullname' && el.value.trim().length < 3) {
        showError(id, 'Name must be at least 3 characters.');
      } else if (id === 'prof-fullname' && el.value.trim().length >= 3) {
        el.style.borderColor = '#0ef';
      }
      
      if (id === 'prof-phone' && !/^[0-9]{10}$/.test(el.value.trim().replace(/[^0-9]/g, ''))) {
        showError(id, 'Valid 10-digit phone number strictly required.');
      } else if (id === 'prof-phone' && /^[0-9]{10}$/.test(el.value.trim().replace(/[^0-9]/g, ''))) {
        el.style.borderColor = '#0ef';
      }
      
      if (id === 'prof-nic') {
        const val = el.value.trim().toUpperCase();
        if (val.length > 0 && !extractInfoFromNIC(val)) {
          showError(id, 'Invalid NIC format (9 digits + V/X or 12 digits).');
        } else if (val.length > 0) {
          el.style.borderColor = '#0ef'; // Highlight valid
        }
      }
    });
  }
});

// --- Skills Selection Logic ---
const skillChips = document.querySelectorAll('.skill-chip');
const selectedSkills = new Set();

skillChips.forEach(chip => {
  chip.addEventListener('click', () => {
    const skill = chip.textContent.trim();
    if (chip.classList.contains('active')) {
      chip.classList.remove('active');
      selectedSkills.delete(skill);
    } else {
      chip.classList.add('active');
      selectedSkills.add(skill);
    }
  });
});

// --- Form Submission / Onboarding Setup ---
button.addEventListener('click', async (e) => {
  e.preventDefault();

  const user = await getCurrentUser();
  if (!user) {
    showToast('Session expired. Please log in again.', 'error');
    return;
  }

  // Gather values
  const userRole = findWork.classList.contains('active') ? 'worker' : 'client';
  const fullName = sanitizeInput(document.getElementById('prof-fullname').value.trim());
  const phone = sanitizeInput(document.getElementById('prof-phone').value.trim());
  const gender = sanitizeInput(document.getElementById('prof-gender').value);
  const nic = sanitizeInput(document.getElementById('prof-nic').value.trim());
  const province = sanitizeInput(document.getElementById('prof-province').value);
  const district = sanitizeInput(document.getElementById('prof-district').value);
  const city = sanitizeInput(document.getElementById('prof-city').value);
  
  const isBusiness = registeredBtn.classList.contains('active');
  const bizName = isBusiness ? sanitizeInput(document.getElementById('businessName').value.trim()) : null;
  const skillsArray = Array.from(selectedSkills).map(s => sanitizeInput(s));

  // Strict Validation
  if (!fullName || !phone) {
    showToast('Please enter your Full Name and Phone Number.', 'warning');
    return;
  }
  if (!gender || !nic) {
    showToast('Please provide your Gender and NIC Number.', 'warning');
    return;
  }
  if (!province || !district || !city) {
    showToast('Please select your Province, District, and City.', 'warning');
    return;
  }
  
  if (!checkbox.checked) {
    showToast('Please agree to the Terms & Data Policy to continue.', 'warning');
    return;
  }

  // Extract DOB
  const dob = extractInfoFromNIC(nic);
  if (!dob) {
    showToast('Invalid NIC Format. Please check your NIC Number.', 'error');
    return;
  }

  button.disabled = true;
  button.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Saving...';

  // Build the update object
  const updates = {
    full_name: fullName,
    phone_number: phone,
    user_type: userRole,
    gender: gender,
    nic: nic,
    dob: dob,
    province: province,
    district: district,
    city: city,
    agreed_terms: true
  };

  // Add specific info based on role
  if (userRole === 'worker') {
    updates.skills = skillsArray;
  } else {
    updates.business_name = bizName;
  }

  const { error } = await supabaseClient
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) {
    showToast(error.message, 'error');
    button.disabled = false;
    button.textContent = 'Continue →';
  } else {
    showToast('Profile setup complete! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  }
});