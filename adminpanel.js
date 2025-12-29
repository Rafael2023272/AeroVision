// ============================================
// GLOBAL VARIABLES
// ============================================
let lastScrollTop = 0;
let currentImageIndex = 0;

// ============================================
// AUTHENTICATION CHECK - PROTECT ADMIN PAGE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('aerovision_token');
    const userData = localStorage.getItem('aerovision_user');

    if (!token || !userData) {
        window.location.href = 'account.html';
        return;
    }

    const user = JSON.parse(userData);
    loadUserProfile(user);
    setupNavbarProfile(user);
    attachSaveButtons();
});

// ============================================
// NAVBAR PROFILE BUTTON (USERNAME + AVATAR)
// ============================================
function setupNavbarProfile(user) {
    const profileBtn = document.getElementById('nav-profile-btn');
    if (!profileBtn) return;

    const initials = getInitials(user.name);

    profileBtn.innerHTML = `
        <div class="nav-avatar">${initials}</div>
        <span class="nav-username">${user.name}</span>
    `;

    profileBtn.style.display = 'flex';

    profileBtn.addEventListener('click', () => {
        window.location.href = 'admin.html';
    });
}

// ============================================
// NAVIGATION MENU - Toggle & Click Outside
// ============================================
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) navLinks.classList.toggle('active');
}

document.addEventListener('click', function(event) {
    const nav = document.querySelector('nav');
    const navLinks = document.getElementById('navLinks');
    if (nav && navLinks && !nav.contains(event.target)) {
        navLinks.classList.remove('active');
    }
});

// ============================================
// NAVBAR - Hide/Show on Scroll
// ============================================
const nav = document.querySelector('nav');
const scrollThreshold = 100;

window.addEventListener('scroll', () => {
    if (!nav) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > 50) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');

    if (scrollTop > scrollThreshold) {
        if (scrollTop > lastScrollTop) nav.classList.add('nav-hidden');
        else nav.classList.remove('nav-hidden');
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}, false);

// ============================================
// AVATAR INITIALS GENERATOR
// ============================================
function getInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length === 1
        ? parts[0].substring(0, 2).toUpperCase()
        : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ============================================
// USER PROFILE MANAGEMENT
// ============================================
function loadUserProfile(user) {
    const initials = getInitials(user.name);

    const avatarElement = document.getElementById('userAvatar');
    if (avatarElement) avatarElement.textContent = initials;

    const nameEl = document.getElementById('userName');
    if (nameEl) nameEl.textContent = user.name || 'User';

    const roleEl = document.getElementById('userRole');
    if (roleEl) roleEl.textContent = user.role || 'Aviation Enthusiast';

    const headerLeft = document.querySelector('.header-left h1');
    if (headerLeft) {
        headerLeft.textContent = `Welcome back, ${user.name.split(' ')[0]}!`;
    }
}

// ============================================
// LOGOUT MODAL & FUNCTIONS
// ============================================
function showLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) modal.classList.add('show');
}

function closeLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) modal.classList.remove('show');
}

const logoutModal = document.getElementById('logoutModal');
if (logoutModal) {
    logoutModal.addEventListener('click', function(e) {
        if (e.target === this) closeLogoutModal();
    });
}

function confirmLogout() {
    localStorage.removeItem('aerovision_token');
    localStorage.removeItem('aerovision_user');
    window.location.href = 'index.html';
}

// ============================================
// NOTIFICATION BELL ANIMATION
// ============================================
const notificationBell = document.querySelector('.notification-bell');
if (notificationBell) {
    notificationBell.addEventListener('click', function() {
        this.style.animation = 'none';
        setTimeout(() => { this.style.animation = ''; }, 10);
    });
}

// ============================================
// SAVE AIRCRAFT FUNCTION
// ============================================
async function saveAircraftCard(aircraftData) {
    const userData = localStorage.getItem('aerovision_user');
    if (!userData) {
        alert('Please log in to save aircraft.');
        return;
    }

    const user = JSON.parse(userData);

    try {
        const res = await fetch('http://localhost:4000/api/user/save-aircraft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                aircraft: aircraftData
            })
        });

        if (res.ok) {
            alert(`${aircraftData.name} saved to your dashboard!`);
        } else {
            alert('Failed to save aircraft.');
        }
    } catch (err) {
        console.error(err);
        alert('Error saving aircraft.');
    }
}

// ============================================
// ATTACH SAVE BUTTONS (SAFE)
// ============================================
function attachSaveButtons() {
    document.querySelectorAll('.save-btn').forEach(button => {
        button.addEventListener('click', e => {
            e.stopPropagation();

            const card = button.closest('.card-wrapper');
            if (!card) return;

            const aircraftData = {
                name: card.querySelector('.card-title')?.textContent || '',
                image: card.querySelector('img')?.src || '',
                passengers: card.querySelector('.spec-item:nth-child(1) .spec-value')?.textContent || '',
                cruiseSpeed: card.querySelector('.spec-item:nth-child(2) .spec-value')?.textContent || '',
                wingspan: card.querySelector('.spec-item:nth-child(3) .spec-value')?.textContent || '',
                fuselageWidth: card.querySelector('.spec-item:nth-child(4) .spec-value')?.textContent || '',
                maxAltitude: card.querySelector('.spec-item:nth-child(5) .spec-value')?.textContent || '',
                maxTakeoffWeight: card.querySelector('.spec-item:nth-child(6) .spec-value')?.textContent || '',
                length: card.querySelector('.spec-item:nth-child(7) .spec-value')?.textContent || '',
                range: card.querySelector('.spec-item:nth-child(8) .spec-value')?.textContent || '',
                cabinWidth: card.querySelector('.spec-item:nth-child(9) .spec-value')?.textContent || ''
            };

            saveAircraftCard(aircraftData);
        });
    });
}

// ============================================
// CARD FLIP HANDLER
// ============================================
document.addEventListener('click', e => {
    const card = e.target.closest('.card-wrapper .card');
    if (card) card.classList.toggle('flipped');
});
