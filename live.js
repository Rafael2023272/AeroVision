// CONFIGURATION

const CONFIG = {
  UPDATE_INTERVAL: 30000, // 30s for stability
  DEFAULT_VIEW: [20, 0],
  DEFAULT_ZOOM: 2,
  API_URL: 'http://localhost:4000/api/aircraft',
};

// STATE MANAGEMENT
const state = {
  aircraftMarkers: {},
  minAltitude: 1000,
  minSpeed: 0,
  planeCount: 0,
  updateInterval: null
};

// MAP INITIALIZATION
let map;

function initializeMap() {
  map = L.map('map', {
    zoomControl: false
  }).setView(CONFIG.DEFAULT_VIEW, CONFIG.DEFAULT_ZOOM);

  // Add zoom control to top-left
  L.control.zoom({ position: 'topleft' }).addTo(map);

  // Dark map tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map);
}

// UTILITY FUNCTIONS
function createPlaneIcon(heading = 0, speed = 0) {
  const color = '#9ca3af'; // neutral gray
  return L.divIcon({
    className: '',
    html: `<div style="
            transform: rotate(${heading}deg);
            color: ${color};
            font-size: 20px;
            filter: drop-shadow(0 0 6px ${color});
            transition: all 0.3s ease;">✈</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
}

function formatSpeed(speedMs) {
  if (speedMs == null) return 'N/A';
  return `${(speedMs * 3.6).toFixed(0)} km/h`;
}

function getAirlineName(callsign) {
  if (!callsign) return "Unknown Airline";

  const clean = callsign.trim().toUpperCase();

  // Check 3-letter ICAO first, then 2-letter IATA
  for (const prefix of Object.keys(airlineMap)) {
    if (clean.startsWith(prefix)) {
      return airlineMap[prefix];
    }
  }

  return "Unknown Airline";
}

function getAirlineName(callsign) {
  if (!callsign) return "Unknown Airline";

  const clean = callsign.trim().toUpperCase();

  const airlineMap = {
    EK: "Emirates",
    QR: "Qatar Airways",
    QTR: "Qatar Airways",
    BA: "British Airways",
    BAW: "British Airways",
    EY: "Etihad Airways",
    ETD: "Etihad Airways",
    LH: "Lufthansa",
    DL: "Delta Air Lines",
    AA: "American Airlines",
    UA: "United Airlines",
    AF: "Air France",
    KLM: "KLM Royal Dutch Airlines",
  };

  for (const prefix in airlineMap) {
    if (clean.startsWith(prefix)) {
      return airlineMap[prefix];
    }
  }

  return "Unknown Airline";
}



function formatAltitude(altitudeM) {
  if (!altitudeM) return 'N/A';
  const altitudeFt = (altitudeM * 3.28084).toFixed(0);
  return `${altitudeM.toFixed(0)} m (${altitudeFt} ft)`;
}

function createPopupContent(aircraft) {
  const airlineName = getAirlineName(aircraft.callsign);
  const flightNumber = aircraft.callsign?.trim() || "N/A";

  return `
    <div class="popup-content">
      <div class="popup-header">
        <span class="popup-callsign">
          ${airlineName} • ${flightNumber}
        </span>
      </div>

      <div class="popup-details">
        <div class="popup-row">
          <span class="popup-label">Altitude</span>
          <span class="popup-value">${formatAltitude(aircraft.altitude)}</span>
        </div>
        <div class="popup-row">
          <span class="popup-label">Speed</span>
          <span class="popup-value">${formatSpeed(aircraft.speed)}</span>
        </div>
        <div class="popup-row">
          <span class="popup-label">Heading</span>
          <span class="popup-value">${aircraft.heading.toFixed(0)}°</span>
        </div>
        <div class="popup-row">
          <span class="popup-label">Origin</span>
          <span class="popup-value">${aircraft.country}</span>
        </div>
      </div>
    </div>
  `;
}


// DATA FETCHING & RENDERING
async function loadAircraftData() {
  showLoading(true);
  try {
    const response = await fetch(CONFIG.API_URL);
    const data = await response.json();
    if (!data.states) {
      console.warn('No aircraft data received');
      showLoading(false);
      return;
    }

    const bounds = map.getBounds();
    const newIcaoSet = new Set();
    let visibleCount = 0;

    data.states.forEach(planeData => {
      const aircraft = parseAircraftData(planeData);

      if (!isValidAircraft(aircraft)) return;
      if (!meetsFilterCriteria(aircraft)) return;

      // Only apply bounds filter when zoomed in
      if (map.getZoom() > 4 && !bounds.contains([aircraft.lat, aircraft.lon])) return;

      newIcaoSet.add(aircraft.icao);
      visibleCount++;

      updateOrCreateMarker(aircraft);
    });

    removeStaleMarkers(newIcaoSet);
    updateStats(visibleCount);
  } catch (error) {
    console.error('Error loading aircraft data:', error);
  } finally {
    showLoading(false);
  }
}

function parseAircraftData(data) {
  return {
    icao: data[0],
    callsign: (data[1] || 'Unknown').trim(),
    country: data[2] || 'Unknown',
    lat: data[6],
    lon: data[5],
    altitude: data[7] || 0,
    speed: data[9] || 0,
    heading: data[10] || 0
  };
}

function isValidAircraft(aircraft) {
  return (
    aircraft.lat !== null &&
    aircraft.lon !== null &&
    !isNaN(aircraft.lat) &&
    !isNaN(aircraft.lon)
  );
}

function meetsFilterCriteria(aircraft) {
  if (aircraft.altitude < state.minAltitude) return false;
  if (aircraft.speed < state.minSpeed) return false;
  return true;
}

function updateOrCreateMarker(aircraft) {
  if (state.aircraftMarkers[aircraft.icao]) {
    const marker = state.aircraftMarkers[aircraft.icao];
    marker.setLatLng([aircraft.lat, aircraft.lon]);
    marker.setIcon(createPlaneIcon(aircraft.heading, aircraft.speed));
  } else {
    const marker = L.marker([aircraft.lat, aircraft.lon], {
      icon: createPlaneIcon(aircraft.heading, aircraft.speed)
    }).addTo(map);

    marker.bindPopup(createPopupContent(aircraft), {
      maxWidth: 300,
      className: 'custom-popup'
    });

    state.aircraftMarkers[aircraft.icao] = marker;
  }
}

function removeStaleMarkers(activeIcaoSet) {
  Object.keys(state.aircraftMarkers).forEach(icao => {
    if (!activeIcaoSet.has(icao)) {
      map.removeLayer(state.aircraftMarkers[icao]);
      delete state.aircraftMarkers[icao];
    }
  });
}

// UI UPDATES
function updateStats(count) {
  state.planeCount = count;
  document.getElementById('planeCount').textContent = count;

  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  document.getElementById('updateTime').textContent = timeString;
}

function showLoading(show) {
  const indicator = document.getElementById('loadingIndicator');
  if (indicator) {
    indicator.classList.toggle('active', show);
  }
}

// CONTROLS & INTERACTIONS
function setupControls() {
  const altSlider = document.getElementById('altSlider');
  const altValue = document.getElementById('altValue');
  const altFill = document.getElementById('altFill');

  if (altSlider) {
    altSlider.addEventListener('change', (e) => {
      const value = e.target.value;
      state.minAltitude = Number(value);
      altValue.textContent = value;
      altFill.style.width = `${(value / 10000) * 100}%`;
      loadAircraftData();
    });
  }

  const speedSlider = document.getElementById('speedSlider');
  const speedValue = document.getElementById('speedValue');
  const speedFill = document.getElementById('speedFill');

  if (speedSlider) {
    speedSlider.addEventListener('change', (e) => {
      const value = e.target.value;
      state.minSpeed = Number(value);
      speedValue.textContent = value;
      speedFill.style.width = `${(value / 300) * 100}%`;
      loadAircraftData();
    });
  }

  map.on('moveend', () => {
    loadAircraftData();
  });
}

// GLOBAL FUNCTIONS
function refreshData() {
  loadAircraftData();
}

function resetView() {
  map.setView(CONFIG.DEFAULT_VIEW, CONFIG.DEFAULT_ZOOM);
}

// INITIALIZATION
function initialize() {
  initializeMap();
  setupControls();
  loadAircraftData();

  state.updateInterval = setInterval(loadAircraftData, CONFIG.UPDATE_INTERVAL);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

window.addEventListener('beforeunload', () => {
  if (state.updateInterval) clearInterval(state.updateInterval);
});


// ==============================================
// BURGER MENU 
// ==============================================

// Toggle mobile menu
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.querySelector('.hamburger');
    
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
    
    // Move auth buttons to mobile menu
    moveAuthToMobile();
}

// Move auth elements based on screen size
function moveAuthToMobile() {
    const navLinks = document.getElementById('navLinks');
    const navActions = document.querySelector('.nav-actions');
    const loginButton = document.getElementById('login-button');
    const userProfile = document.getElementById('user-profile');
    
    // Check if we're on mobile/tablet (1024px and below)
    if (window.innerWidth <= 1024) {
        // Check if mobile-auth container exists, if not create it
        let mobileAuth = navLinks.querySelector('.mobile-auth');
        if (!mobileAuth) {
            mobileAuth = document.createElement('li');
            mobileAuth.className = 'mobile-auth';
            navLinks.appendChild(mobileAuth);
        }
        
        // Move login button and user profile to mobile menu
        if (loginButton && !mobileAuth.contains(loginButton)) {
            mobileAuth.appendChild(loginButton);
        }
        if (userProfile && !mobileAuth.contains(userProfile)) {
            mobileAuth.appendChild(userProfile);
        }
    } else {
        // Move back to nav-actions on desktop (above 1024px)
        if (loginButton && !navActions.contains(loginButton)) {
            navActions.appendChild(loginButton);
        }
        if (userProfile && !navActions.contains(userProfile)) {
            navActions.appendChild(userProfile);
        }
        
        // Remove mobile-auth container if it exists
        const mobileAuth = navLinks.querySelector('.mobile-auth');
        if (mobileAuth) {
            mobileAuth.remove();
        }
    }
}

// Close menu when clicking on a link
document.addEventListener('DOMContentLoaded', () => {
    // Initialize auth placement
    moveAuthToMobile();
    
    // Add click handlers to nav links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            const navLinks = document.getElementById('navLinks');
            const hamburger = document.querySelector('.hamburger');
            
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    const nav = document.querySelector('nav');
    const navLinks = document.getElementById('navLinks');
    const hamburger = document.querySelector('.hamburger');
    
    if (!nav.contains(e.target) && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// Re-check on window resize
window.addEventListener('resize', () => {
    moveAuthToMobile();
    
    // Close menu if resized to desktop
    if (window.innerWidth > 1024) {
        const navLinks = document.getElementById('navLinks');
        const hamburger = document.querySelector('.hamburger');
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    }
});