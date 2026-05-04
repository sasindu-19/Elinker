// --- Login/Signup Toggle ---
const wrapper = document.querySelector('.wrapper');
const registerlink = document.querySelector('.register-link');
const loginlink = document.querySelector('.login-link');

if (registerlink) {
    registerlink.onclick = () => {
        if (wrapper) wrapper.classList.add('active');
    }
}

if (loginlink) {
    loginlink.onclick = () => {
        if (wrapper) wrapper.classList.remove('active');
    }
}

function goToSignup() {
    window.location.href = "signup.html";
}

// --- Toggle Password Visibility ---
const passwordToggles = document.querySelectorAll('.password-toggle');
if (passwordToggles.length > 0) {
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function () {
            const parent = this.parentElement;
            const passwordInput = parent.querySelector('input');

            if (passwordInput && passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.classList.remove('bx-hide');
                this.classList.add('bx-show');
            } else if (passwordInput) {
                passwordInput.type = 'password';
                this.classList.remove('bx-show');
                this.classList.add('bx-hide');
            }
        });
    });
}

// --- Mobile Navbar Toggle ---
const toggleBtn = document.querySelector('.toggle_btn')
const toggleBtnIcon = document.querySelector('.toggle_btn i')
const dropDownMenu = document.querySelector('.dropdown_menu')

if (toggleBtn && toggleBtnIcon && dropDownMenu) {
    toggleBtn.onclick = function () {
        dropDownMenu.classList.toggle('open')
        const isOpen = dropDownMenu.classList.contains('open')
        toggleBtnIcon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'
    }
}

// --- Auth State & Navbar Profile ---
if (typeof getCurrentUser !== 'undefined') {
    (async () => {
        try {
            const user = await getCurrentUser();
            const loginBtnLink = document.getElementById('login-btn-link');
            const loginBtnLinkMobile = document.getElementById('login-btn-link-mobile');
            const profileArea = document.getElementById('profile-area');

            if (user) {
                if (loginBtnLink) loginBtnLink.style.display = 'none';
                if (loginBtnLinkMobile) loginBtnLinkMobile.style.display = 'none';
                if (profileArea) profileArea.style.display = 'flex';

                const profile = await getUserProfile(user.id);
                // Redirect if missing gender or dob and NOT on signup page
                if (profile && (!profile.gender || !profile.dob) && !window.location.pathname.includes('signup.html')) {
                    window.location.href = 'signup.html';
                    return;
                }
                const name = profile?.full_name || user.email.split('@')[0];
                const type = profile?.user_type || 'User';
                const email = user.email;
                const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2);
                const displayType = type.charAt(0).toUpperCase() + type.slice(1);

                const profileAvatar = document.getElementById('profile-avatar');
                if (profileAvatar) profileAvatar.textContent = initials;

                const profileDisplayName = document.getElementById('profile-display-name');
                if (profileDisplayName) profileDisplayName.textContent = name;

                const profileDisplayType = document.getElementById('profile-display-type');
                if (profileDisplayType) profileDisplayType.textContent = displayType;

                const ddName = document.getElementById('dd-name');
                if (ddName) ddName.textContent = name;

                const ddEmail = document.getElementById('dd-email');
                if (ddEmail) ddEmail.textContent = email;

                const badge = document.getElementById('dd-badge');
                if (badge) {
                    badge.textContent = displayType;
                    badge.className = 'dh-badge ' + type.toLowerCase();
                }

                if (type.toLowerCase() === 'worker') {
                    const postLink = document.getElementById('post-job-link');
                    const postLinkMobile = document.getElementById('post-job-link-mobile');
                    const postFooter = document.getElementById('post-job-link-footer');
                    const ctaPostJob = document.getElementById('cta-post-job');
                    if (postLink) postLink.style.display = 'none';
                    if (postLinkMobile) postLinkMobile.style.display = 'none';
                    if (postFooter) postFooter.style.display = 'none';
                    if (ctaPostJob) ctaPostJob.style.display = 'none';
                }

                const profileToggle = document.getElementById('profile-toggle');
                if (profileToggle) {
                    profileToggle.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const pd = document.getElementById('profile-dropdown');
                        if (pd) pd.classList.toggle('show');
                    });
                }

                const profileDropdown = document.getElementById('profile-dropdown');
                if (profileDropdown) {
                    document.addEventListener('click', () => {
                        profileDropdown.classList.remove('show');
                    });
                }

                const logoutBtn = document.getElementById('logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const btn = e.currentTarget;
                        const originalHtml = btn.innerHTML;
                        btn.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Logging out...";
                        try {
                            await logoutUser();
                        } catch (err) {
                            console.error("Logout failed:", err);
                            btn.innerHTML = originalHtml;
                        }
                    });
                }
            } else {
                if (loginBtnLink) loginBtnLink.style.display = '';
                if (loginBtnLinkMobile) loginBtnLinkMobile.style.display = 'block';
                if (profileArea) profileArea.style.display = 'none';
            }
        } catch (e) {
            console.error("Error checking auth state: ", e);
        }
    })();
}

