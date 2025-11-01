
 const nav = document.querySelector('nav');
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
            

// ============================================
// CARD PARALLAX EFFECT - Mouse Movement
// ============================================
document.addEventListener('mousemove', (e) => {
    // Only target cards that are NOT flip cards
    const cards = document.querySelectorAll('.card:not(.card-wrapper .card)');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    cards.forEach((card, index) => {
        const speed = (index + 1) * 0.5;
        const xMove = (x - 0.5) * speed;
        const yMove = (y - 0.5) * speed;
        
        card.style.transform = `translateX(${xMove}px) translateY(${yMove}px)`;
    });
});

// Reset card transform on mouse leave
document.addEventListener('mouseleave', () => {
    const cards = document.querySelectorAll('.card:not(.card-wrapper .card)');
    cards.forEach(card => {
        card.style.transform = '';
    });
});

// ============================================
// CARD CLICK ANIMATION - Pulse Effect
// ============================================
document.querySelectorAll('.card:not(.card-wrapper .card)').forEach(card => {
    card.addEventListener('click', function() {
        // Reset animation
        this.style.animation = 'none';
        setTimeout(() => {
            this.style.animation = '';
        }, 10);
        
        // Pulse effect
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 200);
    });
});

// ============================================
// PARALLAX SCROLL EFFECT - Multi-speed layers
// ============================================
function handleParallax() {
    const scrolled = window.pageYOffset;
    
    // Apply slow parallax speed (30% of scroll speed)
    document.querySelectorAll('.parallax-slow').forEach(el => {
        const rect = el.getBoundingClientRect();
        const elementTop = rect.top + scrolled;
        const speed = 0.3;
        const yPos = -(scrolled - elementTop) * speed;
        el.style.transform = `translateY(${yPos}px)`;
    });

    // Apply medium parallax speed (15% of scroll speed)
    document.querySelectorAll('.parallax-medium').forEach(el => {
        const rect = el.getBoundingClientRect();
        const elementTop = rect.top + scrolled;
        const speed = 0.15;
        const yPos = -(scrolled - elementTop) * speed;
        el.style.transform = `translateY(${yPos}px)`;
    });

    // Apply fast parallax speed (50% of scroll speed)
    document.querySelectorAll('.parallax-fast').forEach(el => {
        const rect = el.getBoundingClientRect();
        const elementTop = rect.top + scrolled;
        const speed = 0.5;
        const yPos = -(scrolled - elementTop) * speed;
        el.style.transform = `translateY(${yPos}px)`;
    });

    // Scale effect on images as they enter viewport
    document.querySelectorAll('.scale-on-scroll').forEach(el => {
        const rect = el.getBoundingClientRect();
        const elementTop = rect.top;
        const elementHeight = rect.height;
        const windowHeight = window.innerHeight;
        
        // Only scale if element is in viewport
        if (elementTop < windowHeight && elementTop > -elementHeight) {
            const progress = (windowHeight - elementTop) / (windowHeight + elementHeight);
            const scale = 1 + (progress * 0.1);
            const currentTransform = el.style.transform;
            const translateMatch = currentTransform.match(/translateY\(([^)]+)\)/);
            const translateY = translateMatch ? translateMatch[1] : '0px';
            el.style.transform = `translateY(${translateY}) scale(${Math.min(scale, 1.15)})`;
        }
    });
}

// ============================================
// FADE IN ON SCROLL - Element visibility
// ============================================
function handleFadeIn() {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    fadeElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const elementTop = rect.top;
        const elementBottom = rect.bottom;
        
        // Show elements when they're 75% into viewport
        if (elementTop < window.innerHeight * 0.75 && elementBottom > 0) {
            el.classList.add('visible');
        }
    });
}

// ============================================
// PARALLAX SCROLL HANDLER - Performance optimization
// ============================================
function onParallaxScroll() {
    if (!parallaxTicking) {
        window.requestAnimationFrame(() => {
            handleParallax();
            handleFadeIn();
            parallaxTicking = false;
        });
        parallaxTicking = true;
    }
}

// Event listeners for parallax
window.addEventListener('scroll', onParallaxScroll);
window.addEventListener('load', () => {
    handleFadeIn();
    handleParallax();
});

// Initial call for parallax
handleFadeIn();
handleParallax();

// ============================================
// PAGE TRANSITION - Fade out effect
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const newsBtn = document.querySelector('.news-btn');
    
    if (newsBtn) {
        newsBtn.addEventListener('click', () => {
            // Add fade-out class
            document.body.classList.add('fade-out');
            
            // Wait for fade to finish, then redirect
            setTimeout(() => {
                window.location.href = 'news.html';
            }, 600); // Same as CSS transition duration
        });
    }
});

// ============================================
// AIRCRAFT SHOWCASE SECTION - Main variables
// ============================================

let currentImageIndex = 0; // ADD THIS LINE
let isInteractive = false; // ADD THIS LINE
let sectionInView = false; // ADD THIS LINE
let aircraftTicking = false; // ADD THIS LINE
let parallaxTicking = false; // ADD THIS LINE (if not already there)

const aircraftImages = document.querySelectorAll('.aircraft-image');
const aircraftWrapper = document.getElementById('aircraftWrapper');
const aircraftContainer = document.getElementById('aircraftContainer');
const featuredHeader = document.getElementById('featuredHeader');
const titleSection = document.getElementById('titleSection');
const annotations = document.querySelectorAll('.annotation');
const descriptionSection = document.getElementById('descriptionSection');
const scrollSection = document.querySelector('.scroll-section');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const indicatorsContainer = document.getElementById('indicators');

