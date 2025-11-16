// ============================================
// GLOBAL VARIABLES
// ============================================
let lastScrollTop = 0;
let parallaxTicking = false;  // Renamed to avoid conflict
let aircraftTicking = false;  // Renamed to avoid conflict
let currentImageIndex = 0;
let sectionInView = false;
let isInteractive = false;

// ============================================
// NAVIGATION MENU - Toggle & Click Outside
// ============================================
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// Close menu when clicking outside of navigation
document.addEventListener('click', function(event) {
    const nav = document.querySelector('nav');
    const navLinks = document.getElementById('navLinks');
    if (!nav.contains(event.target)) {
        navLinks.classList.remove('active');
    }
});

// ============================================
// NAVIGATION BAR - Hide/Show on Scroll
// ============================================
const nav = document.querySelector('nav');
const scrollThreshold = 100; // Start hiding after scrolling 100px

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add scrolled class for background change
    if (scrollTop > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
    
    // Hide/show navigation based on scroll direction
    if (scrollTop > scrollThreshold) {
        if (scrollTop > lastScrollTop) {
            // Scrolling down - hide nav
            nav.classList.add('nav-hidden');
        } else {
            // Scrolling up - show nav
            nav.classList.remove('nav-hidden');
        }
    }
    
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}, false);


      const navbar = document.querySelector('nav');
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        // Add/remove scrolled background
        if (currentScroll > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        // Hide on scroll down, show on scroll up
        if (currentScroll > lastScroll && currentScroll > 100) {
            nav.classList.add('nav-hidden');
        } else {
            nav.classList.remove('nav-hidden');
        }

        lastScroll = currentScroll;
        });

        // Check if user is logged in
    function checkLoginState() {
        const userData = localStorage.getItem('aerovision_user');
        const loginButton = document.getElementById('login-button'); // Your login button
        const userProfile = document.getElementById('user-profile'); // User profile element (create this)
        
        if (userData) {
            const user = JSON.parse(userData);
            
            // Hide login button
            if (loginButton) {
                loginButton.style.display = 'none';
            }
            
            // Show user profile/avatar
            if (userProfile) {
                userProfile.style.display = 'flex';
                userProfile.innerHTML = `
                    <div class="nav-user-avatar">${user.avatar}</div>
                    <span>${user.name}</span>
                `;
            }
        } else {
            // Show login button
            if (loginButton) {
                loginButton.style.display = 'block';
            }
            
            // Hide user profile
            if (userProfile) {
                userProfile.style.display = 'none';
            }
        }
    }
    
    // Run on page load
    checkLoginState();