// --- Index Page Stats & Reviews ---
if (document.querySelector('.stats-section') || document.getElementById('testimonials-container')) {
    (async () => {
        let memberCount = 540;
        let jobCount = 1250;
        let viewCount = 85;
        let hasK = true;

        try {
            if (typeof supabaseClient !== 'undefined') {
                // 1. Increment page view
                await supabaseClient.rpc('increment_page_view', { p_page_name: 'index' });

                // 2. Fetch counts
                const [profilesRes, jobsRes, viewsRes] = await Promise.all([
                    supabaseClient.from('profiles').select('*', { count: 'exact', head: true }),
                    supabaseClient.from('jobs').select('*', { count: 'exact', head: true }),
                    supabaseClient.from('site_stats').select('view_count').eq('page_name', 'index').single()
                ]);

                if (profilesRes.count !== null) {
                    memberCount = profilesRes.count;
                    const memberPlus = document.querySelector('#members + .stat-plus');
                    if (memberPlus) memberPlus.textContent = '';
                }
                if (jobsRes.count !== null) {
                    jobCount = jobsRes.count;
                    const jobPlus = document.querySelector('#comments + .stat-plus');
                    if (jobPlus) jobPlus.textContent = '';
                }

                if (viewsRes.data) {
                    const realViews = viewsRes.data.view_count;
                    if (realViews >= 1000) {
                        viewCount = Math.floor(realViews / 100) / 10;
                        hasK = true;
                    } else {
                        viewCount = realViews;
                        hasK = false;
                    }
                    const viewPlus = document.querySelector('#views + .stat-plus');
                    if (viewPlus) viewPlus.textContent = hasK ? 'K' : '';
                }
            }
        } catch (err) {
            console.error("Error fetching stats:", err);
        }

        const statsToAnimate = [
            { id: 'members', target: memberCount, isFloat: false },
            { id: 'comments', target: jobCount, isFloat: false },
            { id: 'views', target: viewCount, isFloat: hasK && (viewCount % 1 !== 0) }
        ];

        const animateValue = (obj, start, end, duration, isFloat = false) => {
            let startTimestamp = null;
            const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                const val = easeProgress * (end - start) + start;
                obj.innerHTML = isFloat ? val.toFixed(1) : Math.floor(val);
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        };

        const statsSection = document.querySelector('.stats-section');
        if (statsSection) {
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    statsToAnimate.forEach(stat => {
                        const el = document.getElementById(stat.id);
                        if (el) {
                            animateValue(el, 0, stat.target, 2500, stat.isFloat);
                        }
                    });
                    const satRateEl = document.querySelector('.stat-item:last-child .stat-number');
                    if (satRateEl) {
                        animateValue(satRateEl, 0, 100, 2500);
                    }
                    observer.disconnect();
                }
            }, { threshold: 0.3 });
            observer.observe(statsSection);
        }

        let allReviews = [];
        let reviewIndex = 0;

        const loadIndexReviews = async () => {
            const container = document.getElementById('testimonials-container');
            if (!container || typeof supabaseClient === 'undefined') return;

            const { data: reviews, error } = await supabaseClient
                .from('reviews')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error loading reviews for index:", error);
                return;
            }

            if (!reviews || reviews.length === 0) {
                container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No reviews yet. Be the first to leave one!</p>';
                return;
            }

            allReviews = reviews;
            if (container.querySelector('.loading-reviews')) {
                updateReviewDisplay();
            }
        };

        const updateReviewDisplay = () => {
            const container = document.getElementById('testimonials-container');
            if (!container || allReviews.length === 0) return;

            const cards = container.querySelectorAll('.testimonial-card');

            cards.forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(10px)';
            });

            setTimeout(() => {
                let html = '';
                const displayCount = Math.min(3, allReviews.length);

                for (let i = 0; i < displayCount; i++) {
                    const r = allReviews[(reviewIndex + i) % allReviews.length];
                    let starsHtml = '';
                    for (let j = 1; j <= 5; j++) {
                        starsHtml += j <= r.rating ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';
                    }
                    const initial = r.reviewer_name.charAt(0).toUpperCase();
                    const isFeatured = i === 1 ? 'tc-featured' : '';

                    html += `
                        <div class="testimonial-card ${isFeatured}" style="opacity: 0; transform: translateY(10px); transition: opacity 0.6s ease, transform 0.6s ease;">
                        <div class="tcard-top">
                            <div class="tcard-avatar">${initial}</div>
                            <div>
                            <h4 class="tcard-name">${r.reviewer_name}</h4>
                            <div class="tcard-stars">${starsHtml}</div>
                            </div>
                            <div class="tcard-quote-icon"><i class="fa-solid fa-quote-right"></i></div>
                        </div>
                        <p class="tcard-text">"${r.review_text}"</p>
                        <div class="tcard-tag">Verified User</div>
                        </div>
                    `;
                }
                container.innerHTML = html;

                setTimeout(() => {
                    const newCards = container.querySelectorAll('.testimonial-card');
                    newCards.forEach((card, idx) => {
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, idx * 100);
                    });
                }, 50);

                reviewIndex = (reviewIndex + 1) % allReviews.length;
            }, cards.length > 0 ? 600 : 0);
        };

        loadIndexReviews();
        setInterval(updateReviewDisplay, 5000);
        setInterval(loadIndexReviews, 30000);
    })();
}

