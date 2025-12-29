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

        loginButton.style.display = 'none';

        userProfile.style.display = 'flex';
        userProfile.innerHTML = `
            <div class="nav-user-avatar">
                ${getInitials(user.name)}
            </div>
            <span class="nav-user-name">${user.name}</span>
        `;

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

function getInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length === 1
        ? parts[0].substring(0, 2).toUpperCase()
        : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}



// ============================================
// RUN ONLY ON NON-ADMIN PAGES
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    checkLoginState();
});
