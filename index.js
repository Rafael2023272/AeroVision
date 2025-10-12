   
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


        const aircraftImage = document.getElementById('aircraftImage');
        const aircraftContainer = document.getElementById('aircraftContainer');
        const featuredHeader = document.getElementById('featuredHeader');
        const titleSection = document.getElementById('titleSection');
        const annotations = document.querySelectorAll('.annotation');
        const interactionHint = document.getElementById('interactionHint');
        const descriptionSection = document.getElementById('descriptionSection');
        const scrollSection = document.querySelector('.scroll-section');

        let isDragging = false;
        let startX = 0;
        let currentRotationY = 0;
        let targetRotationY = 0;
        let isInteractive = false;
        let sectionStartOffset = 0;
        let sectionInView = false;

        let ticking = false;

        // Detect when section enters viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    sectionInView = true;
                    sectionStartOffset = window.pageYOffset;
                } else {
                    sectionInView = false;
                }
            });
        }, { threshold: 0.1 });

        observer.observe(scrollSection);

        function updateAnimation() {
            // Only animate when section is in view
            if (!sectionInView) {
                ticking = false;
                return;
            }

            const scrollTop = window.pageYOffset;
            const sectionTop = scrollSection.getBoundingClientRect().top + scrollTop;
            const sectionHeight = scrollSection.offsetHeight;
            
            // Calculate scroll position relative to THIS section
            const relativeScroll = scrollTop - sectionTop + window.innerHeight;
            const maxScroll = sectionHeight;
            const scrollFraction = Math.max(0, Math.min(relativeScroll / maxScroll, 1));

            // Phase 1: Show featured header and title (0-15%)
            if (scrollFraction > 0.05) {
                featuredHeader.classList.add('visible');
                titleSection.classList.add('visible');
            } else {
                featuredHeader.classList.remove('visible');
                titleSection.classList.remove('visible');
            }

            // Phase 2: Reveal aircraft (15-40%)
            if (scrollFraction > 0.15 && scrollFraction < 0.4) {
                aircraftImage.classList.add('revealed');
                
                if (!isInteractive) {
                    const revealProgress = (scrollFraction - 0.15) / 0.25;
                    const scale = 0.3 + (revealProgress * 0.7);
                    const translateY = 100 - (revealProgress * 100);
                    const rotateY = -45 + (revealProgress * 45);
                    const rotateX = 15 - (revealProgress * 15);
                    
                    aircraftImage.style.transform = `scale(${scale}) translateY(${translateY}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
                }
            }

            // Phase 3: Make interactive (40%+)
            if (scrollFraction >= 0.4) {
                isInteractive = true;
                aircraftImage.classList.add('interactive');
                interactionHint.classList.add('visible');
            } else {
                isInteractive = false;
                aircraftImage.classList.remove('interactive');
                interactionHint.classList.remove('visible');
            }

            // Phase 4: Show annotations (50%+)
            const annotationDelay = 0.06;
            annotations.forEach((annotation, index) => {
                const showAt = 0.5 + (index * annotationDelay);
                
                if (scrollFraction > showAt) {
                    annotation.classList.add('visible');
                } else {
                    annotation.classList.remove('visible');
                }
            });

            // Phase 5: Show description (70%+)
            if (scrollFraction > 0.7) {
                descriptionSection.classList.add('visible');
            } else {
                descriptionSection.classList.remove('visible');
            }

            ticking = false;
        }

        function requestTick() {
            if (!ticking) {
                requestAnimationFrame(updateAnimation);
                ticking = true;
            }
        }

        // Mouse/Touch rotation controls
        function startDrag(e) {
            if (!isInteractive) return;
            isDragging = true;
            startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            interactionHint.classList.add('hidden');
        }

        function drag(e) {
            if (!isDragging || !isInteractive) return;
            e.preventDefault();
            
            const currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            const deltaX = currentX - startX;
            
            targetRotationY = currentRotationY + (deltaX * 0.5);
            aircraftImage.style.transform = `scale(1) translateY(0) rotateY(${targetRotationY}deg)`;
        }

        function endDrag() {
            if (isDragging) {
                currentRotationY = targetRotationY;
            }
            isDragging = false;
        }

        // Mouse events
        aircraftContainer.addEventListener('mousedown', startDrag);
        window.addEventListener('mousemove', drag);
        window.addEventListener('mouseup', endDrag);

        // Touch events
        aircraftContainer.addEventListener('touchstart', startDrag);
        window.addEventListener('touchmove', drag, { passive: false });
        window.addEventListener('touchend', endDrag);

        // Scroll listener
        window.addEventListener('scroll', requestTick);
        window.addEventListener('resize', updateAnimation);

        // Initial update
        updateAnimation();