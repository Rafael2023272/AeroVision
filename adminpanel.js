// ============================================
// GLOBAL VARIABLES
// ============================================
let lastScrollTop = 0;
let currentImageIndex = 0;

// ============================================
// AUTHENTICATION CHECK - PROTECT ADMIN PAGE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('aerovision_token');
    const userData = localStorage.getItem('aerovision_user');

    if (!token || !userData) {
        window.location.href = 'account.html';
        return;
    }

    const user = JSON.parse(userData);
    loadUserProfile(user);
    setupNavbarProfile(user);
    attachSaveButtons();
    loadSavedAircraft(); // Load saved aircraft on page load
});

// ============================================
// NAVBAR PROFILE BUTTON (USERNAME + AVATAR)
// ============================================
function setupNavbarProfile(user) {
    const profileBtn = document.getElementById('nav-profile-btn');
    if (!profileBtn) return;

    const initials = getInitials(user.name);

    profileBtn.innerHTML = `
        <div class="nav-avatar">${initials}</div>
        <span class="nav-username">${user.name}</span>
    `;

    profileBtn.style.display = 'flex';

    profileBtn.addEventListener('click', () => {
        window.location.href = 'admin.html';
    });
}

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
// NAVBAR - Hide/Show on Scroll
// ============================================
const nav = document.querySelector('nav');
const scrollThreshold = 100;

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
// AVATAR INITIALS GENERATOR
// ============================================
function getInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length === 1
        ? parts[0].substring(0, 2).toUpperCase()
        : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ============================================
// USER PROFILE MANAGEMENT
// ============================================
function loadUserProfile(user) {
    const initials = getInitials(user.name);

    const avatarElement = document.getElementById('userAvatar');
    if (avatarElement) avatarElement.textContent = initials;

    const nameEl = document.getElementById('userName');
    if (nameEl) nameEl.textContent = user.name || 'User';

    const roleEl = document.getElementById('userRole');
    if (roleEl) roleEl.textContent = user.role || 'Aviation Enthusiast';

    const headerLeft = document.querySelector('.header-left h1');
    if (headerLeft) {
        headerLeft.textContent = `Welcome back, ${user.name.split(' ')[0]}!`;
    }
}

// ============================================
// LOGOUT MODAL & FUNCTIONS
// ============================================
function showLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) modal.classList.add('show');
}

function closeLogoutModal() {
    const modal = document.getElementById('logoutModal');
    if (modal) modal.classList.remove('show');
}

const logoutModal = document.getElementById('logoutModal');
if (logoutModal) {
    logoutModal.addEventListener('click', function(e) {
        if (e.target === this) closeLogoutModal();
    });
}

function confirmLogout() {
    localStorage.removeItem('aerovision_token');
    localStorage.removeItem('aerovision_user');
    window.location.href = 'index.html';
}

// ============================================
// NOTIFICATION BELL ANIMATION
// ============================================
const notificationBell = document.querySelector('.notification-bell');
if (notificationBell) {
    notificationBell.addEventListener('click', function() {
        this.style.animation = 'none';
        setTimeout(() => { this.style.animation = ''; }, 10);
    });
}

// ============================================
// SAVE AIRCRAFT FUNCTION
// ============================================
async function saveAircraftCard(aircraftData) {
    const userData = localStorage.getItem('aerovision_user');
    if (!userData) {
        alert('Please log in to save aircraft.');
        return;
    }

    const user = JSON.parse(userData);

    try {
        const res = await fetch('http://localhost:4000/api/users/save-aircraft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                aircraft: aircraftData
            })
        });

        if (res.ok) {
            alert(`${aircraftData.name} saved to your dashboard!`);
        } else {
            const text = await res.text();
            console.error('Save aircraft failed:', text);
            alert('Failed to save aircraft. Try again.');
        }
    } catch (err) {
        console.error('Error saving aircraft:', err);
        alert('Error saving aircraft. Check console for details.');
    }
}

