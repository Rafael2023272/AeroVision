// ============================================
// GLOBAL VARIABLES
// ============================================
let lastScrollTop = 0;
let parallaxTicking = false;
let aircraftTicking = false;
let currentImageIndex = 0;
let sectionInView = false;
let isInteractive = false;

// ============================================
// AUTHENTICATION CHECK - PROTECT THIS PAGE
// ============================================
window.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('aerovision_token');
    const userData = JSON.parse(localStorage.getItem('aerovision_user'));

    if (!token || !userData) {
        alert('Please login to access the admin panel');
        window.location.href = 'account.html';
        return;
    }

    loadUserProfile(userData);
});

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
// NAVIGATION BAR - Hide/Show on Scroll
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
    
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
        return nameParts[0].substring(0, 2).toUpperCase();
    } else {
        return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
    }
}

// ============================================
// USER PROFILE MANAGEMENT
// ============================================
function loadUserProfile(userData) {
    const initials = getInitials(userData.name);

    const avatarElement = document.getElementById('userAvatar');
    if (userData.picture && userData.loginMethod === 'google') {
        avatarElement.innerHTML = `<img src="${userData.picture}" alt="${userData.name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    } else {
        avatarElement.textContent = initials;
    }

    document.getElementById('userName').textContent = userData.name || 'User';

    const roleElement = document.getElementById('userRole');
    roleElement.textContent = userData.role || 'Aviation Enthusiast';

    const headerLeft = document.querySelector('.header-left h1');
    if (headerLeft) {
        const firstName = userData.name.split(' ')[0];
        headerLeft.textContent = `Welcome back, ${firstName}!`;
    }
}

// ============================================
// LOGOUT MODAL FUNCTIONS
// ============================================
function showLogoutModal() {
    const modal = document.getElementById('logoutModal');
    modal.classList.add('show');
}

function closeLogoutModal() {
    const modal = document.getElementById('logoutModal');
    modal.classList.remove('show');
}

document.getElementById('logoutModal').addEventListener('click', function(e) {
    if (e.target === this) closeLogoutModal();
});

function confirmLogout() {
    localStorage.removeItem('aerovision_token');
    localStorage.removeItem('aerovision_user');

    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
}

// ============================================
// NOTIFICATION BELL ANIMATION
// ============================================
const notificationBell = document.querySelector('.notification-bell');
if (notificationBell) {
    notificationBell.addEventListener('click', function() {
        this.style.animation = 'none';
        setTimeout(() => {
            this.style.animation = '';
        }, 10);
    });
}
