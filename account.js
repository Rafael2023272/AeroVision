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
let lastScrollTop = 0;

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
// AUTH FORM LOGIC
// ============================================
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

// ============================================
// SWITCH LOGIN / SIGNUP
// ============================================
switchLink.addEventListener('click', () => {
    formContent.classList.add('fade-out');

    setTimeout(() => {
        isLoginMode = !isLoginMode;

        fullNameInput.value = '';
        emailInput.value = '';
        passwordInput.value = '';
        confirmPasswordInput.value = '';

        if (isLoginMode) {
            formTitle.textContent = 'Welcome Back!';
            formSubtitle.textContent = 'Log in to continue';
            submitBtn.textContent = 'Log In';
            switchText.textContent = "Don't have an Account?";
            switchLink.textContent = 'Sign Up';
            fullNameGroup.style.display = 'none';
            confirmPasswordGroup.style.display = 'none';
        } else {
            formTitle.textContent = 'Sign Up Now!';
            formSubtitle.textContent = 'Create your account';
            submitBtn.textContent = 'Sign Up';
            switchText.textContent = 'Already have an Account?';
            switchLink.textContent = 'Log In';
            fullNameGroup.style.display = 'block';
            confirmPasswordGroup.style.display = 'block';
        }

        formContent.classList.remove('fade-out');
    }, 400);
});

// ============================================
// GOOGLE SIGN-IN HANDLER
// ============================================
function handleGoogleSignIn(response) {
    const idToken = response.credential;

    submitBtn.classList.add('loading');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '';

    fetch('http://localhost:4000/api/user/google-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken })
    })
    .then(res => res.json())
    .then(data => {
        submitBtn.classList.remove('loading');
        submitBtn.textContent = originalText;

        if (!data.success) {
            alert(data.message || 'Google Sign-In failed');
            return;
        }

        // ✅ STORE TOKEN
        localStorage.setItem('aerovision_token', data.token);

        // ✅ STORE USER DATA
        localStorage.setItem('aerovision_user', JSON.stringify({
            email: data.user.email,
            name: data.user.name,
            picture: data.user.picture,
            role: data.user.role,
            loginMethod: 'google'
        }));

        fadeRedirect('adminpanel.html');
    })
    .catch(() => {
        submitBtn.classList.remove('loading');
        submitBtn.textContent = originalText;
        alert('Google Sign-In error');
    });
}

window.handleGoogleSignIn = handleGoogleSignIn;

// ============================================
// FORM SUBMISSION
// ============================================
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn.classList.add('loading');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '';

    try {
        if (!isLoginMode) {
            // ===== SIGNUP =====
            if (passwordInput.value !== confirmPasswordInput.value) {
                alert('Passwords do not match');
                resetBtn();
                return;
            }

            const response = await fetch('http://localhost:4000/api/user/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: fullNameInput.value.trim(),
                    email: emailInput.value,
                    password: passwordInput.value
                })
            });

            const data = await response.json();
            resetBtn();

            if (response.ok) {
                notification.classList.add('show');
                setTimeout(() => {
                    notification.classList.remove('show');
                    switchLink.click();
                }, 2500);
            } else {
                alert(data.message || 'Signup failed');
            }

        } else {
            // ===== LOGIN =====
            const response = await fetch('http://localhost:4000/api/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: emailInput.value,
                    password: passwordInput.value
                })
            });

            const data = await response.json();
            resetBtn();

            if (!response.ok) {
                alert(data.message || 'Invalid login');
                return;
            }

            // ✅ STORE TOKEN
            localStorage.setItem('aerovision_token', data.token);

            // ✅ STORE USER DATA
            localStorage.setItem('aerovision_user', JSON.stringify({
                email: data.user.email,
                name: data.user.name,
                role: data.user.role,
                loginMethod: 'email'
            }));

            fadeRedirect('adminpanel.html');
        }
    } catch {
        resetBtn();
        alert('Backend error (check localhost:4000)');
    }
});

// ============================================
// HELPERS
// ============================================
function resetBtn() {
    submitBtn.classList.remove('loading');
    submitBtn.textContent = isLoginMode ? 'Log In' : 'Sign Up';
}

function fadeRedirect(url) {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
        window.location.href = url;
    }, 500);
}
