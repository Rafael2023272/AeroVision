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
 
 
 
 function logout() {
            if (confirm('Are you sure you want to log out?')) {
                // Add smooth fade out animation
                document.body.style.opacity = '0';
                document.body.style.transition = 'opacity 0.5s ease';
                
                setTimeout(() => {
                    // Redirect back to login page
                    window.location.href = 'index.html'; // Change to your login page URL
                }, 500);
            }
        }

        // Add notification bell animation on click
        document.querySelector('.notification-bell').addEventListener('click', function() {
            this.style.animation = 'none';
            setTimeout(() => {
                this.style.animation = '';
            }, 10);
        });