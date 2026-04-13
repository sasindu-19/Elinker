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

  checkbox.addEventListener('change', function() {
    button.disabled = !this.checked;
  });