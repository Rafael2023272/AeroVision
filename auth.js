// ============================================
// NAVBAR LOGIN STATE (PUBLIC PAGES ONLY)
// ============================================
function checkLoginState() {
    const userData = localStorage.getItem('aerovision_user');
    const token = localStorage.getItem('aerovision_token');

    const loginButton = document.getElementById('login-button');
    const userProfile = document.getElementById('user-profile');

    if (!loginButton || !userProfile) return;

    // LOGGED IN
    if (userData && token) {
        let user;
        try {
            user = JSON.parse(userData);
        } catch {
            localStorage.clear();
            return;
        }

        const firstName = user.name.split(" ")[0];

        loginButton.style.display = 'none';
        userProfile.style.display = 'flex';

        userProfile.innerHTML = `
            <i class="fas fa-user-circle"></i>
            <span class="nav-user-name">Hi ${firstName}</span>
        `;

        // Click profile → admin panel
        userProfile.onclick = () => {
            window.location.href = 'adminpanel.html';
        };

    } 
    // LOGGED OUT
    else {
        loginButton.style.display = 'inline-block';
        userProfile.style.display = 'none';
    }
}

// ============================================
// RUN ONLY ON NON-ADMIN PAGES
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    checkLoginState();
});