// ============================================
// ATTACH SAVE BUTTONS (SAFE)
// ============================================
function attachSaveButtons() {
    document.querySelectorAll('.save-btn').forEach(button => {
        button.addEventListener('click', e => {
            e.stopPropagation();

            const card = button.closest('.card-wrapper');
            if (!card) return;

            const aircraftData = {
                name: card.querySelector('.card-title')?.textContent || '',
                image: card.querySelector('img')?.src || '',
                passengers: card.querySelector('.spec-item:nth-child(1) .spec-value')?.textContent || '',
                cruiseSpeed: card.querySelector('.spec-item:nth-child(2) .spec-value')?.textContent || '',
                wingspan: card.querySelector('.spec-item:nth-child(3) .spec-value')?.textContent || '',
                fuselageWidth: card.querySelector('.spec-item:nth-child(4) .spec-value')?.textContent || '',
                maxAltitude: card.querySelector('.spec-item:nth-child(5) .spec-value')?.textContent || '',
                maxTakeoffWeight: card.querySelector('.spec-item:nth-child(6) .spec-value')?.textContent || '',
                length: card.querySelector('.spec-item:nth-child(7) .spec-value')?.textContent || '',
                range: card.querySelector('.spec-item:nth-child(8) .spec-value')?.textContent || '',
                cabinWidth: card.querySelector('.spec-item:nth-child(9) .spec-value')?.textContent || ''
            };

            saveAircraftCard(aircraftData);
        });
    });
}

// ============================================
// LOAD SAVED AIRCRAFT
// ============================================
async function loadSavedAircraft() {
    const userData = localStorage.getItem('aerovision_user');
    if (!userData) return;

    const user = JSON.parse(userData);
    const container = document.getElementById('savedAircraftContainer');
    if (!container) return;

    try {
        const res = await fetch(`http://localhost:4000/api/users/${user.id}`);
        if (!res.ok) throw new Error('Failed to fetch saved aircraft');

        const userInfo = await res.json();
        const savedAircraft = userInfo.savedAircraft || [];

        container.innerHTML = '';

        if (savedAircraft.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No saved aircraft yet</p>
                    <p>Start exploring to bookmark your favorite models</p>
                </div>
            `;
            return;
        }

        savedAircraft.forEach((aircraft, index) => {
            const card = document.createElement('div');
            card.className = 'saved-aircraft-card';
            card.innerHTML = `
                <img src="${aircraft.image}" alt="${aircraft.name}">
                <div class="card-content">
                    <h4>${aircraft.name}</h4>
                    <div class="specs-grid">
                        <p><strong>Passengers:</strong> ${aircraft.passengers}</p>
                        <p><strong>Range:</strong> ${aircraft.range}</p>
                        <p><strong>Cruise Speed:</strong> ${aircraft.cruiseSpeed}</p>
                        <p><strong>Wingspan:</strong> ${aircraft.wingspan}</p>
                    </div>
                    <div class="card-actions">
                        <button class="edit-aircraft-btn" data-index="${index}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="delete-aircraft-btn" data-index="${index}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        // Attach edit event listeners
        document.querySelectorAll('.edit-aircraft-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const idx = parseInt(e.target.closest('.edit-aircraft-btn').dataset.index);
                await showEditModal(savedAircraft[idx], idx);
            });
        });

        // Attach delete event listeners
        document.querySelectorAll('.delete-aircraft-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const idx = e.target.closest('.delete-aircraft-btn').dataset.index;
                if (confirm('Are you sure you want to delete this aircraft?')) {
                    await deleteSavedAircraft(idx);
                }
            });
        });

    } catch (err) {
        console.error('Error loading saved aircraft:', err);
    }
}

