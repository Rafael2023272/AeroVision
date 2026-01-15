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

    document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-button");
  const userProfile = document.getElementById("user-profile");
  const navUsername = document.getElementById("nav-username");

  const fullName = localStorage.getItem("username");

  if (fullName) {
    const firstName = fullName.split(" ")[0];

    navUsername.textContent = `Hi ${firstName}`;

    loginBtn.style.display = "none";
    userProfile.style.display = "flex";
  } else {
    loginBtn.style.display = "inline-block";
    userProfile.style.display = "none";
  }
});


// ==============================================
// BURGER MENU 
// ==============================================

// Toggle mobile menu
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.querySelector('.hamburger');
    
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
    
    // Move auth buttons to mobile menu
    moveAuthToMobile();
}

// Move auth elements based on screen size
function moveAuthToMobile() {
    const navLinks = document.getElementById('navLinks');
    const navActions = document.querySelector('.nav-actions');
    const loginButton = document.getElementById('login-button');
    const userProfile = document.getElementById('user-profile');
    
    // Check if we're on mobile/tablet (1024px and below)
    if (window.innerWidth <= 1024) {
        // Check if mobile-auth container exists, if not create it
        let mobileAuth = navLinks.querySelector('.mobile-auth');
        if (!mobileAuth) {
            mobileAuth = document.createElement('li');
            mobileAuth.className = 'mobile-auth';
            navLinks.appendChild(mobileAuth);
        }
        
        // Move login button and user profile to mobile menu
        if (loginButton && !mobileAuth.contains(loginButton)) {
            mobileAuth.appendChild(loginButton);
        }
        if (userProfile && !mobileAuth.contains(userProfile)) {
            mobileAuth.appendChild(userProfile);
        }
    } else {
        // Move back to nav-actions on desktop (above 1024px)
        if (loginButton && !navActions.contains(loginButton)) {
            navActions.appendChild(loginButton);
        }
        if (userProfile && !navActions.contains(userProfile)) {
            navActions.appendChild(userProfile);
        }
        
        // Remove mobile-auth container if it exists
        const mobileAuth = navLinks.querySelector('.mobile-auth');
        if (mobileAuth) {
            mobileAuth.remove();
        }
    }
}

// Close menu when clicking on a link
document.addEventListener('DOMContentLoaded', () => {
    // Initialize auth placement
    moveAuthToMobile();
    
    // Add click handlers to nav links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            const navLinks = document.getElementById('navLinks');
            const hamburger = document.querySelector('.hamburger');
            
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    const nav = document.querySelector('nav');
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.querySelector('.hamburger');
    
    if (!nav.contains(e.target) && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// Re-check on window resize
window.addEventListener('resize', () => {
    moveAuthToMobile();
    
    // Close menu if resized to desktop
    if (window.innerWidth > 1024) {
        const navLinks = document.getElementById('navLinks');
        const hamburger = document.querySelector('.hamburger');
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    }
});