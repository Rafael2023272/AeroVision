 const authWrapper = document.getElementById('authWrapper');
        const authForm = document.getElementById('authForm');
        const formContent = document.getElementById('formContent');
        const formTitle = document.getElementById('formTitle');
        const formSubtitle = document.getElementById('formSubtitle');
        const submitBtn = document.getElementById('submitBtn');
        const switchText = document.getElementById('switchText');
        const switchLink = document.getElementById('switchLink');
        const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
        const notification = document.getElementById('notification');
        
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');

        let isLoginMode = true;

        // Switch between login and signup with smooth animations
        switchLink.addEventListener('click', () => {
            // Fade out current content
            formContent.classList.add('fade-out');
            
            setTimeout(() => {
                isLoginMode = !isLoginMode;
                
                // Clear inputs
                emailInput.value = '';
                passwordInput.value = '';
                confirmPasswordInput.value = '';

                if (isLoginMode) {
                    // Switch to Login Mode
                    formTitle.textContent = 'Welcome Back!';
                    formSubtitle.textContent = 'Log in to continue';
                    submitBtn.textContent = 'Log In';
                    switchText.textContent = "Don't have an Account?";
                    switchLink.textContent = 'Sign Up';
                    confirmPasswordGroup.style.display = 'none';
                    confirmPasswordInput.removeAttribute('required');
                } else {
                    // Switch to Signup Mode
                    formTitle.textContent = 'Sign Up Now!';
                    formSubtitle.textContent = 'Create your account';
                    submitBtn.textContent = 'Sign Up';
                    switchText.textContent = 'Already have an Account?';
                    switchLink.textContent = 'Log In';
                    confirmPasswordGroup.style.display = 'block';
                    confirmPasswordInput.setAttribute('required', 'required');
                }
                
                // Fade in new content
                formContent.classList.remove('fade-out');
            }, 400);
        });

        // Form submission with loading animation
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Add loading state
            submitBtn.classList.add('loading');
            submitBtn.textContent = '';

            setTimeout(() => {
                submitBtn.classList.remove('loading');

                if (!isLoginMode) {
                    // Signup mode - validate passwords match
                    if (passwordInput.value !== confirmPasswordInput.value) {
                        submitBtn.textContent = 'Sign Up';
                        alert('Passwords do not match!');
                        return;
                    }

                    submitBtn.textContent = 'Sign Up';

                    // Show success notification with animation
                    notification.classList.add('show');

                    // Clear form and switch to login after 3 seconds
                    setTimeout(() => {
                        notification.classList.remove('show');
                        setTimeout(() => {
                            switchLink.click();
                        }, 300);
                    }, 3000);
                } else {
                    // Login mode - redirect to admin panel
                    submitBtn.textContent = 'Log In';
                    
                    // Add smooth transition
                    document.body.style.opacity = '0';
                    document.body.style.transition = 'opacity 0.5s ease';
                    
                    setTimeout(() => {
                        // Redirect to admin panel
                        window.location.href = 'adminpanel.html';
                    }, 500);
                }
            }, 1500);
        });

        // Add hover effect to inputs
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.style.transform = 'translateX(5px)';
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.style.transform = 'translateX(0)';
            });
        });