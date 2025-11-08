  // ============================================
// GLOBAL VARIABLES
// ============================================
let lastScrollTop = 0;
let parallaxTicking = false;  // Renamed to avoid conflict
let aircraftTicking = false;  // Renamed to avoid conflict
let currentImageIndex = 0;
let sectionInView = false;
let isInteractive = false;

// ============================================
// NAVIGATION MENU - Toggle & Click Outside
// ============================================
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// Close menu when clicking outside of navigation
document.addEventListener('click', function(event) {
    const nav = document.querySelector('nav');
    const navLinks = document.getElementById('navLinks');
    if (!nav.contains(event.target)) {
        navLinks.classList.remove('active');
    }
});

// ============================================
// NAVIGATION BAR - Hide/Show on Scroll
// ============================================
const nav = document.querySelector('nav');
const scrollThreshold = 100; // Start hiding after scrolling 100px

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add scrolled class for background change
    if (scrollTop > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
    
    // Hide/show navigation based on scroll direction
    if (scrollTop > scrollThreshold) {
        if (scrollTop > lastScrollTop) {
            // Scrolling down - hide nav
            nav.classList.add('nav-hidden');
        } else {
            // Scrolling up - show nav
            nav.classList.remove('nav-hidden');
        }
    }
    
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}, false);

  
  // Major Airbus and Boeing aircraft models
const aircraftModels = [
    // Airbus
    'A220-100', 'A220-300',
    'A318', 'A319', 'A320', 'A321',
    'A330-200', 'A330-300', 'A330-800', 'A330-900',
    'A340-200', 'A340-300', 'A340-500', 'A340-600',
    'A350-900', 'A350-1000',
    'A380-800',
    // Boeing
    '707-320B', '717-200', '727-200',
    '737-700', '737-800', '737-900', '737 MAX 7', '737 MAX 8', '737 MAX 9', '737 MAX 10',
    '747-400', '747-8',
    '757-200', '757-300',
    '767-200', '767-300', '767-400',
    '777-200', '777-300', '777-200ER', '777-300ER', '777-8', '777-9',
    '787-8', '787-9', '787-10'
];

const API_KEY = 'gZzYzLive50ibThmZ/4k3w==gQtREykFglTUVyf2';
const aircraftData = {};

// Initialize dropdowns
function initializeDropdowns() {
    const select1 = document.getElementById('aircraft1');
    const select2 = document.getElementById('aircraft2');

    aircraftModels.sort().forEach(model => {
        const option1 = document.createElement('option');
        option1.value = model;
        option1.textContent = model;
        select1.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = model;
        option2.textContent = model;
        select2.appendChild(option2);
    });
}

// Fetch aircraft data from API
async function fetchAircraftData(model) {
    if (aircraftData[model]) return aircraftData[model];

    try {
        const response = await fetch(`https://api.api-ninjas.com/v1/aircraft?model=${encodeURIComponent(model)}`, {
            headers: { 'X-Api-Key': API_KEY }
        });

        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();
        if (data && data.length > 0) {
            // Add image fallback if API doesn't provide
            aircraftData[model] = {
                ...data[0],
                image: data[0].image || 'https://images.unsplash.com/photo-1583792193054-c397e80e5b82?auto=format&fit=crop&w=800&q=80'
            };
            return aircraftData[model];
        }

        return null;
    } catch (error) {
        console.error('Error fetching aircraft data:', error);
        return { model, manufacturer: 'N/A', image: 'https://images.unsplash.com/photo-1583792193054-c397e80e5b82?auto=format&fit=crop&w=800&q=80' };
    }
}

// Update aircraft display
async function updateAircraftDisplay(selectId, imageContainerId) {
    const select = document.getElementById(selectId);
    const imageContainer = document.getElementById(imageContainerId);
    const model = select.value;

    if (!model) {
        imageContainer.innerHTML = '<i class="fas fa-plane placeholder-icon"></i>';
        return null;
    }

    imageContainer.innerHTML = '<div class="loading"></div>';
    const data = await fetchAircraftData(model);

    imageContainer.innerHTML = `
        <img src="${data.image}" alt="${model}" class="aircraft-image" onload="this.classList.add('loaded')">
        <div class="aircraft-label">${model}</div>
    `;
    return data;
}