// ============================================
// SHOW EDIT MODAL
// ============================================
function showEditModal(aircraft, index) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('editAircraftModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'editAircraftModal';
        modal.className = 'logout-modal';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="logout-modal-content" style="max-width: 600px;">
            <div class="logout-modal-header">
                <h3>Edit Aircraft Details</h3>
            </div>
            <div style="padding: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Name:</label>
                        <input type="text" id="edit-name" value="${aircraft.name}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Passengers:</label>
                        <input type="text" id="edit-passengers" value="${aircraft.passengers}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Cruise Speed:</label>
                        <input type="text" id="edit-cruiseSpeed" value="${aircraft.cruiseSpeed}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Wingspan:</label>
                        <input type="text" id="edit-wingspan" value="${aircraft.wingspan}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Range:</label>
                        <input type="text" id="edit-range" value="${aircraft.range}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Max Altitude:</label>
                        <input type="text" id="edit-maxAltitude" value="${aircraft.maxAltitude}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Fuselage Width:</label>
                        <input type="text" id="edit-fuselageWidth" value="${aircraft.fuselageWidth}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Length:</label>
                        <input type="text" id="edit-length" value="${aircraft.length}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Max Takeoff Weight:</label>
                        <input type="text" id="edit-maxTakeoffWeight" value="${aircraft.maxTakeoffWeight}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Cabin Width:</label>
                        <input type="text" id="edit-cabinWidth" value="${aircraft.cabinWidth}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                    </div>
                </div>
                <div style="margin-top: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Image URL:</label>
                    <input type="text" id="edit-image" value="${aircraft.image}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 5px;">
                </div>
            </div>
            <div class="logout-modal-actions">
                <button class="modal-btn modal-btn-cancel" onclick="closeEditModal()">Cancel</button>
                <button class="modal-btn modal-btn-logout" onclick="saveAircraftUpdate(${index})">Save Changes</button>
            </div>
        </div>
    `;

    modal.classList.add('show');

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeEditModal();
    });
}

// ============================================
// CLOSE EDIT MODAL
// ============================================
function closeEditModal() {
    const modal = document.getElementById('editAircraftModal');
    if (modal) modal.classList.remove('show');
}

// ============================================
// SAVE AIRCRAFT UPDATE
// ============================================
async function saveAircraftUpdate(index) {
    const userData = localStorage.getItem('aerovision_user');
    if (!userData) return;

    const user = JSON.parse(userData);

    const updatedAircraft = {
        name: document.getElementById('edit-name').value,
        image: document.getElementById('edit-image').value,
        passengers: document.getElementById('edit-passengers').value,
        cruiseSpeed: document.getElementById('edit-cruiseSpeed').value,
        wingspan: document.getElementById('edit-wingspan').value,
        fuselageWidth: document.getElementById('edit-fuselageWidth').value,
        maxAltitude: document.getElementById('edit-maxAltitude').value,
        maxTakeoffWeight: document.getElementById('edit-maxTakeoffWeight').value,
        length: document.getElementById('edit-length').value,
        range: document.getElementById('edit-range').value,
        cabinWidth: document.getElementById('edit-cabinWidth').value
    };

    try {
        const res = await fetch(`http://localhost:4000/api/users/${user.id}/update-aircraft`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ index, aircraft: updatedAircraft })
        });

        if (res.ok) {
            alert('Aircraft updated successfully!');
            closeEditModal();
            loadSavedAircraft();
        } else {
            const text = await res.text();
            console.error('Failed to update aircraft:', text);
            alert('Failed to update aircraft. Try again.');
        }
    } catch (err) {
        console.error('Error updating aircraft:', err);
        alert('Error updating aircraft.');
    }
}

// ============================================
// DELETE SAVED AIRCRAFT
// ============================================
async function deleteSavedAircraft(index) {
    const userData = localStorage.getItem('aerovision_user');
    if (!userData) return;

    const user = JSON.parse(userData);

    try {
        const res = await fetch(`http://localhost:4000/api/users/${user.id}/remove-aircraft`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ index })
        });

        if (res.ok) {
            alert('Aircraft deleted successfully!');
            loadSavedAircraft();
        } else {
            const text = await res.text();
            console.error('Failed to delete aircraft:', text);
        }
    } catch (err) {
        console.error('Error deleting aircraft:', err);
    }
}

// ============================================
// CARD FLIP HANDLER
// ============================================
document.addEventListener('click', e => {
    const card = e.target.closest('.card-wrapper .card');
    if (card) card.classList.toggle('flipped');
});