// ============================================
// AIRCRAFT INDICATORS - Create navigation dots
// ============================================
function createIndicators() {
    if (!indicatorsContainer) return;
    
    aircraftImages.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'indicator-dot';
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => changeImage(index));
        indicatorsContainer.appendChild(dot);
    });
}

// ============================================
// AIRCRAFT IMAGE CHANGER - Switch between images
// ============================================
function changeImage(index) {
    // Handle index bounds
    if (index < 0) index = aircraftImages.length - 1;
    if (index >= aircraftImages.length) index = 0;
    
    // Hide all images
    aircraftImages.forEach(img => {
        img.classList.remove('active');
    });
    
    // Show selected image
    currentImageIndex = index;
    aircraftImages[currentImageIndex].classList.add('active');
    
    // Update indicators
    document.querySelectorAll('.indicator-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentImageIndex);
    });
}

// ============================================
// AIRCRAFT NAVIGATION - Prev/Next buttons
// ============================================
if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => changeImage(currentImageIndex - 1));
    nextBtn.addEventListener('click', () => changeImage(currentImageIndex + 1));
}

// ============================================
// AIRCRAFT PARALLAX - Mouse movement effect
// ============================================
if (aircraftContainer && aircraftWrapper) {
    // Mouse movement parallax
    aircraftContainer.addEventListener('mousemove', (e) => {
        if (!isInteractive) return;
        
        const rect = aircraftContainer.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        
        const moveX = x * 30;
        const moveY = y * 30;
        const rotateX = y * -10;
        const rotateY = x * 10;
        
        aircraftWrapper.style.transform = `translateX(${moveX}px) translateY(${moveY}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    // Reset position when mouse leaves
    aircraftContainer.addEventListener('mouseleave', () => {
        if (!isInteractive) return;
        aircraftWrapper.style.transform = 'translateX(0) translateY(0) rotateX(0) rotateY(0)';
    });
}

// ============================================
// AIRCRAFT SECTION OBSERVER - Detect when in viewport
// ============================================
if (scrollSection) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            sectionInView = entry.isIntersecting;
        });
    }, { threshold: 0.1 });

    observer.observe(scrollSection);
}

// ============================================
// AIRCRAFT SCROLL ANIMATION - Phase-based reveals
// ============================================
function updateAircraftAnimation() {
    if (!sectionInView) {
        aircraftTicking = false;
        return;
    }

    const scrollTop = window.pageYOffset;
    const sectionTop = scrollSection.getBoundingClientRect().top + scrollTop;
    const sectionHeight = scrollSection.offsetHeight;
    
    const relativeScroll = scrollTop - sectionTop + window.innerHeight;
    const maxScroll = sectionHeight;
    const scrollFraction = Math.max(0, Math.min(relativeScroll / maxScroll, 1));

    // Phase 1: Show headers (5%+)
    if (scrollFraction > 0.05) {
        if (featuredHeader) featuredHeader.classList.add('visible');
        if (titleSection) titleSection.classList.add('visible');
    } else {
        if (featuredHeader) featuredHeader.classList.remove('visible');
        if (titleSection) titleSection.classList.remove('visible');
    }

    // Phase 2: Reveal aircraft (15%+)
    if (scrollFraction > 0.15) {
        aircraftImages.forEach(img => img.classList.add('revealed'));
    }

    // Phase 3: Make interactive and show controls (35%+)
    if (scrollFraction >= 0.35) {
        isInteractive = true;
        if (prevBtn) prevBtn.classList.add('visible');
        if (nextBtn) nextBtn.classList.add('visible');
        if (indicatorsContainer) indicatorsContainer.classList.add('visible');
    } else {
        isInteractive = false;
        if (prevBtn) prevBtn.classList.remove('visible');
        if (nextBtn) nextBtn.classList.remove('visible');
        if (indicatorsContainer) indicatorsContainer.classList.remove('visible');
    }

    // Phase 4: Show annotations (50%+)
    const annotationDelay = 0.06;
    annotations.forEach((annotation, index) => {
        const showAt = 0.5 + (index * annotationDelay);
        annotation.classList.toggle('visible', scrollFraction > showAt);
    });

    // Phase 5: Show description (70%+)
    if (descriptionSection) {
        descriptionSection.classList.toggle('visible', scrollFraction > 0.7);
    }

    aircraftTicking = false;
}

// ============================================
// AIRCRAFT SCROLL HANDLER - Performance optimization
// ============================================
function requestAircraftTick() {
    if (!aircraftTicking && scrollSection) {
        requestAnimationFrame(updateAircraftAnimation);
        aircraftTicking = true;
    }
}

window.addEventListener('scroll', requestAircraftTick);
window.addEventListener('resize', updateAircraftAnimation);

// ============================================
// INTERSECTION OBSERVER - Fade in elements
// ============================================
document.addEventListener("DOMContentLoaded", function () {
    const elements = document.querySelectorAll(".container, header, .card");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    elements.forEach(el => observer.observe(el));
    
    // Initialize aircraft showcase if elements exist
    if (indicatorsContainer) {
        createIndicators();
    }
    if (scrollSection) {
        updateAircraftAnimation();
    }
});
 // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, observerOptions);
        
        // Observe all cards
        document.querySelectorAll('.animate-on-scroll').forEach(card => {
            observer.observe(card);
        });