// --- AOS Initialization ---
if (typeof AOS !== 'undefined') {
    // If there is an AOS settings script inline, we will let that run instead or apply default here.
    // Assuming mostly default
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 80,
            easing: 'ease-out-cubic',
            delay: 0,
            anchorPlacement: 'top-bottom'
        });
    } else {
        AOS.init();
    }

}
// --- Scroll to Top Button (index & jobs only) ---
document.addEventListener('DOMContentLoaded', () => {
    const page = window.location.pathname;
    const allowedPages = ['/', '/index.html', '/jobs.html'];
    const isAllowed = allowedPages.some(p => page === p || page.endsWith(p));
    if (!isAllowed) return;

    // Inject CSS dynamically
    const style = document.createElement('style');
    style.innerHTML = `
        .scroll-top-btn {
            position: fixed;
            bottom: 90px; /* 24px gap + 56px chatbot height + 10px gap */
            right: 24px;
            width: 56px;
            height: 56px;
            border-radius: 9999px;
            border: none;
            background: linear-gradient(#227ff873 40%, #7c6bff 100%);
            color: #fff;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 25px rgba(9, 25, 238, 0.884);
            font-size: 26px;
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
            transition: opacity 0.25s ease, visibility 0.25s ease, transform 0.25s ease;
            z-index: 999999;
        }

        .scroll-top-btn.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        .scroll-top-btn:hover {
            transform: scale(1.05);
        }

        .scroll-top-btn:active {
            transform: scale(0.95);
        }
    `;
    document.head.appendChild(style);

    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = "<i class='bx bx-up-arrow-alt'></i>";
    scrollBtn.className = "scroll-top-btn";
    document.body.appendChild(scrollBtn);

    // Track scroll visibility separately from chatbot state
    let scrolledDown = false;

    window.addEventListener('scroll', () => {
        scrolledDown = window.scrollY > 300;
        updateScrollBtnVisibility();
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Hide scroll-to-top when chatbot is open
    function updateScrollBtnVisibility() {
        const chatToggle = document.querySelector('.chat-toggle');
        const isChatOpen = chatToggle && chatToggle.classList.contains('open');
        if (scrolledDown && !isChatOpen) {
            scrollBtn.classList.add('show');
        } else {
            scrollBtn.classList.remove('show');
        }
    }

    // Watch for chatbot open/close using MutationObserver
    const observer = new MutationObserver(() => updateScrollBtnVisibility());
    const chatToggleTarget = document.querySelector('.chat-toggle');
    if (chatToggleTarget) {
        observer.observe(chatToggleTarget, { attributes: true, attributeFilter: ['class'] });
    }
});