// ============================================
// LOGIN FUNCTION
// ============================================
async function loginUser(email, password) {
    try {
        const res = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || 'Login failed');
            return;
        }

        // SAVE SESSION
        localStorage.setItem('aerovision_user', JSON.stringify(data.user));
        localStorage.setItem('aerovision_token', data.token);

        // REDIRECT (ONE SOURCE OF TRUTH)
        window.location.href = 'adminpanel.html';

    } catch (err) {
        console.error(err);
        alert('Error logging in.');
    }
}

// ============================================
// NAVBAR LOGIN STATE (PUBLIC PAGES ONLY)
// ============================================
function checkLoginState() {
    const userData = localStorage.getItem('aerovision_user');
    const token = localStorage.getItem('aerovision_token');

    const loginButton = document.getElementById('login-button');
    const userProfile = document.getElementById('user-profile');

    // IF NAVBAR DOESN'T EXIST → DO NOTHING
    if (!loginButton && !userProfile) return;

    if (userData && token) {
        const user = JSON.parse(userData);

        if (loginButton) loginButton.style.display = 'none';

        if (userProfile) {
            userProfile.style.display = 'flex';
            userProfile.innerHTML = `
                <div class="nav-user-avatar">${user.name.charAt(0).toUpperCase()}</div>
                <span>${user.name}</span>
            `;

            // CLICK → ADMIN PANEL
            userProfile.onclick = () => {
                window.location.href = 'adminpanel.html';
            };
        }
    } else {
        if (loginButton) loginButton.style.display = 'block';
        if (userProfile) userProfile.style.display = 'none';
    }
}

// ============================================
// RUN ONLY ON NON-ADMIN PAGES
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.includes('adminpanel')) {
        checkLoginState();
    }
});


