const authWrapper = document.getElementById('authWrapper');
        const authForm = document.getElementById('authForm');
        const formContent = document.getElementById('formContent');
        const formTitle = document.getElementById('formTitle');
        const formSubtitle = document.getElementById('formSubtitle');
        const submitBtn = document.getElementById('submitBtn');
        const switchText = document.getElementById('switchText');
        const switchLink = document.getElementById('switchLink');
        const fullNameGroup = document.getElementById('fullNameGroup');
        const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
        const notification = document.getElementById('notification');
        
        const fullNameInput = document.getElementById('fullName');
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
                fullNameInput.value = '';
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
                    fullNameGroup.style.display = 'none';
                    confirmPasswordGroup.style.display = 'none';
                    fullNameInput.removeAttribute('required');
                    confirmPasswordInput.removeAttribute('required');
                } else {
                    // Switch to Signup Mode
                    formTitle.textContent = 'Sign Up Now!';
                    formSubtitle.textContent = 'Create your account';
                    submitBtn.textContent = 'Sign Up';
                    switchText.textContent = 'Already have an Account?';
                    switchLink.textContent = 'Log In';
                    fullNameGroup.style.display = 'block';
                    confirmPasswordGroup.style.display = 'block';
                    fullNameInput.setAttribute('required', 'required');
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
                    // SIGNUP MODE
                    
                    // Validate full name
                    if (!fullNameInput.value.trim()) {
                        submitBtn.textContent = 'Sign Up';
                        alert('Please enter your full name!');
                        return;
                    }

                    // Validate passwords match
                    if (passwordInput.value !== confirmPasswordInput.value) {
                        submitBtn.textContent = 'Sign Up';
                        alert('Passwords do not match!');
                        return;
                    }

                    // Validate password length
                    if (passwordInput.value.length < 6) {
                        submitBtn.textContent = 'Sign Up';
                        alert('Password must be at least 6 characters!');
                        return;
                    }

                    submitBtn.textContent = 'Sign Up';

                    // Get initials from full name
                    const nameParts = fullNameInput.value.trim().split(' ');
                    const initials = nameParts.length >= 2 
                        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
                        : nameParts[0][0].toUpperCase();

                    // Save user data to localStorage (temporary until MongoDB is integrated)
                    const newUser = {
                        fullName: fullNameInput.value.trim(),
                        email: emailInput.value,
                        password: passwordInput.value, // In real app, this will be hashed in backend
                        avatar: initials,
                        role: 'Aviation Enthusiast',
                        accountType: 'User',
                        createdAt: new Date().toISOString()
                    };

                    // Store in localStorage
                    localStorage.setItem('aerovision_registered_user', JSON.stringify(newUser));

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
                    // LOGIN MODE
                    submitBtn.textContent = 'Log In';

                    // Get registered user from localStorage
                    const registeredUser = JSON.parse(localStorage.getItem('aerovision_registered_user'));

                    if (registeredUser && 
                        registeredUser.email === emailInput.value && 
                        registeredUser.password === passwordInput.value) {
                        
                        // Save login session
                        const userData = {
                            isLoggedIn: true,
                            email: registeredUser.email,
                            name: registeredUser.fullName,
                            role: registeredUser.role,
                            avatar: registeredUser.avatar,
                            accountType: registeredUser.accountType,
                            loginTime: new Date().toISOString()
                        };
                        localStorage.setItem('aerovision_user', JSON.stringify(userData));
                        
                        // Add smooth transition
                        document.body.style.opacity = '0';
                        document.body.style.transition = 'opacity 0.5s ease';
                        
                        setTimeout(() => {
                            // Redirect to admin panel
                            window.location.href = 'adminpanel.html';
                        }, 500);
                    } else {
                        alert('Invalid email or password! Please sign up if you don\'t have an account.');
                    }
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


        // Toggle between login and sign-up forms
        function toggleForm(formType) {
            if (formType === 'signup') {
                document.getElementById('login-form').style.display = 'none';
                document.getElementById('signup-form').style.display = 'block';
            } else if (formType === 'login') {
                document.getElementById('signup-form').style.display = 'none';
                document.getElementById('login-form').style.display = 'block';
            }
        }
    
        // Handle the Sign-Up Form Submission
        async function signUp(event) {
            event.preventDefault(); // Prevent default form submission behavior
    
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                First_name: document.getElementById('First_name').value,
            };
    
            try {
                const response = await fetch('http://localhost:4000/api/user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
    
                const data = await response.json();
    
                if (response.status === 201) {
                    // Success - user created
                    alert('User created successfully!');
                    // Optionally, you can redirect to a login page or clear the form
                    toggleForm('login'); // Switch to login form after successful sign-up
                } else {
                    // Handle errors
                    alert(data.message || 'Error occurred');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while creating the user');
            }
        }
    
        // Handle the Login Form Submission
        async function login(event) {
            event.preventDefault(); // Prevent default form submission behavior
    
            // Get form data
            const formData = {
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
            };
    
            try {
                const response = await fetch('http://localhost:4000/api/user/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
    
                const data = await response.json();
    
                if (response.status === 200) {
                    // Success - login successful
                    alert('Login successful!');
                    // Redirect user to the dashboard or home page
                    window.location.href = 'index.html'; // Example redirect
                } else {
                    // Handle errors
                    alert(data.message || 'Invalid email or password');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred during login');
            }
        }

    