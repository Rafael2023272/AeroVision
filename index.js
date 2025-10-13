   
        function toggleMenu() {
            const navLinks = document.getElementById('navLinks');
            navLinks.classList.toggle('active');
        }

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const nav = document.querySelector('nav');
            const navLinks = document.getElementById('navLinks');
            if (!nav.contains(event.target)) {
                navLinks.classList.remove('active');
            }
        });
    


        // Add parallax effect to cards
        document.addEventListener('mousemove', (e) => {
            const cards = document.querySelectorAll('.card');
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;

            cards.forEach((card, index) => {
                const speed = (index + 1) * 0.5;
                const xMove = (x - 0.5) * speed;
                const yMove = (y - 0.5) * speed;
                
                card.style.transform = `translateX(${xMove}px) translateY(${yMove}px)`;
            });
        });

        // Reset transform on mouse leave
        document.addEventListener('mouseleave', () => {
            const cards = document.querySelectorAll('.card');
            cards.forEach(card => {
                card.style.transform = '';
            });
        });

        // Add click animation
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', function() {
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
  

    
        document.querySelector('.news-btn').addEventListener('click', () => {
            // Add fade-out class
            document.body.classList.add('fade-out');
            
            // Wait for fade to finish, then redirect
            setTimeout(() => {
            window.location.href = 'news.html';
            }, 600); // same as CSS transition duration
        });


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

        let currentImageIndex = 0;
        let sectionInView = false;
        let isInteractive = false;
        let ticking = false;

        // Create indicators based on number of images
        function createIndicators() {
            aircraftImages.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.className = 'indicator-dot';
                if (index === 0) dot.classList.add('active');
                dot.addEventListener('click', () => changeImage(index));
                indicatorsContainer.appendChild(dot);
            });
        }

        // Change image
        function changeImage(index) {
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

        // Navigation
        prevBtn.addEventListener('click', () => changeImage(currentImageIndex - 1));
        nextBtn.addEventListener('click', () => changeImage(currentImageIndex + 1));

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

        // Detect when section enters viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                sectionInView = entry.isIntersecting;
            });
        }, { threshold: 0.1 });

        observer.observe(scrollSection);

        function updateAnimation() {
            if (!sectionInView) {
                ticking = false;
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
                featuredHeader.classList.add('visible');
                titleSection.classList.add('visible');
            } else {
                featuredHeader.classList.remove('visible');
                titleSection.classList.remove('visible');
            }

            // Phase 2: Reveal aircraft (15%+)
            if (scrollFraction > 0.15) {
                aircraftImages.forEach(img => img.classList.add('revealed'));
            }

            // Phase 3: Make interactive and show controls (35%+)
            if (scrollFraction >= 0.35) {
                isInteractive = true;
                prevBtn.classList.add('visible');
                nextBtn.classList.add('visible');
                indicatorsContainer.classList.add('visible');
            } else {
                isInteractive = false;
                prevBtn.classList.remove('visible');
                nextBtn.classList.remove('visible');
                indicatorsContainer.classList.remove('visible');
            }

            // Phase 4: Show annotations (50%+)
            const annotationDelay = 0.06;
            annotations.forEach((annotation, index) => {
                const showAt = 0.5 + (index * annotationDelay);
                annotation.classList.toggle('visible', scrollFraction > showAt);
            });

            // Phase 5: Show description (70%+)
            descriptionSection.classList.toggle('visible', scrollFraction > 0.7);

            ticking = false;
        }

        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateAnimation);
                ticking = true;
            }
        }

        window.addEventListener('scroll', requestTick);
        window.addEventListener('resize', updateAnimation);

        // Initialize
        createIndicators();
        updateAnimation();