// Update comparison table
function updateComparisonTable(data1, data2) {
    const specsBody = document.getElementById('specsBody');
    if (!data1 || !data2) return;

    const specs = [
        { label: 'Manufacturer', key: 'manufacturer', unit: '' },
        { label: 'Maximum Speed', key: 'max_speed_knots', unit: ' knots' },
        { label: 'Maximum Range nm', key: 'range_nautical_miles', unit: ' nm' },
        { label: 'Maximum Range km', key: 'range_nautical_miles', unit: ' km', convert: nm => Math.round(nm * 1.852) },
        { label: 'Wingspan', key: 'wingspan_ft', unit: ' ft' },
        { label: 'Wingspan', key: 'wingspan_ft', unit: ' m', convert: ft => (ft * 0.3048).toFixed(1) },
        { label: 'Length', key: 'length_ft', unit: ' ft' },
        { label: 'Length', key: 'length_ft', unit: ' m', convert: ft => (ft * 0.3048).toFixed(1) },
        { label: 'Service Ceiling', key: 'ceiling_ft', unit: ' ft' },
        { label: 'First Flight', key: 'first_flight', unit: '' }
    ];

    specsBody.innerHTML = '';
    specs.forEach(spec => {
        const row = document.createElement('tr');
        let val1 = data1[spec.key] ?? 'N/A';
        let val2 = data2[spec.key] ?? 'N/A';
        if (spec.convert && val1 !== 'N/A' && val2 !== 'N/A') {
            val1 = spec.convert(val1);
            val2 = spec.convert(val2);
        }
        row.innerHTML = `<td>${spec.label}</td><td>${val1}${val1 !== 'N/A' ? spec.unit : ''}</td><td>${val2}${val2 !== 'N/A' ? spec.unit : ''}</td>`;
        specsBody.appendChild(row);
    });

    document.getElementById('aircraft1Name').textContent = data1.model || 'Aircraft 1';
    document.getElementById('aircraft2Name').textContent = data2.model || 'Aircraft 2';
}

// Update about sections
function updateAboutSections(data1, data2) {
    const aboutSection = document.getElementById('aboutSection');
    if (!data1 || !data2) {
        aboutSection.style.display = 'none';
        return;
    }

    aboutSection.style.display = 'grid';
    document.getElementById('about1Title').textContent = `About ${data1.model}`;
    document.getElementById('about1Text').textContent = `A ${data1.manufacturer} wide-body aircraft with state-of-the-art design and exceptional range capabilities.`;
    document.getElementById('about2Title').textContent = `About ${data2.model}`;
    document.getElementById('about2Text').textContent = `A ${data2.manufacturer} long-range aircraft built for efficiency and reliability.`;
}

// Handle dropdown change
async function handleSelectionChange() {
    const data1 = await updateAircraftDisplay('aircraft1', 'image1');
    const data2 = await updateAircraftDisplay('aircraft2', 'image2');

    const emptyState = document.getElementById('emptyState');
    const specsSection = document.getElementById('specsSection');
    const saveSection = document.getElementById('saveSection');

    if (data1 && data2) {
        emptyState.style.display = 'none';
        specsSection.classList.add('active');
        saveSection.classList.add('active');
        updateComparisonTable(data1, data2);
        updateAboutSections(data1, data2);
    } else {
        emptyState.style.display = 'block';
        specsSection.classList.remove('active');
        saveSection.classList.remove('active');
    }
}

// Save comparison
function saveComparison() {
    const title = document.getElementById('comparisonTitle').value;
    const notes = document.getElementById('comparisonNotes').value;
    const aircraft1 = document.getElementById('aircraft1').value;
    const aircraft2 = document.getElementById('aircraft2').value;

    const comparison = {
        title: title || `${aircraft1} vs ${aircraft2}`,
        notes,
        aircraft1,
        aircraft2,
        date: new Date().toISOString()
    };

    alert('Comparison saved successfully!\n\n' + JSON.stringify(comparison, null, 2));
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    initializeDropdowns();
    document.getElementById('aircraft1').addEventListener('change', handleSelectionChange);
    document.getElementById('aircraft2').addEventListener('change', handleSelectionChange);
});

// Check if user is logged in
    function checkLoginState() {
        const userData = localStorage.getItem('aerovision_user');
        const loginButton = document.getElementById('login-button'); // Your login button
        const userProfile = document.getElementById('user-profile'); // User profile element (create this)
        
        if (userData) {
            const user = JSON.parse(userData);
            
            // Hide login button
            if (loginButton) {
                loginButton.style.display = 'none';
            }
            
            // Show user profile/avatar
            if (userProfile) {
                userProfile.style.display = 'flex';
                userProfile.innerHTML = `
                    <div class="nav-user-avatar">${user.avatar}</div>
                    <span>${user.name}</span>
                `;
            }
        } else {
            // Show login button
            if (loginButton) {
                loginButton.style.display = 'block';
            }
            
            // Hide user profile
            if (userProfile) {
                userProfile.style.display = 'none';
            }
        }
    }
    
    // Run on page load
    checkLoginState();